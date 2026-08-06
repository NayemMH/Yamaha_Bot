# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the app (Express + Vite middleware + WhatsApp client) on `http://localhost:3000`. Restart required after any `server.ts` or `vite.config.ts` change (not hot-reloaded).
- `npm run lint` — type-check the whole project (`tsc --noEmit`). There is no separate test suite; this is the only automated check.
- `npm run build` — Vite build of the frontend + esbuild bundle of `server.ts` into `dist/server.cjs`.
- `npm start` — run the production build (`node dist/server.cjs`).

No unit test runner is configured. Verify behavior with `npm run lint` plus manual `curl` calls against the running dev server's `/api/*` routes.

## Architecture

This is a single Express server (`server.ts`) that both serves the Vite-built React SPA and hosts all backend logic — there is no separate API project. In dev, Vite runs in middleware mode inside the same Express process; in production, Express serves the static `dist/` build.

**Data files are the single source of truth**, not just static content:
- `src/data/yamahaData.ts` — bike catalog, offers, service centers, FAQs.
- `src/data/aciProductsData.ts` — the full ACI multi-brand product catalog (Yamalube, CEAT, Liqui Moly, EcoFlow, GoodWe, Aiko Solar) and `SERVICE_DIAGNOSTICS_KB`, a knowledge base of ~30 rider problems each mapped to root cause, urgency, and recommended product IDs. `matchDiagnostics()` does simple keyword scoring against this KB and is used by both the chat fallback and the Service Assistant UI.
- `src/data/locationData.ts` — all 64 Bangladesh districts with upazilas, plus a Levenshtein-based `autoCorrectLocation()` fuzzy matcher (handles typos like "Sylet" → Sylhet) used by every lead/booking/consultation form.
- `src/data/techniciansData.ts` — technician-by-district and brand-representative lookup tables. **All contacts currently default to a single hardcoded person** (`DEFAULT_CONTACT` in `techniciansData.ts` = Md. Mahadi Hassan / Mahadi.Nayem@aci-bd.com / +8801787687254) — this is intentional placeholder routing until real per-territory contacts are onboarded.

`server.ts` builds its Gemini system prompt programmatically from these data files (see `buildBikeLines`/`buildProductLines`/`buildDiagnosticLines`) rather than hardcoding catalog text in the prompt — when adding a bike, product, or diagnostic issue, add it to the data file only and the prompt/UI update automatically. Every AI-facing endpoint (`/api/chat`, `/api/recommend`, `/api/analyze-engine-sound`) has a **non-AI fallback path** that runs when Gemini is unavailable, built from the same KB data — never remove these when editing prompts.

**Dispatch flow**: every lead-generating action (`/api/purchase-lead`, `/api/book-appointment`, `/api/service-consultation`, `/api/product-order-lead`) sends both an email (via `sendEmail()`, Gmail SMTP from `.env`) and a WhatsApp message (via `sendWhatsAppMessage()`) to the same resolved contact, and records the outcome in the in-memory `dispatchLogs` array (exposed at `/api/whatsapp-dispatch-logs`, rendered in `SocialIntegrationView`). `sendWhatsAppMessage()` never fakes delivery: it returns `mode: 'AUTO_SENT'` only if the WhatsApp client is actually `ready`, otherwise `'FALLBACK_LINK'` with a working `wa.me` URL.

**WhatsApp integration** (`initWhatsApp()` in `server.ts`) uses `whatsapp-web.js` with `LocalAuth`, session persisted in `.wwebjs_auth/` (gitignored — contains a live Chrome profile, never commit it). Two non-obvious environment requirements:
- It launches Puppeteer against the **system-installed Chrome** (`C:\Program Files\Google\Chrome\Application\chrome.exe` on this machine), not a bundled Chromium — the bundled-download path is unreliable in this environment.
- It overrides `whatsapp-web.js`'s default (hardcoded, stale) Chrome/101 user-agent with one matching the real installed Chrome version. A UA/binary mismatch causes WhatsApp's device-link handshake to fail with "Couldn't link device" on the phone — if that error recurs, check the UA string against the actual installed Chrome version first.
- `vite.config.ts`'s dev file watcher explicitly ignores `**/.wwebjs_auth/**` — Chrome's session cache files get locked and crash Vite's watcher (`EBUSY`) otherwise.

**Frontend**: `App.tsx` is a tab router (`AppTab` type in `Header.tsx`) rendering one view component per tab, with four alternate multi-panel `LayoutMode`s (`standard`, `split-dashboard`, `command-center`, `compact-portal`) that compose the same view components differently. `LocationPicker.tsx` is the shared zilla/upazila combobox (type-ahead + fuzzy autocorrect) reused across the chat purchase form, Service Assistant, and audio analyzer dispatch modal — new location-collecting forms should reuse it rather than reimplementing a district/upazila select.

Bike images are served from `public/assets/bikes/` (official Yamaha BD product renders, downloaded locally) and referenced by local path in `yamahaData.ts` — do not revert to hotlinked stock photo URLs.

## Component map and view responsibilities

Every top-level view is a sibling under `src/components/`, all taking `language: Language` as a prop (no i18n library — every string that needs translation is inlined as `language === 'bn' ? '...' : '...'`, duplicated per component). `onNavigateTab` callbacks let a view push the user to another tab (e.g. a chat reply linking to Booking).

- **`Header.tsx`** — owns the `AppTab` union type (the single source of truth for valid tabs) and `NAV_ITEMS`; renders both the desktop nav and a separate mobile bottom-nav from the same array. Also renders the language toggle (EN/বাংলা) and hotline banner.
- **`ChatbotView.tsx`** — the main AI chat surface. Maintains its own `messages: ChatMessage[]` state (not persisted server-side — refreshing the page loses chat history) and posts to `/api/chat`. Renders `purchaseLeadRef`/`bikeCard`/`appointmentRef` inline as rich cards when a message carries one (see `ChatMessage` in `types.ts`). Owns the purchase-lead modal (name/phone/`LocationPicker`/bike select) that calls `/api/purchase-lead`.
- **`RecommenderView.tsx`** — a 4-step quiz (budget slider → riding purpose → category/mileage → ABS) that computes the budget/upsell bike pair **client-side** from `YAMAHA_BIKES` (duplicating the logic in `/api/recommend`) for instant UI, then separately fetches `/api/recommend` to get the AI-generated persuasive pitch text (`aiPitchText`) to layer on top. If you change the upsell-selection logic, update it in both places (`server.ts`'s `/api/recommend` and this component's `handleGenerateRecommendation`) or they'll disagree.
- **`ServiceAssistantView.tsx`** — symptom-picker/free-text front end for `SERVICE_DIAGNOSTICS_KB`; the whole diagnosis → product-consent-checkboxes → `LocationPicker` → submit flow posts once to `/api/service-consultation`.
- **`AudioEngineAnalyzerView.tsx`** — real `MediaRecorder` capture (falls back to file upload if mic permission is denied), posts base64 audio to `/api/analyze-engine-sound`, then reuses the same consent/dispatch pattern as Service Assistant.
- **`PriceListAndOffersView.tsx`** — bike price grid with category filter, plus a client-side-only EMI calculator (down payment %, tenure, interest rate sliders) — this calculator does not call the server.
- **`ServiceCenterLocatorView.tsx`** — filters `SERVICE_CENTERS` by division/bike-stock/text search; "Book Now" on a center calls `onSelectCenterForBooking(centerId)` which `App.tsx` wires to switch tabs to Booking with `preSelectedCenterId` set.
- **`BookServiceView.tsx`** — appointment form posting to `/api/book-appointment`; polls `/api/appointments` after submit to refresh a "recent bookings" list (shared in-memory store, not per-user).
- **`SocialIntegrationView.tsx`** — three things bolted together: (1) a WhatsApp/Messenger chat *simulator* that round-trips through `/api/whatsapp-webhook-sim` and `/api/messenger-webhook-sim` (these are demo endpoints, not real webhook receivers), (2) the real WhatsApp connection status/QR panel wired to `/api/whatsapp-status`, (3) the live dispatch log viewer wired to `/api/whatsapp-dispatch-logs`.
- **`FAQModal.tsx`** — despite the name, a plain searchable accordion (not a modal/overlay) rendered inline at the bottom of every non-chat tab in `App.tsx`.
- **`ThemeSelectorModal.tsx`** — controls both `ThemeMode` (4 color themes: `racing-dark` default, `corporate-light`, `cyber-neon`, `championship-gold`) and `LayoutMode` (the 4 page-composition modes described above). Theme is applied globally via a `data-theme` attribute set on `document.documentElement` in `App.tsx`'s `useEffect`, then read by ad-hoc `theme === 'x' ? ... : ...` conditionals scattered in components — there is no CSS-variable/Tailwind-theme-token system, so adding a 5th theme means touching every component that branches on `theme`.

## Types contract (`src/types.ts`)

All cross-component/API payload shapes are centralized here rather than colocated with their owning component: `BikeModel`, `Offer`, `ServiceCenter`, `ServiceAppointment`, `PurchaseLead`, `ChatMessage`, `RecommendationQuizState`, `FAQItem`. `server.ts` imports `ServiceAppointment`/`PurchaseLead` from this same file, so it is the actual frontend/backend contract — update it first when changing a payload shape, then fix the resulting type errors on both sides.

# ACI Motors Yamaha AI Sales + Service + Cross-Sell Assistant — Design Spec

Date: 2026-08-06 · Approved by user in chat

## Goal

Turn the existing Yamaha BD assistant into a full ACI Motors sales, service, and
cross-sell engine: budget upsell, large service-diagnostics knowledge base,
engine-sound diagnosis, location-based technician routing, brand-representative
cross-sell dispatch (Yamalube / CEAT / Liqui Moly / EcoFlow / GoodWe / Aiko),
real WhatsApp lead dispatch, zilla+upazila location picker with fuzzy
auto-correction, corrected bike photos, and a UI refresh.

## Decisions (user-confirmed)

1. WhatsApp: real auto-send via `whatsapp-web.js` (QR scan once, LocalAuth
   persistent session). When not connected → honest fallback: wa.me
   click-to-send link, status labelled accordingly (no fake "DELIVERED").
2. Bike photos: download real model images locally into `assets/bikes/`.
3. Testing: live — real emails to Mahadi.Nayem@aci-bd.com and real WhatsApp
   messages to +8801787687254.
4. Scope: everything in one pass.
5. All technician / brand-representative emails default to
   `Mahadi.Nayem@aci-bd.com` (structured for later replacement).

## Architecture

### Data layer (single source of truth; system prompt is generated from it)

- `src/data/locationData.ts`: all 64 districts (zilla) with real upazila lists;
  Levenshtein-based fuzzy matcher `autoCorrectLocation()` returning corrected
  district/upazila + `wasCorrected` flag. Mail dispatch proceeds automatically
  with the corrected value.
- `src/data/aciProductsData.ts`: ~25 products across Yamalube, CEAT,
  Liqui Moly, EcoFlow, GoodWe, Aiko. Each has `representativeEmail`.
  `SERVICE_DIAGNOSTICS_KB`: 30+ bilingual problems, each with symptoms, root
  cause, urgency, mapped product ids, recommended action.
- `src/data/techniciansData.ts`: technicians keyed district → division →
  default; brand representatives per brand. `getTechnicianForLocation()`,
  `getRepresentativeForBrand()`.
- `src/data/yamahaData.ts`: image paths switched to local
  `/assets/bikes/<id>.(png|jpg|webp)`; correct spec mismatches.

### Server (`server.ts`)

- WhatsApp: `whatsapp-web.js` client with LocalAuth; QR exposed via
  `/api/whatsapp-status` (string for terminal + data for UI). `sendWhatsApp()`
  returns `{ delivered: boolean, mode: 'AUTO_SENT' | 'FALLBACK_LINK', waUrl }`.
- System prompt built programmatically from the data files (bikes, offers,
  products, diagnostics KB, upsell + cross-sell protocol, rural solar pitch).
- `/api/recommend`: best bike within budget + next tier above budget with
  side-by-side comparison (features gained, price delta, EMI delta).
- `/api/service-consultation` (new): { name, phone, district, upazila,
  problemKey|freeText, consentProducts } → KB match → nearest technician +
  brand reps → email + WhatsApp dispatch → returns diagnosis, products,
  dispatch summary.
- `/api/analyze-engine-sound` (new): base64 audio → Gemini multimodal →
  structured JSON diagnosis mapped to KB; rule-based fallback.
- SMTP credentials from `.env` only (remove hardcoded app password).

### Frontend

- `LocationPicker.tsx` (new): zilla + upazila comboboxes, free text with
  type-ahead + fuzzy autocorrect notice; reused in chat lead form, booking
  form, service assistant.
- `ServiceAssistantView.tsx` (new tab): symptom chips + free text + audio
  record; diagnosis card, urgency badge, product cards, consent step firing
  technician + rep dispatch.
- `AudioEngineAnalyzerView.tsx`: wired to real endpoint, structured results.
- `SocialIntegrationView.tsx`: real WhatsApp connection status + QR.
- Header/App: new tab; UI consistency pass; footer/info fixes.

### Testing

Live end-to-end: chat upsell, budget recommendation, consultation with
misspelled location, sound analysis, booking, lead submission; verify email +
WhatsApp delivery (post-QR-scan) and UI in browser.

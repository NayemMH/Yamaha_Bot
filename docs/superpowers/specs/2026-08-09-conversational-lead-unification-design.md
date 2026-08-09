# Conversational Lead Unification (Bikes + ACI Products) — Design Spec

Date: 2026-08-09 · Approved by user in chat

## Goal

Today only bike purchases have a working lead-generation path in the chatbot:
a "Buy" button opens a modal (name/phone/`LocationPicker`) that posts to
`/api/purchase-lead`. When the bot diagnoses a rider problem (low mileage,
tire slip, etc.) and recommends ACI products (Yamalube, CEAT, Liqui Moly,
EcoFlow, GoodWe, Aiko), those recommendations only ever appear as plain text
inside the reply — there is no button, no card, and no way for the customer
to turn that recommendation into a lead. The server-side pieces
(`/api/product-order-lead`, `/api/service-consultation`, `ACIProduct`,
`matchDiagnostics`) already exist but are never wired into the chat UI.

This redesigns the chat lead flow so both bike purchases and product/service
recommendations follow one consistent pattern: the bot surfaces a card, asks
"do you want this?", and — on yes — collects name, phone, and location
conversationally (in the chat itself, no popup) before auto-dispatching the
lead to the assigned salesman/technician.

## Decisions (user-confirmed)

1. Diagnosis wiring is server-side: `/api/chat` runs `matchDiagnostics()` on
   every message and returns a structured `productCard` when it finds a
   relevant issue, instead of the frontend re-guessing from regex.
2. The purchase-lead **modal is removed** for both bikes and products. Name,
   phone, and location are collected as an in-chat conversational flow (bot
   asks each field as a message, user replies inline).
3. Bikes and products/services are unified under one "ask first, then
   collect" pattern: every card (bike or product/service) shows a confirm
   button; only on confirmation does the bot start collecting contact
   details. Bikes lose their old instant-open "Buy" button in favor of this
   same confirm step.
4. Product/service leads reuse the existing `/api/service-consultation`
   endpoint (diagnosis + technician dispatch + optional consented-product
   cross-sell dispatch, already combined server-side) rather than adding a
   second endpoint call. Bike leads keep using `/api/purchase-lead` unchanged.

## Architecture

### Server (`server.ts`)

- `/api/chat`: after computing `replyText` (Gemini or local fallback), run
  `matchDiagnostics(message, 1)`. If it returns a match (score-filtered —
  only real keyword/title overlap counts, so unrelated chat gets nothing),
  resolve products via `getProductsByIds(issue.recommendedProducts)` and add
  `productCard: { issue, products }` to the JSON response. No match →
  `productCard: null`. This is additive; the existing `text`/`timestamp`
  fields and the local-fallback path are unchanged.
- `/api/purchase-lead` and `/api/service-consultation`: unchanged — both
  already accept `{ customerName, customerPhone, district, upazila, ... }`
  and handle dispatch/logging.

### Types (`src/types.ts`)

```ts
export interface ProductCard {
  issue: Pick<DiagnosticIssue,
    'id' | 'titleEn' | 'titleBn' | 'urgency' | 'rootCause' |
    'recommendedActionEn' | 'recommendedActionBn' | 'requiresTechnician'>;
  products: ACIProduct[];
}

export interface ConsultationLead {
  refCode: string;
  customerName: string;
  customerPhone: string;
  location: string;
  technicianName: string;
  technicianPhone: string;
  serviceCenterName: string;
  serviceCenterAddress: string;
  consentedProducts: string[];
  whatsappUrl?: string;
}
```

`ChatMessage` gains `productCard?: ProductCard` and
`consultationRef?: ConsultationLead`, alongside the existing `bikeCard?` and
`purchaseLeadRef?`.

### Frontend (`ChatbotView.tsx`)

**Removed:** `showPurchaseModal` state, `handleOpenPurchaseModal`,
`handleLeadSubmit`, and the modal JSX block (lines ~648-773 today). The
bike-name-detected-by-regex `showPurchaseModal` trigger inside
`handleSendMessage` (the "buy"/"purchase" keyword check) is also removed —
intent now always goes through the card's confirm button.

**Added:** a single conversational lead state machine, shared by both bike
and product/service leads:

```ts
interface LeadFlowState {
  kind: 'bike' | 'service';
  step: 'name' | 'phone' | 'location' | 'confirmLocation';
  bikeName?: string;                 // kind = 'bike'
  productCard?: ProductCard;         // kind = 'service'
  selectedProductIds?: string[];     // checkboxes on the product card, default: all checked
  name?: string;
  phone?: string;
  locationRaw?: string;
  correctedLocation?: CorrectedLocation; // from autoCorrectLocation()
}
const [leadFlow, setLeadFlow] = useState<LeadFlowState | null>(null);
```

- **Bike card** (`msg.bikeCard`): confirm button starts
  `{ kind: 'bike', step: 'name', bikeName }`. Bot appends "What's your name?".
- **Product/service card** (`msg.productCard`, new): renders issue title,
  urgency badge, root cause, recommended action, and each recommended
  product with a checkbox (default checked). Confirm button
  ("✅ Get Help From ACI Motors") starts
  `{ kind: 'service', step: 'name', productCard, selectedProductIds }` using
  whichever boxes are currently checked.
- **`handleSendMessage` interception**: when `leadFlow` is non-null, the
  typed text is NOT sent to `/api/chat`. It is appended as a normal user
  chat bubble, then routed to the current step:
  - `name` → store, ask phone, step → `phone`.
  - `phone` → validate loosely (≥10 digits); on failure, re-prompt on the
    same step; on success, store, ask location, step → `location`.
  - `location` → run `autoCorrectLocation(text)` (already client-importable
    from `locationData.ts`, same function `LocationPicker` uses), store
    `correctedLocation`, show a confirmation bubble ("Got it — Tejgaon,
    Dhaka. Correct?") with `Yes` / `Retype` quick-replies, step →
    `confirmLocation`.
  - `confirmLocation` → `Yes` submits the lead (see below); `Retype` clears
    `correctedLocation` and returns to step `location`.
  - A `Cancel` quick-reply is present at every step; selecting it clears
    `leadFlow` and the bot confirms cancellation.
- **Submission:**
  - `kind: 'bike'` → `POST /api/purchase-lead` with
    `{ customerName, customerPhone, district, upazila, preferredBike }`
    (unchanged payload shape) → renders the existing `purchaseLeadRef` card.
  - `kind: 'service'` → `POST /api/service-consultation` with
    `{ customerName, customerPhone, district, upazila, problemKey: issue.id, consentedProductIds: selectedProductIds }`
    → renders a new confirmation card using `consultationRef` (technician
    name/phone/service-center, WhatsApp deep-link button, list of consented
    products), visually modeled on the existing `purchaseLeadRef` card.
  - On success, `leadFlow` is cleared.
- **Input affordances while a flow is active:** input placeholder reflects
  the current question ("Type your name...", "Your phone number?", "Your
  district/area?"); the quick-question chip row is hidden to avoid
  derailing the flow.

## Error Handling

- Phone: light validation (≥10 digits, stripped of spaces/dashes) before
  accepting; invalid input keeps the user on the `phone` step with a retry
  message, no field is silently coerced.
- Location: `autoCorrectLocation` never throws (defaults to Dhaka on empty
  input), but the `confirmLocation` step exists specifically so a bad guess
  can be caught and retyped rather than silently sent.
- API failure (fetch throws, or JSON `success: false`): bot posts an error
  message referencing the hotline (16508) and `leadFlow` is cleared so the
  user isn't stuck mid-flow and can start over or ask something else.
- `productCard` is omitted (`null`) whenever `matchDiagnostics` finds no
  relevant issue — no card is forced onto unrelated chat turns.

## Testing

No automated test suite exists for this app (`npm run lint` is the only
check, per `CLAUDE.md`). Verification is manual against the running dev
server:

1. `npm run lint` — must pass with zero type errors.
2. Manual chat walkthrough in the browser:
   - Ask about a bike by name → bike card appears → confirm → conversational
     name/phone/location collection → `/api/purchase-lead` fires → real
     email + WhatsApp dispatch (or `FALLBACK_LINK` if WhatsApp isn't
     connected) → confirmation card renders.
   - Describe a problem covered by the diagnostics KB (e.g. "my mileage
     dropped a lot recently") → product card appears with correct issue +
     products → uncheck one product → confirm → conversational collection →
     `/api/service-consultation` fires with the right `consentedProductIds`
     → confirmation card renders.
   - Retype path: enter a garbled location, confirm it shows a sane
     autocorrected value, choose "Retype", re-enter, confirm again.
   - Cancel path: start a flow, hit Cancel mid-way, confirm chat returns to
     normal (can ask a normal question immediately after).
   - Invalid phone: type letters/short number, confirm re-prompt without
     advancing.
   - Irrelevant message (e.g. "hi"): confirm no productCard is attached.

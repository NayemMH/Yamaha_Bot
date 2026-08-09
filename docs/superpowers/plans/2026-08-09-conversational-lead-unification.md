# Conversational Lead Unification (Bikes + ACI Products) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bike-only "Buy" modal with a single conversational (in-chat) lead-collection flow shared by both bike purchases and AI-diagnosed ACI product/service recommendations, so every recommendation the bot makes can turn into a dispatched lead.

**Architecture:** `/api/chat` gains a server-computed `productCard` (diagnosis + recommended products) alongside its existing text reply. `ChatbotView.tsx` replaces its popup-modal purchase flow with a `leadFlow` state machine that asks for name → phone → location as chat messages, then submits to `/api/purchase-lead` (bikes, unchanged endpoint) or `/api/service-consultation` (products/services, unchanged endpoint) and renders a confirmation card.

**Tech Stack:** React 18 + TypeScript (frontend), Express + TypeScript (`server.ts`), no test runner — verification is `npm run lint` (`tsc --noEmit`) plus manual browser/curl walkthroughs.

## Global Constraints

- No unit test framework exists in this repo; every task's verification step is `npm run lint` plus a concrete manual check (curl for server changes, browser walkthrough for UI changes) — copied from `docs/superpowers/specs/2026-08-09-conversational-lead-unification-design.md`.
- `npm run dev` must be restarted after any `server.ts` change (not hot-reloaded) — restart before manually verifying server tasks.
- Never remove the non-AI fallback path in `/api/chat` (`generateLocalFallbackChatResponse`) — the new `productCard` logic must run regardless of whether Gemini or the fallback produced `replyText`.
- All lead dispatch (email/WhatsApp) goes to the existing `DEFAULT_CONTACT` / technician-resolution logic already in `server.ts` — do not add new contact routing.
- Reuse `autoCorrectLocation` from `src/data/locationData.ts` for location parsing — do not write a new location-matching function.

---

### Task 1: Add `ProductCard` and `ConsultationLead` types

**Files:**
- Modify: `src/types.ts`

**Interfaces:**
- Consumes: `ACIProduct` and `DiagnosticIssue` from `src/data/aciProductsData.ts` (fields confirmed: `ACIProduct { id, brand, name, category, tagline, description, priceBDT, image, keyBenefits, recommendedFor, representativeEmail }`; `DiagnosticIssue { id, problemKey, titleEn, titleBn, symptoms, rootCause, urgency, recommendedProducts, recommendedActionEn, recommendedActionBn, requiresTechnician }`).
- Produces: `ProductCard`, `ConsultationLead` types and `ChatMessage.productCard?: ProductCard`, `ChatMessage.consultationRef?: ConsultationLead` — consumed by Task 2 (server) and Tasks 3–4 (frontend).

- [ ] **Step 1: Add the import and new interfaces**

Open `src/types.ts`. Add this import at the top of the file (after the existing content, before `export interface ChatMessage`):

```ts
import type { ACIProduct, DiagnosticIssue } from './data/aciProductsData';
```

Then add these two new interfaces directly above `export interface ChatMessage {` (currently at line 110):

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

- [ ] **Step 2: Extend `ChatMessage`**

In the same file, change the `ChatMessage` interface from:

```ts
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  language?: Language;
  suggestedQuickReplies?: string[];
  bikeCard?: BikeModel;
  appointmentRef?: ServiceAppointment;
  purchaseLeadRef?: PurchaseLead;
  showPurchaseForm?: boolean;
  platform?: 'web' | 'whatsapp' | 'messenger';
}
```

to:

```ts
export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  language?: Language;
  suggestedQuickReplies?: string[];
  bikeCard?: BikeModel;
  appointmentRef?: ServiceAppointment;
  purchaseLeadRef?: PurchaseLead;
  productCard?: ProductCard;
  consultationRef?: ConsultationLead;
  showPurchaseForm?: boolean;
  platform?: 'web' | 'whatsapp' | 'messenger';
}
```

- [ ] **Step 3: Verify with the type checker**

Run: `npm run lint`
Expected: no new errors (the file now imports `ACIProduct`/`DiagnosticIssue` and both compile cleanly since they're plain data types with no circular runtime dependency — `types.ts` only imports the `type`, so there's no bundling cycle).

- [ ] **Step 4: Commit**

```bash
git add src/types.ts
git commit -m "Add ProductCard and ConsultationLead types for unified chat lead flow"
```

---

### Task 2: Wire `matchDiagnostics` into `/api/chat`

**Files:**
- Modify: `server.ts:449-486` (the `/api/chat` handler)

**Interfaces:**
- Consumes: `matchDiagnostics(text, limit)` and `getProductsByIds(ids)` from `./src/data/aciProductsData` (already imported in `server.ts:8-15`); `ProductCard` shape from Task 1 (server response is plain JSON, no need to import the type in `server.ts` — just match its field names exactly).
- Produces: `/api/chat` response now includes `productCard: { issue: {...}, products: [...] } | null` — consumed by Task 3's `handleSendMessage`.

- [ ] **Step 1: Add diagnosis lookup after `replyText` is finalized**

In `server.ts`, find this block (around line 479):

```ts
    if (!replyText) replyText = generateLocalFallbackChatResponse(message, language || 'en');

    return res.json({ text: replyText, timestamp: new Date().toISOString() });
```

Replace it with:

```ts
    if (!replyText) replyText = generateLocalFallbackChatResponse(message, language || 'en');

    const matchedIssues = matchDiagnostics(message, 1);
    const topIssue = matchedIssues[0] || null;
    const productCard = topIssue
      ? {
          issue: {
            id: topIssue.id,
            titleEn: topIssue.titleEn,
            titleBn: topIssue.titleBn,
            urgency: topIssue.urgency,
            rootCause: topIssue.rootCause,
            recommendedActionEn: topIssue.recommendedActionEn,
            recommendedActionBn: topIssue.recommendedActionBn,
            requiresTechnician: topIssue.requiresTechnician
          },
          products: getProductsByIds(topIssue.recommendedProducts)
        }
      : null;

    return res.json({ text: replyText, timestamp: new Date().toISOString(), productCard });
```

- [ ] **Step 2: Apply the same lookup to the catch-all error path**

Still in `/api/chat`, find the catch block (around line 482-485):

```ts
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.json({ text: generateLocalFallbackChatResponse(req.body?.message || '', req.body?.language || 'en'), timestamp: new Date().toISOString() });
  }
```

Leave this unchanged — it's a last-resort catch-all for unexpected errors (e.g. malformed request), and adding diagnosis lookup here is unnecessary complexity for an edge case that already degrades gracefully with `productCard` simply absent (the frontend treats a missing field as "no card", see Task 3).

- [ ] **Step 3: Restart the dev server and verify with curl**

Run: `npm run dev` (restart if already running — this file was edited)

Then in a separate terminal:

```bash
curl -s -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"my bike mileage has dropped a lot recently\",\"history\":[],\"language\":\"en\"}"
```

Expected: JSON response with a non-null `productCard` whose `issue.titleEn` names a mileage-related problem and `products` is a non-empty array of ACI product objects (check the actual `SERVICE_DIAGNOSTICS_KB` entries in `src/data/aciProductsData.ts` if the match seems off — the exact issue matched depends on keyword scoring, but it must be mileage-related, not empty).

Then:

```bash
curl -s -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d "{\"message\":\"hi\",\"history\":[],\"language\":\"en\"}"
```

Expected: `"productCard":null` (no relevant keyword match).

- [ ] **Step 4: Commit**

```bash
git add server.ts
git commit -m "Attach diagnosed productCard to /api/chat responses"
```

---

### Task 3: Replace the bike purchase modal with the conversational lead-flow state machine (bike path)

**Files:**
- Modify: `src/components/ChatbotView.tsx`

**Interfaces:**
- Consumes: `ChatMessage`, `ProductCard`, `ConsultationLead` from `../types` (Task 1); `autoCorrectLocation`, `CorrectedLocation` from `../data/locationData`; existing `/api/purchase-lead` endpoint (unchanged payload: `{ customerName, customerPhone, district, upazila, preferredBike }`, unchanged response: `{ success, lead, salesman, whatsappNotice }`).
- Produces: `LeadFlowState` type, `leadFlow` state, `handleStartBikeLead(bikeName: string)`, `handleLeadFlowInput(rawText: string)`, `appendBotText(text: string, quickReplies?: string[])`, `submitLead(flow: LeadFlowState)` — Task 4 extends `handleStartServiceLead` and the `submitLead` service-branch on top of this same state machine, and Task 5 reads `leadFlow` to adjust the input placeholder/chip visibility.

- [ ] **Step 1: Update imports**

In `src/components/ChatbotView.tsx`, replace:

```ts
import { ChatMessage, Language, BikeModel, PurchaseLead } from '../types';
import { YAMAHA_BIKES } from '../data/yamahaData';
import { LocationPicker } from './LocationPicker';
```

with:

```ts
import { ChatMessage, Language, BikeModel, PurchaseLead, ProductCard } from '../types';
import { YAMAHA_BIKES } from '../data/yamahaData';
import { autoCorrectLocation, CorrectedLocation } from '../data/locationData';
```

(`LocationPicker` is removed here because its only usage — the purchase modal — is deleted in this task. `ProductCard` is added here now so Task 4 can reference it without a further import edit.)

- [ ] **Step 2: Replace the purchase-modal state with `leadFlow` state**

Replace this block (current lines 62-79):

```ts
  // Purchase Lead Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custDistrict, setCustDistrict] = useState('Dhaka');
  const [custUpazila, setCustUpazila] = useState('Tejgaon / Central');
  const [selectedBike, setSelectedBike] = useState('Yamaha YZF R15 V4');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const [expandedLeadIds, setExpandedLeadIds] = useState<Set<string>>(new Set());

  const toggleLeadExpanded = (id: string) => {
    setExpandedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
```

with:

```ts
  interface LeadFlowState {
    kind: 'bike' | 'service';
    step: 'name' | 'phone' | 'location' | 'confirmLocation';
    bikeName?: string;
    productCard?: ProductCard;
    selectedProductIds?: string[];
    name?: string;
    phone?: string;
    locationRaw?: string;
    correctedLocation?: CorrectedLocation;
  }

  const [leadFlow, setLeadFlow] = useState<LeadFlowState | null>(null);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const [expandedLeadIds, setExpandedLeadIds] = useState<Set<string>>(new Set());

  const toggleLeadExpanded = (id: string) => {
    setExpandedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
```

- [ ] **Step 3: Add `appendBotText` and `handleStartBikeLead` helpers, replacing `handleOpenPurchaseModal`**

Replace:

```ts
  const handleOpenPurchaseModal = (bikeName?: string) => {
    if (bikeName) setSelectedBike(bikeName);
    setShowPurchaseModal(true);
  };
```

with:

```ts
  const appendBotText = (text: string, quickReplies?: string[]) => {
    setMessages(prev => [...prev, {
      id: `bot-flow-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      sender: 'bot',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuickReplies: quickReplies
    }]);
  };

  const handleStartBikeLead = (bikeName: string) => {
    if (leadFlow) return;
    setLeadFlow({ kind: 'bike', step: 'name', bikeName });
    appendBotText(
      language === 'bn' ? `দারুণ পছন্দ! আপনার নামটি বলুন:` : `Great choice! What's your name?`,
      ['Cancel']
    );
  };
```

- [ ] **Step 4: Replace `handleLeadSubmit` with `submitLead` and `handleLeadFlowInput`**

Replace the entire `handleLeadSubmit` function (current lines 92-149) with:

```ts
  const submitLead = async (flow: LeadFlowState) => {
    if (!flow.correctedLocation || !flow.name || !flow.phone) return;
    setIsSubmittingLead(true);
    try {
      if (flow.kind === 'bike') {
        const response = await fetch('/api/purchase-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: flow.name,
            customerPhone: flow.phone,
            district: flow.correctedLocation.district,
            upazila: flow.correctedLocation.upazila,
            preferredBike: flow.bikeName
          })
        });
        const data = await response.json();

        if (data.success && data.lead) {
          if (data.whatsappNotice?.whatsappUrl) {
            try {
              window.open(data.whatsappNotice.whatsappUrl, '_blank');
            } catch (e) {
              console.log('Popup blocked for automatic WhatsApp opening');
            }
          }

          setMessages(prev => [...prev, {
            id: `lead-confirm-${Date.now()}`,
            sender: 'bot',
            text: language === 'bn'
              ? `ধন্যবাদ ${flow.name}! আপনার ${flow.bikeName} বাইকটির ক্রয় সংক্রান্ত তথ্য আমাদের সিনিয়র সেলস স্পেশালিস্ট **${data.salesman.name}** (${data.salesman.location}) এর কাছে ইমেইল এবং হোয়াটসঅ্যাপে পাঠানো হয়েছে।`
              : `Thank you ${flow.name}! Your purchase inquiry for ${flow.bikeName} has been dispatched via Email & WhatsApp to Senior Sales Representative **${data.salesman.name}** (${data.salesman.location}).`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            purchaseLeadRef: { ...data.lead, whatsappNotice: data.whatsappNotice },
            suggestedQuickReplies: ['📍 Find Nearest Showroom in Dhaka', '💰 EMI Calculator & Loan Eligibility']
          }]);
        } else {
          appendBotText(language === 'bn'
            ? 'দুঃখিত, লিড পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে হটলাইন ১৬৫০৮ এ কল করুন।'
            : 'Sorry, something went wrong sending your request. Please call our hotline at 16508.');
        }
      }
    } catch (err) {
      console.error('Lead submission error:', err);
      appendBotText(language === 'bn'
        ? 'দুঃখিত, নেটওয়ার্ক সমস্যা হয়েছে। অনুগ্রহ করে হটলাইন ১৬৫০৮ এ কল করুন।'
        : 'Sorry, a network error occurred. Please call our hotline at 16508.');
    } finally {
      setIsSubmittingLead(false);
      setLeadFlow(null);
    }
  };

  const handleLeadFlowInput = async (rawText: string) => {
    if (!leadFlow) return;
    const trimmed = rawText.trim();
    const lower = trimmed.toLowerCase();

    if (lower === 'cancel' || lower.includes('বাতিল')) {
      setLeadFlow(null);
      appendBotText(language === 'bn'
        ? 'ঠিক আছে, অনুরোধটি বাতিল করা হলো। আর কিছু জানতে চাইলে বলুন।'
        : "No problem, I've cancelled that request. Let me know if there's anything else!");
      return;
    }

    if (leadFlow.step === 'name') {
      setLeadFlow({ ...leadFlow, name: trimmed, step: 'phone' });
      appendBotText(
        language === 'bn' ? 'ধন্যবাদ! আপনার মোবাইল নম্বরটি লিখুন:' : "Thanks! What's your phone number?",
        ['Cancel']
      );
      return;
    }

    if (leadFlow.step === 'phone') {
      const digits = trimmed.replace(/[^0-9]/g, '');
      if (digits.length < 10) {
        appendBotText(
          language === 'bn'
            ? 'নম্বরটি সঠিক মনে হচ্ছে না, অনুগ্রহ করে সঠিক মোবাইল নম্বর লিখুন (যেমনঃ 01700000000):'
            : "That doesn't look like a valid phone number. Please enter a valid number (e.g. 01700000000):",
          ['Cancel']
        );
        return;
      }
      setLeadFlow({ ...leadFlow, phone: trimmed, step: 'location' });
      appendBotText(
        language === 'bn' ? 'আপনার এলাকা/জেলা কোনটি?' : 'Which district/area are you in?',
        ['Cancel']
      );
      return;
    }

    if (leadFlow.step === 'location') {
      const corrected = autoCorrectLocation(trimmed);
      setLeadFlow({ ...leadFlow, locationRaw: trimmed, correctedLocation: corrected, step: 'confirmLocation' });
      const confirmText = language === 'bn'
        ? `বুঝেছি — ${corrected.upazila}, ${corrected.district}। এটা কি ঠিক আছে?`
        : `Got it — ${corrected.upazila}, ${corrected.district}. Is that correct?`;
      appendBotText(
        confirmText,
        language === 'bn' ? ['✅ হ্যাঁ, ঠিক আছে', '✏️ আবার লিখবো', 'Cancel'] : ['✅ Yes, that\'s correct', '✏️ Let me retype', 'Cancel']
      );
      return;
    }

    if (leadFlow.step === 'confirmLocation') {
      const isYes = lower.includes('yes') || lower.includes('হ্যাঁ') || lower.includes('correct') || lower.includes('ঠিক');
      const isRetype = lower.includes('retype') || lower.includes('আবার');

      if (isRetype) {
        setLeadFlow({ ...leadFlow, step: 'location', locationRaw: undefined, correctedLocation: undefined });
        appendBotText(
          language === 'bn' ? 'ঠিক আছে, আবার আপনার এলাকা/জেলা লিখুন:' : 'Sure, please type your district/area again:',
          ['Cancel']
        );
        return;
      }

      if (isYes) {
        await submitLead(leadFlow);
        return;
      }

      appendBotText(
        language === 'bn' ? '"হ্যাঁ" অথবা "আবার লিখবো" নির্বাচন করুন:' : 'Please choose "Yes, that\'s correct" or "Let me retype":',
        language === 'bn' ? ['✅ হ্যাঁ, ঠিক আছে', '✏️ আবার লিখবো', 'Cancel'] : ['✅ Yes, that\'s correct', '✏️ Let me retype', 'Cancel']
      );
    }
  };
```

- [ ] **Step 5: Intercept `handleSendMessage` when a lead flow is active, and remove the old "buy/purchase" regex trigger**

Replace the start of `handleSendMessage` (current lines 224-246):

```ts
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    // Trigger purchase modal directly if user says "buy" or "purchase" or clicks buy trigger
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('buy') || lowerQuery.includes('purchase') || lowerQuery.includes('ক্রয়') || lowerQuery.includes('কিনবো')) {
      // Find bike mentioned
      const bikeFound = YAMAHA_BIKES.find(b => lowerQuery.includes(b.name.toLowerCase()) || lowerQuery.includes(b.id.toLowerCase()));
      if (bikeFound) setSelectedBike(bikeFound.name);
      setShowPurchaseModal(true);
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsLoading(true);
```

with:

```ts
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const lowerQuery = query.toLowerCase();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');

    if (leadFlow) {
      await handleLeadFlowInput(query);
      return;
    }

    setIsLoading(true);
```

(The rest of `handleSendMessage` — the `matchedBike` detection, the `/api/chat` fetch, and error handling — is untouched here; Task 4 will add `productCard: data.productCard` to the constructed `botMsg`.)

- [ ] **Step 6: Wire the bike card's button to `handleStartBikeLead` and disable it mid-flow**

Replace:

```tsx
                    <button
                      onClick={() => handleOpenPurchaseModal(msg.bikeCard?.name)}
                      className="shrink-0 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ক্রয়' : 'Buy'}</span>
                    </button>
```

with:

```tsx
                    <button
                      onClick={() => msg.bikeCard && handleStartBikeLead(msg.bikeCard.name)}
                      disabled={!!leadFlow}
                      className="shrink-0 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'আগ্রহী' : "I'm Interested"}</span>
                    </button>
```

- [ ] **Step 7: Delete the purchase modal JSX**

Delete the entire block from `{/* Purchase Assistance Direct Modal */}` through its closing `)}` (current lines 648-773) — everything between the closing `</div>` of the Input Form section and the final closing `</div>` of the component.

- [ ] **Step 8: Run the type checker**

Run: `npm run lint`
Expected: no errors. If `PurchaseLead` or `BikeModel` are now reported unused, leave them — `noUnusedLocals` is not enabled in this project's `tsconfig.json`, so this is not a compile error; do not remove them speculatively since `PurchaseLead` describes the shape nested inside `ChatMessage.purchaseLeadRef` and is useful documentation even if not referenced by name.

- [ ] **Step 9: Manual verification (bike path end-to-end)**

Run: `npm run dev` (restart since `server.ts` was touched in Task 2)

In the browser at `http://localhost:3000`:
1. Go to the Chat tab, ask "What is the price of R15 V4?" — a bike card should appear with an "I'm Interested" button (no modal).
2. Click "I'm Interested" — bot should ask for your name as a chat message, no popup.
3. Type a name, then a phone number, then a district (try a misspelling like "Sylet") — bot should show a location-confirmation message with the corrected district.
4. Click "✅ Yes, that's correct" — a confirmation card should render with a WhatsApp dispatch button (`purchaseLeadRef`), matching the previous visual style.
5. Repeat and click "Cancel" partway through — flow should abort and normal chat should resume immediately after.
6. Repeat and enter an invalid phone (e.g. "abc") — bot should re-prompt without advancing.

- [ ] **Step 10: Commit**

```bash
git add src/components/ChatbotView.tsx
git commit -m "Replace bike purchase modal with in-chat conversational lead flow"
```

---

### Task 4: Add the product/service diagnosis card and wire it into the lead flow

**Files:**
- Modify: `src/components/ChatbotView.tsx`

**Interfaces:**
- Consumes: `ProductCard` from `../types` (Task 1), `productCard` field on the `/api/chat` response (Task 2), `LeadFlowState`/`appendBotText`/`submitLead` from Task 3, existing `/api/service-consultation` endpoint (payload: `{ customerName, customerPhone, district, upazila, problemKey, consentedProductIds, language }`; response: `{ success, refCode, diagnosis, technician: { name, phone, serviceCenterName, serviceCenterAddress, ... }, dispatches: { whatsapp: { whatsappUrl, ... } }, message }`).
- Produces: `msg.productCard` rendering, `msg.consultationRef` confirmation card, `handleStartServiceLead(msg: ChatMessage)`, product checkbox state (`deselectedProductIds`, `isProductChecked`, `toggleProductChecked`) — Task 5 does not depend on these directly but must not break them.

- [ ] **Step 1: Attach `productCard` from the `/api/chat` response**

Find the `botMsg` construction inside `handleSendMessage` (current lines 271-286):

```ts
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bikeCard: matchedBike,
        suggestedQuickReplies: language === 'bn' ? [
          '🛒 বাইকটি ক্রয় করতে চাই (সরাসরি যোগাযোগ)',
          '📅 সার্ভিস বুকিং করুন',
          '💰 ইএমআই (EMI) লোন ক্যালকুলেটর'
        ] : [
          '🛒 I Want to Purchase This Bike',
          '📅 Book Service Now',
          '💰 EMI Monthly Loan Calculator'
        ]
      };
```

Change `bikeCard: matchedBike,` to:

```ts
        bikeCard: matchedBike,
        productCard: data.productCard || undefined,
```

- [ ] **Step 2: Add product-checkbox state and helpers**

Directly below the `leadFlow`/`isSubmittingLead` state added in Task 3, add:

```ts
  const [deselectedProductIds, setDeselectedProductIds] = useState<Record<string, Set<string>>>({});

  const isProductChecked = (msgId: string, productId: string) =>
    !(deselectedProductIds[msgId]?.has(productId));

  const toggleProductChecked = (msgId: string, productId: string) => {
    setDeselectedProductIds(prev => {
      const next = { ...prev };
      const set = new Set(next[msgId] || []);
      if (set.has(productId)) set.delete(productId); else set.add(productId);
      next[msgId] = set;
      return next;
    });
  };
```

- [ ] **Step 3: Add `handleStartServiceLead`**

Directly below `handleStartBikeLead` (added in Task 3), add:

```ts
  const handleStartServiceLead = (msg: ChatMessage) => {
    if (leadFlow || !msg.productCard) return;
    const deselected = deselectedProductIds[msg.id] || new Set<string>();
    const selectedProductIds = msg.productCard.products
      .map(p => p.id)
      .filter(id => !deselected.has(id));
    setLeadFlow({ kind: 'service', step: 'name', productCard: msg.productCard, selectedProductIds });
    appendBotText(
      language === 'bn' ? 'নিশ্চয়ই সাহায্য করবো! আপনার নামটি বলুন:' : "Sure, I'll help with that! What's your name?",
      ['Cancel']
    );
  };
```

- [ ] **Step 4: Add the service-consultation branch to `submitLead`**

In `submitLead` (from Task 3), the `if (flow.kind === 'bike') { ... }` block currently has no `else`. Add an `else` branch right after its closing `}` (before the outer `catch`):

```ts
      } else {
        const response = await fetch('/api/service-consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: flow.name,
            customerPhone: flow.phone,
            district: flow.correctedLocation.district,
            upazila: flow.correctedLocation.upazila,
            problemKey: flow.productCard?.issue.id,
            consentedProductIds: flow.selectedProductIds || [],
            language
          })
        });
        const data = await response.json();

        if (data.success) {
          const consentedNames = (flow.productCard?.products || [])
            .filter(p => (flow.selectedProductIds || []).includes(p.id))
            .map(p => p.name);

          setMessages(prev => [...prev, {
            id: `consult-confirm-${Date.now()}`,
            sender: 'bot',
            text: data.message || (language === 'bn' ? 'আপনার অনুরোধ পাঠানো হয়েছে।' : 'Your request has been sent.'),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            consultationRef: {
              refCode: data.refCode,
              customerName: flow.name,
              customerPhone: flow.phone,
              location: `${flow.correctedLocation.upazila}, ${flow.correctedLocation.district}`,
              technicianName: data.technician.name,
              technicianPhone: data.technician.phone,
              serviceCenterName: data.technician.serviceCenterName,
              serviceCenterAddress: data.technician.serviceCenterAddress,
              consentedProducts: consentedNames,
              whatsappUrl: data.dispatches?.whatsapp?.whatsappUrl
            }
          }]);
        } else {
          appendBotText(language === 'bn'
            ? 'দুঃখিত, অনুরোধ পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে হটলাইন ১৬৫০৮ এ কল করুন।'
            : 'Sorry, something went wrong sending your request. Please call our hotline at 16508.');
        }
      }
```

- [ ] **Step 5: Render the product/service card**

In the message bubble JSX, directly below the closing `)}` of the bike card block (`{/* Bike Card embedded if matched */}` ... ends around current line 440), add:

```tsx
                {/* Product/Service Diagnosis Card */}
                {msg.productCard && (
                  <div className="mt-3 bg-[var(--bg-main)] border border-amber-500/40 rounded-xl p-3 text-left space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[var(--text-main)] text-xs">
                        {language === 'bn' ? msg.productCard.issue.titleBn : msg.productCard.issue.titleEn}
                      </span>
                      <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        msg.productCard.issue.urgency === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                        msg.productCard.issue.urgency === 'High' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                        msg.productCard.issue.urgency === 'Medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {msg.productCard.issue.urgency}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)]">{msg.productCard.issue.rootCause}</p>
                    <p className="text-[11px] text-[var(--text-main)]">
                      {language === 'bn' ? msg.productCard.issue.recommendedActionBn : msg.productCard.issue.recommendedActionEn}
                    </p>

                    {msg.productCard.products.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-[var(--border-color)]">
                        {msg.productCard.products.map(p => (
                          <label key={p.id} className="flex items-center gap-2 text-[11px] text-[var(--text-main)] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isProductChecked(msg.id, p.id)}
                              onChange={() => toggleProductChecked(msg.id, p.id)}
                              className="accent-emerald-500"
                            />
                            <span className="flex-1">{p.name}</span>
                            <span className="font-semibold text-emerald-400">৳{p.priceBDT.toLocaleString()}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleStartServiceLead(msg)}
                      disabled={!!leadFlow}
                      className="w-full mt-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition"
                    >
                      {language === 'bn' ? '✅ এসিআই মটরস থেকে সাহায্য নিন' : '✅ Get Help From ACI Motors'}
                    </button>
                  </div>
                )}
```

- [ ] **Step 6: Render the consultation confirmation card**

Directly below the closing `)}` of the `{/* Purchase Lead Confirmation Slip */}` block (current lines 443-526, unchanged by this plan), add:

```tsx
                {/* Service/Product Consultation Confirmation Slip */}
                {msg.consultationRef && (
                  <div className="mt-3 bg-[var(--bg-main)] border-2 border-emerald-500/60 rounded-xl p-3 text-xs text-left space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Technician Notified — {msg.consultationRef.technicianName}</span>
                    </div>

                    {msg.consultationRef.whatsappUrl && (
                      <a
                        href={msg.consultationRef.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/50 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>📱 Send Directly to WhatsApp</span>
                      </a>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-main)] pt-1">
                      <div>
                        <span className="text-[var(--text-muted)] block">Ref:</span>
                        <strong className="font-mono">{msg.consultationRef.refCode}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">Service Center:</span>
                        <strong>{msg.consultationRef.serviceCenterName}</strong>
                      </div>
                    </div>

                    {msg.consultationRef.consentedProducts.length > 0 && (
                      <div className="text-[11px] text-[var(--text-main)] border-t border-[var(--border-color)] pt-2">
                        <span className="text-[var(--text-muted)] block">Products Requested:</span>
                        <strong>{msg.consultationRef.consentedProducts.join(', ')}</strong>
                      </div>
                    )}
                  </div>
                )}
```

- [ ] **Step 7: Run the type checker**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 8: Manual verification (product/service path end-to-end)**

Run: `npm run dev` (restart if needed)

In the browser:
1. In the Chat tab, type "my bike's mileage has dropped a lot recently" — a diagnosis card should appear (title, urgency badge, root cause, recommended products with checkboxes all pre-checked).
2. Uncheck one product, then click "✅ Get Help From ACI Motors" — bot should start asking for name (no modal).
3. Complete name → phone → location → confirm, as in Task 3 Step 9.
4. Confirm a `consultationRef` card renders with ref code, service center, and only the still-checked product(s) listed under "Products Requested".
5. Check `http://localhost:3000` → Social Integration tab → dispatch log viewer (`/api/whatsapp-dispatch-logs`) to confirm the consultation dispatch was logged.
6. Type an unrelated message like "hi" — confirm no product card appears.

- [ ] **Step 9: Commit**

```bash
git add src/components/ChatbotView.tsx
git commit -m "Add product/service diagnosis card and consultation lead submission"
```

---

### Task 5: Input affordances while a lead flow is active

**Files:**
- Modify: `src/components/ChatbotView.tsx`

**Interfaces:**
- Consumes: `leadFlow` state from Task 3.
- Produces: no new exports — this is a pure UI polish task consumed by nothing else.

- [ ] **Step 1: Change the input placeholder based on `leadFlow.step`**

Find the `<input>` in the Input Form section (current lines 602-614):

```tsx
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              isListening
                ? (language === 'bn' ? 'শুনছি...' : 'Listening...')
                : language === 'bn'
                ? 'ইয়ামাহা বাইকের দাম, সার্ভিস বা যে কোনো বিষয়ে লিখুন (বাংলা বা ইংরেজি)...'
                : 'Ask YamBot about Yamaha prices, offers, specs, maintenance...'
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none"
          />
```

Replace the `placeholder` prop with:

```tsx
            placeholder={
              isListening
                ? (language === 'bn' ? 'শুনছি...' : 'Listening...')
                : leadFlow?.step === 'name'
                ? (language === 'bn' ? 'আপনার নাম লিখুন...' : 'Type your name...')
                : leadFlow?.step === 'phone'
                ? (language === 'bn' ? 'আপনার মোবাইল নম্বর লিখুন...' : 'Type your phone number...')
                : leadFlow?.step === 'location'
                ? (language === 'bn' ? 'আপনার জেলা/এলাকা লিখুন...' : 'Type your district/area...')
                : leadFlow?.step === 'confirmLocation'
                ? (language === 'bn' ? '"হ্যাঁ" অথবা "আবার লিখবো" লিখুন...' : 'Type "Yes" or "Retype"...')
                : language === 'bn'
                ? 'ইয়ামাহা বাইকের দাম, সার্ভিস বা যে কোনো বিষয়ে লিখুন (বাংলা বা ইংরেজি)...'
                : 'Ask YamBot about Yamaha prices, offers, specs, maintenance...'
            }
```

- [ ] **Step 2: Hide the quick-question chip row while a flow is active**

Find the Preset Action Buttons Grid section (current lines 571-591), starting with:

```tsx
      {/* Preset Action Buttons Grid */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
```

Wrap it in a conditional — change the opening tag's containing block by replacing:

```tsx
      {/* Preset Action Buttons Grid */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
```

with:

```tsx
      {/* Preset Action Buttons Grid */}
      {!leadFlow && (
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
```

and find the closing `</div>` for that section (the one immediately before `{/* Input Form */}`), changing:

```tsx
      </div>

      {/* Input Form */}
```

to:

```tsx
      </div>
      )}

      {/* Input Form */}
```

- [ ] **Step 3: Run the type checker**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Full manual regression walkthrough**

Run: `npm run dev` (restart if needed)

Repeat the complete Testing checklist from `docs/superpowers/specs/2026-08-09-conversational-lead-unification-design.md`:
1. Bike path: ask about a bike → confirm → full conversational collection → dispatch → confirmation card. Confirm the quick-question chips are hidden and the input placeholder changes at each step, then reappear/reset once the flow completes or is cancelled.
2. Product/service path: describe a KB-covered problem → product card → uncheck a product → confirm → full collection → `/api/service-consultation` dispatch → confirmation card with the correct consented product list.
3. Retype path: garbled location → confirm autocorrect shown → "Retype" → re-enter → confirm.
4. Cancel path at each step (name/phone/location/confirmLocation) → chat returns to normal immediately.
5. Invalid phone → re-prompt without advancing.
6. Irrelevant message ("hi") → no product card.
7. `npm run lint` passes with zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatbotView.tsx
git commit -m "Adjust chat input placeholder and hide quick-reply chips during lead flow"
```

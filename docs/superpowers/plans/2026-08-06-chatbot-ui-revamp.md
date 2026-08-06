# Chatbot UI Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `ChatbotView.tsx` respect the app's existing CSS-variable theme system (fixing `corporate-light` and the other three themes), feel like a modern messaging app instead of a webpage, and support voice input via a mic button.

**Architecture:** All changes are confined to `src/components/ChatbotView.tsx` plus one new keyframe block in `src/index.css`. No new props, no `App.tsx` changes, no new dependencies. Theming rides the existing `[data-theme="..."]` CSS custom properties already defined in `src/index.css` (`--bg-main`, `--bg-card`, `--bg-subcard`, `--text-main`, `--text-muted`, `--border-color`) via Tailwind arbitrary-value classes (`bg-[var(--bg-main)]` etc.). Voice input uses the native browser `SpeechRecognition` API directly, matching how the file already calls `window.speechSynthesis` for voice output.

**Tech Stack:** React 18 + TypeScript, Tailwind CSS v4 (CSS-first config via `@theme`/`@import "tailwindcss"` in `src/index.css` — there is no `tailwind.config.js` in this project), lucide-react icons, native Web Speech API (`SpeechRecognition` / `speechSynthesis`).

## Global Constraints

- No new npm dependencies (spec non-goal — no animation library, no speech-recognition library).
- No new theme modes beyond the existing four (`racing-dark`, `corporate-light`, `cyber-neon`, `championship-gold`).
- No dedicated chat-only theme toggle — light/dark is driven by the existing global `ThemeSelectorModal`, which sets `data-theme` on `document.documentElement`. `ChatbotView` needs no new prop for this.
- Brand blue (`#004791`) stays a literal color in all themes — it is not swapped for a CSS variable.
- Voice input must feature-detect (`window.SpeechRecognition || window.webkitSpeechRecognition`); if absent, the mic button is not rendered. No error UI for permission-denied/no-speech — fails silently back to idle, matching existing TTS behavior in this file.
- This repo has **no test runner** (`npm run lint` = `tsc --noEmit` is the only automated check) and **is not a git repository** (`git status` fails with "not a git repository"). Every task below ends with `npm run lint` + a manual browser check instead of automated tests, and there are no commit steps — mark the task's checkbox complete once verification passes.
- Dev server: `npm run dev` on `http://localhost:3000`. No restart needed for `ChatbotView.tsx`/`index.css` changes (only `server.ts`/`vite.config.ts` require a restart).

---

### Task 1: Theme-aware colors across ChatbotView

**Files:**
- Modify: `src/components/ChatbotView.tsx` (all literal color classes in the JSX, lines ~249–696)

**Interfaces:**
- Consumes: existing CSS variables from `src/index.css` — `var(--bg-main)`, `var(--bg-card)`, `var(--bg-subcard)`, `var(--text-main)`, `var(--text-muted)`, `var(--border-color)`. These already exist for all four `[data-theme="..."]` selectors; this task does not add or change them.
- Produces: nothing new consumed by later tasks — this is a pure class-name swap, JSX structure is otherwise unchanged. Tasks 2–4 build on top of the same structure with these variable-based classes already in place.

Apply this exact mapping everywhere the left-hand class appears in `ChatbotView.tsx`'s JSX. Classes not in this table stay unchanged (see "Leave unchanged" list below) — this includes the purchase modal's `slate-*` classes, which are covered separately in the note right after this table:

| Literal class | Replacement |
|---|---|
| `bg-[#0a0a0a]` | `bg-[var(--bg-main)]` |
| `bg-[#141414]` | `bg-[var(--bg-card)]` |
| `bg-[#181818]` | `bg-[var(--bg-subcard)]` |
| `bg-[#111111]` | `bg-[var(--bg-subcard)]` |
| `bg-[#080808]` | `bg-[var(--bg-main)]` |
| `bg-[#050505]` | `bg-[var(--bg-main)]` |
| `border-gray-800` | `border-[var(--border-color)]` |
| `text-white` | `text-[var(--text-main)]` |
| `text-gray-200` | `text-[var(--text-main)]` |
| `text-gray-300` | `text-[var(--text-main)]` |
| `text-gray-400` | `text-[var(--text-muted)]` |
| `text-gray-500` | `text-[var(--text-muted)]` |
| `text-gray-600` | `text-[var(--text-muted)]` |
| `placeholder-gray-500` | `placeholder-[var(--text-muted)]` |
| `hover:text-white` | `hover:text-[var(--text-main)]` |

**Note on the purchase modal** (lines ~569–693): it currently uses a distinct `slate-*` palette (`bg-[#0f172a]`, `bg-slate-900`, `border-slate-700`, `border-slate-800`, `text-gray-300`, `text-gray-400`) rather than the `#0a0a0a`/`#141414`/`gray-800` palette used elsewhere in the file. Treat `bg-[#0f172a]` and `bg-slate-900` the same as `bg-[#141414]` → `bg-[var(--bg-card)]`; treat `border-slate-700`/`border-slate-800` the same as `border-gray-800` → `border-[var(--border-color)]`; treat `bg-slate-800` (Cancel button, X button) the same as `bg-[#181818]` → `bg-[var(--bg-subcard)]`. Apply `text-gray-300`/`text-gray-400` → `text-[var(--text-main)]`/`text-[var(--text-muted)]` there too, same as the rest of the table.

Leave unchanged (not theme colors — brand/status/accent colors, same across all four themes):
- `bg-[#004791]` and any `#004791`-based classes (brand blue: user bubble, buttons, focus ring, badges)
- `emerald-*`, `red-*`, `amber-*`, `blue-400`/`blue-300` (status/accent colors used for success, cashback, ratings, etc.)
- `bg-black/80` (modal backdrop overlay)

- [ ] **Step 1: Read the current full file to confirm line numbers haven't shifted**

Run: view `src/components/ChatbotView.tsx` in full before editing (line numbers referenced above are from the version at the start of this plan; if the file has changed, re-locate each snippet by its surrounding text instead of line number).

- [ ] **Step 2: Replace the top bar's colors**

In the "Top Bar inside Chatbot" block, change:

```tsx
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-xl gap-3">
```
to:
```tsx
      <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-xl gap-3">
```

And the online-status ring that matches the panel background:
```tsx
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0a]"></span>
```
to:
```tsx
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-main)]"></span>
```

And the title/subtitle text:
```tsx
              <h2 className="font-bold text-white text-sm sm:text-base">YamBot - Yamaha AI Support</h2>
```
to:
```tsx
              <h2 className="font-bold text-[var(--text-main)] text-sm sm:text-base">YamBot - Yamaha AI Support</h2>
```
and
```tsx
            <p className="text-xs text-gray-400">
```
to:
```tsx
            <p className="text-xs text-[var(--text-muted)]">
```

- [ ] **Step 3: Replace the audio-toggle and reset-chat button colors**

```tsx
            className={`p-2 rounded-xl text-xs font-medium border transition ${
              enableAudio || isSpeaking
                ? 'bg-[#004791]/20 text-blue-400 border-[#004791]/50'
                : 'bg-[#141414] text-gray-400 border-gray-800 hover:text-white'
            }`}
```
to:
```tsx
            className={`p-2 rounded-xl text-xs font-medium border transition ${
              enableAudio || isSpeaking
                ? 'bg-[#004791]/20 text-blue-400 border-[#004791]/50'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-main)]'
            }`}
```

```tsx
            className="p-2 bg-[#141414] text-gray-400 hover:text-white border border-gray-800 rounded-xl transition"
```
to:
```tsx
            className="p-2 bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] rounded-xl transition"
```

- [ ] **Step 4: Replace the message-history window and avatar colors**

```tsx
      <div className="flex-1 bg-[#0a0a0a] rounded-2xl border border-gray-800 p-4 overflow-y-auto space-y-4 shadow-inner scrollbar-thin">
```
to:
```tsx
      <div className="flex-1 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)] p-4 overflow-y-auto space-y-4 shadow-inner scrollbar-thin">
```

```tsx
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-[#004791] text-white shadow-md shadow-[#004791]/30'
                    : 'bg-[#181818] text-blue-400 border border-gray-800'
                }`}
```
to:
```tsx
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-[#004791] text-white shadow-md shadow-[#004791]/30'
                    : 'bg-[var(--bg-subcard)] text-blue-400 border border-[var(--border-color)]'
                }`}
```

- [ ] **Step 5: Replace the speech-bubble colors**

```tsx
                className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#004791] text-white rounded-tr-none shadow-lg shadow-[#004791]/10'
                    : 'bg-[#141414] border border-gray-800 text-gray-200 rounded-tl-none shadow-md'
                }`}
```
to:
```tsx
                className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#004791] text-white rounded-tr-none shadow-lg shadow-[#004791]/10'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-tl-none shadow-md'
                }`}
```

- [ ] **Step 6: Replace the bike-card colors**

```tsx
                  <div className="mt-3 bg-[#050505] border border-[#004791]/40 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
```
to:
```tsx
                  <div className="mt-3 bg-[var(--bg-main)] border border-[#004791]/40 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
```

```tsx
                      className="w-full sm:w-28 h-20 object-cover rounded-lg border border-gray-800"
```
to:
```tsx
                      className="w-full sm:w-28 h-20 object-cover rounded-lg border border-[var(--border-color)]"
```

```tsx
                        <span className="font-bold text-white text-sm">{msg.bikeCard.name}</span>
```
to:
```tsx
                        <span className="font-bold text-[var(--text-main)] text-sm">{msg.bikeCard.name}</span>
```

```tsx
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{msg.bikeCard.tagline}</p>
```
to:
```tsx
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">{msg.bikeCard.tagline}</p>
```

- [ ] **Step 7: Replace the purchase-lead confirmation card colors**

```tsx
                  <div className="mt-3 bg-[#080808] border-2 border-emerald-500/60 rounded-xl p-3.5 text-xs text-left space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-2">
```
to:
```tsx
                  <div className="mt-3 bg-[var(--bg-main)] border-2 border-emerald-500/60 rounded-xl p-3.5 text-xs text-left space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
```

```tsx
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 pt-1">
                      <div>
                        <span className="text-gray-500 block">Customer Name:</span>
                        <strong className="text-white">{msg.purchaseLeadRef.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Contact Phone:</span>
                        <strong className="text-emerald-400">{msg.purchaseLeadRef.customerPhone}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 border-t border-gray-800 pt-2">
                      <div>
                        <span className="text-gray-500 block">Assigned Salesman:</span>
                        <strong className="text-blue-400">{msg.purchaseLeadRef.salesmanName}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Salesman Location:</span>
                        <strong className="text-white">{msg.purchaseLeadRef.salesmanLocation}</strong>
                      </div>
                    </div>
```
to:
```tsx
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-main)] pt-1">
                      <div>
                        <span className="text-[var(--text-muted)] block">Customer Name:</span>
                        <strong className="text-[var(--text-main)]">{msg.purchaseLeadRef.customerName}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">Contact Phone:</span>
                        <strong className="text-emerald-400">{msg.purchaseLeadRef.customerPhone}</strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-main)] border-t border-[var(--border-color)] pt-2">
                      <div>
                        <span className="text-[var(--text-muted)] block">Assigned Salesman:</span>
                        <strong className="text-blue-400">{msg.purchaseLeadRef.salesmanName}</strong>
                      </div>
                      <div>
                        <span className="text-[var(--text-muted)] block">Salesman Location:</span>
                        <strong className="text-[var(--text-main)]">{msg.purchaseLeadRef.salesmanLocation}</strong>
                      </div>
                    </div>
```

```tsx
                      <p className="text-[10px] text-gray-300 leading-normal">
```
to:
```tsx
                      <p className="text-[10px] text-[var(--text-main)] leading-normal">
```

```tsx
                    <div className="border-t border-gray-800 pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <span className="text-gray-400 flex items-center gap-1">
```
to:
```tsx
                    <div className="border-t border-[var(--border-color)] pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <span className="text-[var(--text-muted)] flex items-center gap-1">
```

- [ ] **Step 8: Replace the timestamp, quick-reply chips, loading indicator, and quick-question button colors**

```tsx
                className={`block text-[10px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-blue-100/80 text-right' : 'text-gray-500'
                }`}
```
to:
```tsx
                className={`block text-[10px] mt-1.5 ${
                  msg.sender === 'user' ? 'text-blue-100/80 text-right' : 'text-[var(--text-muted)]'
                }`}
```

```tsx
                    className="text-xs bg-[#111111] hover:bg-[#004791]/20 hover:border-[#004791]/60 text-gray-300 hover:text-blue-200 border border-gray-800 px-3 py-1.5 rounded-full transition flex items-center gap-1.5 shadow-sm"
```
to:
```tsx
                    className="text-xs bg-[var(--bg-subcard)] hover:bg-[#004791]/20 hover:border-[#004791]/60 text-[var(--text-main)] hover:text-blue-200 border border-[var(--border-color)] px-3 py-1.5 rounded-full transition flex items-center gap-1.5 shadow-sm"
```

```tsx
          <div className="flex items-center gap-3 text-gray-400 text-xs bg-[#141414] border border-gray-800 p-3 rounded-2xl w-fit">
```
to:
```tsx
          <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl w-fit">
```

```tsx
        <span className="text-gray-500 text-[11px] font-medium shrink-0 flex items-center gap-1">
```
to:
```tsx
        <span className="text-[var(--text-muted)] text-[11px] font-medium shrink-0 flex items-center gap-1">
```

```tsx
            className="shrink-0 bg-[#0a0a0a] hover:bg-[#181818] text-gray-300 border border-gray-800 px-3 py-1.5 rounded-lg transition"
```
to:
```tsx
            className="shrink-0 bg-[var(--bg-main)] hover:bg-[var(--bg-subcard)] text-[var(--text-main)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg transition"
```

- [ ] **Step 9: Replace the input form colors**

```tsx
          className="flex items-center gap-2 bg-[#0a0a0a] border border-gray-800 focus-within:border-[#004791] p-2 rounded-2xl shadow-xl transition"
```
to:
```tsx
          className="flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--border-color)] focus-within:border-[#004791] p-2 rounded-2xl shadow-xl transition"
```

```tsx
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none"
```
to:
```tsx
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none"
```

```tsx
                : 'bg-[#181818] text-gray-600 cursor-not-allowed border border-gray-800'
```
to:
```tsx
                : 'bg-[var(--bg-subcard)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]'
```

- [ ] **Step 10: Replace the purchase modal colors**

```tsx
          <div className="bg-[#0f172a] border border-[#004791]/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition"
            >
```
to:
```tsx
          <div className="bg-[var(--bg-card)] border border-[#004791]/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-subcard)] hover:bg-[var(--border-color)] rounded-full transition"
            >
```

```tsx
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
```
to:
```tsx
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4 mb-4">
```

```tsx
                <h3 className="font-bold text-white text-base">
                  {language === 'bn' ? 'ইয়ামাহা বাইক ক্রয় অনুসন্ধান' : 'Yamaha Bike Purchase Assistance'}
                </h3>
                <p className="text-xs text-gray-400">
```
to:
```tsx
                <h3 className="font-bold text-[var(--text-main)] text-base">
                  {language === 'bn' ? 'ইয়ামাহা বাইক ক্রয় অনুসন্ধান' : 'Yamaha Bike Purchase Assistance'}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
```

For the three form fields (bike select, name input, phone input), each has this pattern — apply to all three occurrences:
```tsx
                <label className="block text-xs font-semibold text-gray-300 mb-1">
```
to:
```tsx
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
```
and each `<select>`/`<input>` has:
```tsx
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#004791]"
```
(the `<select>` omits `placeholder-gray-500`) to:
```tsx
                  className="w-full bg-[var(--bg-subcard)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#004791]"
```

```tsx
              <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-3 text-xs space-y-1.5">
```
to:
```tsx
              <div className="bg-[var(--bg-subcard)] border border-blue-500/30 rounded-xl p-3 text-xs space-y-1.5">
```

```tsx
                <div className="text-gray-300 text-xs">
                  <strong>Name:</strong> Md. Mahadi Hassan | <strong>Location:</strong> Dhaka
                </div>
                <div className="text-gray-400 text-[11px] flex items-center gap-1">
```
to:
```tsx
                <div className="text-[var(--text-main)] text-xs">
                  <strong>Name:</strong> Md. Mahadi Hassan | <strong>Location:</strong> Dhaka
                </div>
                <div className="text-[var(--text-muted)] text-[11px] flex items-center gap-1">
```

```tsx
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium text-xs rounded-xl transition"
```
to:
```tsx
                  className="px-4 py-2 bg-[var(--bg-subcard)] hover:bg-[var(--border-color)] text-[var(--text-main)] font-medium text-xs rounded-xl transition"
```

- [ ] **Step 11: Verify with lint**

Run: `npm run lint`
Expected: no TypeScript errors (this task only changes string literals inside `className`, so it should pass immediately).

- [ ] **Step 12: Manual browser verification**

Run: `npm run dev`, open `http://localhost:3000`, go to the Chat tab. Open the theme selector (floating "Demo Switcher" pill or Header) and cycle through all four themes. For each theme, confirm: the chat panel background, message bubbles, input box, quick-reply chips, and the purchase modal (click "Buy Bike" on any bike-card reply to open it) all use readable, theme-appropriate colors — no white-text-on-white or dark-text-on-dark under `corporate-light`, and no visual regression under `racing-dark`/`cyber-neon`/`championship-gold`.

---

### Task 2: Message entrance animation, typing-dots indicator, and loading avatar pulse

**Files:**
- Modify: `src/index.css` (add `@theme` keyframe block)
- Modify: `src/components/ChatbotView.tsx` (apply animation class to messages, replace typing indicator, add avatar pulse)

**Interfaces:**
- Consumes: Task 1's variable-based classes (this task edits the same JSX regions, on top of Task 1's changes — apply Task 1 first).
- Produces: `.animate-slide-up-fade` utility class, usable by any future component in this codebase; `isLoading` state (already exists in the component) drives both the typing indicator and the avatar pulse.

- [ ] **Step 1: Add the keyframe to `src/index.css`**

Add this block after the existing `[data-theme="championship-gold"] { ... }` block (after line 50, before the `/* Global body styling driven by theme */` comment):

```css
@theme {
  --animate-slide-up-fade: slide-up-fade 0.25s ease-out;

  @keyframes slide-up-fade {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

This is Tailwind v4's CSS-first syntax for registering a custom animation utility (`animate-slide-up-fade` becomes available automatically — there is no `tailwind.config.js` in this project to add a `keyframes`/`animation` object to).

- [ ] **Step 2: Apply the entrance animation to each message**

In `ChatbotView.tsx`, find the message-mapping `<div>`:
```tsx
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
```
Change to:
```tsx
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col animate-slide-up-fade ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
```

- [ ] **Step 3: Replace the typing indicator with bouncing dots**

Find:
```tsx
        {isLoading && (
          <div className="flex items-center gap-3 text-[var(--text-muted)] text-xs bg-[var(--bg-card)] border border-[var(--border-color)] p-3 rounded-2xl w-fit">
            <Bot className="w-4 h-4 text-blue-400 animate-bounce" />
            <span className="animate-pulse">
              {language === 'bn' ? 'YamBot উত্তর তৈরি করছে...' : 'YamBot is thinking and looking up Yamaha BD database...'}
            </span>
          </div>
        )}
```
Replace with:
```tsx
        {isLoading && (
          <div className="flex items-center gap-2.5 animate-slide-up-fade">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[var(--bg-subcard)] text-blue-400 border border-[var(--border-color)]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-color)] px-4 py-3.5 rounded-2xl rounded-tl-none w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce" />
            </div>
          </div>
        )}
```

- [ ] **Step 4: Add the loading pulse to the header avatar**

Find:
```tsx
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#004791]/20 border border-[#004791]/40 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-main)]"></span>
          </div>
```
Replace with:
```tsx
          <div className="relative">
            <div className={`w-10 h-10 rounded-full bg-[#004791]/20 border border-[#004791]/40 flex items-center justify-center text-blue-400 transition ${isLoading ? 'animate-pulse' : ''}`}>
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-main)]"></span>
          </div>
```

- [ ] **Step 5: Verify with lint**

Run: `npm run lint`
Expected: no TypeScript errors.

- [ ] **Step 6: Manual browser verification**

Run: `npm run dev` (restart not required — only `.tsx`/`.css` changed). Send a chat message. Confirm: the new user message and the bot's reply each slide/fade in rather than appearing instantly; while waiting for the bot reply, three dots bounce in sequence inside a bubble-shaped container to the left (where the reply will land); the header bot avatar subtly pulses while `isLoading` is true and stops once the reply arrives. Check this in at least two themes (e.g. `racing-dark` and `corporate-light`).

---

### Task 3: Compact bike-card and purchase-lead-confirmation cards

**Files:**
- Modify: `src/components/ChatbotView.tsx` (bike-card block and purchase-lead-confirmation block inside the message-rendering JSX; add local expand/collapse state)

**Interfaces:**
- Consumes: `ChatMessage['purchaseLeadRef']` (type `PurchaseLead` from `src/types.ts`, fields: `leadRef`, `customerName`, `customerPhone`, `location`, `preferredBike`, `salesmanName`, `salesmanEmail`, `salesmanLocation`, `whatsappNotice`), `ChatMessage['bikeCard']` (type `BikeModel`). No changes to these types.
- Produces: a new component-local state `expandedLeadIds: Set<string>` used only within this task's rendering — not consumed elsewhere.

- [ ] **Step 1: Add expand/collapse state**

Near the other `useState` declarations at the top of the component (after `const [isSubmittingLead, setIsSubmittingLead] = useState(false);`), add:
```tsx
  const [expandedLeadIds, setExpandedLeadIds] = useState<Set<string>>(new Set());

  const toggleLeadExpanded = (id: string) => {
    setExpandedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
```

- [ ] **Step 2: Slim the bike-card to a single compact row**

Find the bike-card block (starts with `{msg.bikeCard && (` and its enclosing `<div className="mt-3 bg-[var(--bg-main)] border border-[#004791]/40 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">`). Replace the whole block with:
```tsx
                {msg.bikeCard && (
                  <div className="mt-3 bg-[var(--bg-main)] border border-[#004791]/40 rounded-xl p-2.5 flex items-center gap-2.5">
                    <img
                      src={msg.bikeCard.image}
                      alt={msg.bikeCard.name}
                      className="w-14 h-14 object-cover rounded-lg border border-[var(--border-color)] shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-bold text-[var(--text-main)] text-xs block truncate">{msg.bikeCard.name}</span>
                      <span className="font-extrabold text-emerald-400 text-xs">
                        ৳{(msg.bikeCard.offerPriceBDT || msg.bikeCard.priceBDT).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenPurchaseModal(msg.bikeCard?.name)}
                      className="shrink-0 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'ক্রয়' : 'Buy'}</span>
                    </button>
                  </div>
                )}
```

Note: this drops the tagline, engine-cc badge, cashback badge, and "View Specs" button from the inline card — those remain fully available via the "Buy" button's purchase modal and the dedicated Prices tab, consistent with keeping the chat bubble compact. (`ChevronRight` import may become unused after this — check remaining usages in Step 5 of Task 3 before removing the import.)

- [ ] **Step 3: Slim the purchase-lead-confirmation card with an expand toggle**

Find the whole block starting at `{msg.purchaseLeadRef && (` through its closing `)}`. Replace it with:
```tsx
                {msg.purchaseLeadRef && (
                  <div className="mt-3 bg-[var(--bg-main)] border-2 border-emerald-500/60 rounded-xl p-3 text-xs text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sales Rep Notified — {msg.purchaseLeadRef.salesmanName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleLeadExpanded(msg.id)}
                        className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                      >
                        <ChevronRight className={`w-4 h-4 transition-transform ${expandedLeadIds.has(msg.id) ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    <a
                      href={`https://wa.me/8801787687254?text=${encodeURIComponent(
                        `*🏍️ ACI MOTORS YAMAHA - URGENT CUSTOMER LEAD*\n` +
                        `*Ref:* ${msg.purchaseLeadRef.leadRef}\n` +
                        `*Customer:* ${msg.purchaseLeadRef.customerName}\n` +
                        `*Phone:* ${msg.purchaseLeadRef.customerPhone}\n` +
                        `*Location:* ${msg.purchaseLeadRef.location}\n` +
                        `*Model Selected:* ${msg.purchaseLeadRef.preferredBike}\n` +
                        `*Sales Rep Assigned:* ${msg.purchaseLeadRef.salesmanName} (+8801787687254)\n\n` +
                        `Hello Mr. Mahadi Hassan, I requested details for ${msg.purchaseLeadRef.preferredBike}. Please contact me at ${msg.purchaseLeadRef.customerPhone}!`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/50 transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>📱 Send Directly to WhatsApp (+8801787687254)</span>
                    </a>

                    {expandedLeadIds.has(msg.id) && (
                      <div className="space-y-2.5 pt-1 border-t border-[var(--border-color)]">
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">{msg.purchaseLeadRef.leadRef}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-main)]">
                          <div>
                            <span className="text-[var(--text-muted)] block">Customer Name:</span>
                            <strong className="text-[var(--text-main)]">{msg.purchaseLeadRef.customerName}</strong>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)] block">Contact Phone:</span>
                            <strong className="text-emerald-400">{msg.purchaseLeadRef.customerPhone}</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text-main)] border-t border-[var(--border-color)] pt-2">
                          <div>
                            <span className="text-[var(--text-muted)] block">Assigned Salesman:</span>
                            <strong className="text-blue-400">{msg.purchaseLeadRef.salesmanName}</strong>
                          </div>
                          <div>
                            <span className="text-[var(--text-muted)] block">Salesman Location:</span>
                            <strong className="text-[var(--text-main)]">{msg.purchaseLeadRef.salesmanLocation}</strong>
                          </div>
                        </div>

                        <div className="border-t border-[var(--border-color)] pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                          <span className="text-[var(--text-muted)] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-blue-400" />
                            <span>Salesman Contact: <strong className="text-[var(--text-main)]">+8801787687254</strong></span>
                          </span>
                          <a
                            href={`mailto:${msg.purchaseLeadRef.salesmanEmail}?subject=URGENT%20Purchase%20Inquiry%20for%20${encodeURIComponent(msg.purchaseLeadRef.preferredBike)}&body=Hello%20${encodeURIComponent(msg.purchaseLeadRef.salesmanName)},%0A%0AI%20am%20interested%20in%20purchasing%20the%20${encodeURIComponent(msg.purchaseLeadRef.preferredBike)}.%0A%0AMy%20Details:%0AName:%20${encodeURIComponent(msg.purchaseLeadRef.customerName)}%0APhone:%20${encodeURIComponent(msg.purchaseLeadRef.customerPhone)}%0ALocation:%20${encodeURIComponent(msg.purchaseLeadRef.location)}%0ARef:%20${msg.purchaseLeadRef.leadRef}%0A%0APlease%20contact%20me%20as%20soon%20as%20possible.`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded font-bold flex items-center gap-1 transition shadow"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Email Direct</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
```

This keeps every field and action from the original card (nothing is deleted from the app's functionality — WhatsApp dispatch, email dispatch, lead ref, salesman details) but collapses everything except the headline and the primary WhatsApp CTA behind the chevron toggle, so the base bubble reads as a short chat confirmation rather than a data table.

- [ ] **Step 4: Verify with lint**

Run: `npm run lint`
Expected: no TypeScript errors.

- [ ] **Step 5: Check for now-unused imports**

Search `ChatbotView.tsx` for remaining usages of `ChevronRight` (now reused for the expand toggle — should still be used) and confirm no other icon imports (`Sparkles`, `ExternalLink`, `Building`, `PhoneCall`) became unused as a side effect of these edits. Remove any import that has zero remaining usages in the file (check via the file's full text, not just this task's diffs).

- [ ] **Step 6: Manual browser verification**

Run: `npm run dev`. In the Chat tab: (a) ask about a specific bike (e.g. "R15 V4 price") and confirm the reply shows the slimmed single-row bike card with working "Buy" button; (b) complete a purchase lead submission via the modal and confirm the confirmation bubble shows the compact headline + WhatsApp button by default, and clicking the chevron reveals the full details (lead ref, customer info, salesman info, email button) and collapses again on a second click.

---

### Task 4: Voice input (mic button)

**Files:**
- Modify: `src/components/ChatbotView.tsx` (add `SpeechRecognition` state/handlers, add mic button to the input form)

**Interfaces:**
- Consumes: existing `handleSendMessage(textToSend?: string)` (defined earlier in the component) and `language: Language` prop.
- Produces: nothing consumed by other tasks — this is additive and self-contained in the input-form region.

- [ ] **Step 1: Add a minimal ambient type for the browser Speech API**

TypeScript's DOM lib doesn't ship `SpeechRecognition` types. Add this near the top of `ChatbotView.tsx`, after the existing imports:
```tsx
type SpeechRecognitionResultLike = { transcript: string };
interface MinimalSpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<SpeechRecognitionResultLike>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

const getSpeechRecognitionCtor = (): (new () => MinimalSpeechRecognition) | null => {
  const w = window as unknown as {
    SpeechRecognition?: new () => MinimalSpeechRecognition;
    webkitSpeechRecognition?: new () => MinimalSpeechRecognition;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};
```

- [ ] **Step 2: Add mic state and handlers inside the component**

After the existing `stopSpeech` function (which ends with `};` around where `handleSendMessage` begins), add:
```tsx
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  const startListening = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || isListening) return;

    const recognition = new Ctor();
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const lastResultIndex = event.results.length - 1;
      const transcript = event.results[lastResultIndex][0].transcript;
      setInputPrompt(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInputPrompt(current => {
        if (current.trim()) {
          handleSendMessage(current.trim());
          return '';
        }
        return current;
      });
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };
```

Note: final send happens in `onend` (fires once the browser detects the user stopped talking) rather than `onresult`, since `onresult` also fires for interim (non-final) transcripts while `interimResults` is `true` — sending on every interim result would spam messages.

- [ ] **Step 3: Add the mic button to the input form, and update the placeholder while listening**

Find:
```tsx
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'ইয়ামাহা বাইকের দাম, সার্ভিস বা যে কোনো বিষয়ে লিখুন (বাংলা বা ইংরেজি)...'
                : 'Ask YamBot about Yamaha prices, offers, specs, maintenance...'
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none"
          />

          <button
            type="submit"
```
Replace with:
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

          {!!getSpeechRecognitionCtor() && (
            <button
              type="button"
              onClick={() => (isListening ? stopListening() : startListening())}
              title="Voice Input"
              className={`p-2.5 rounded-xl transition ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                  : 'bg-[var(--bg-subcard)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-main)]'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
```

- [ ] **Step 4: Import the `Mic` icon**

In the `lucide-react` import at the top of the file, add `Mic` to the existing named-import list (e.g. `import { Send, Bot, User, Sparkles, Volume2, VolumeX, RotateCcw, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, PhoneCall, ExternalLink, ShoppingCart, Mail, Phone, MapPin, UserCheck, X, Building, MessageCircle, Mic } from 'lucide-react';`).

- [ ] **Step 5: Verify with lint**

Run: `npm run lint`
Expected: no TypeScript errors. If `MinimalSpeechRecognition`'s shape causes a type error against `event.results`, adjust the interface to match (it's intentionally minimal/loose — widen a field's type rather than using `any` if TS complains about a specific access).

- [ ] **Step 6: Manual browser verification**

Run: `npm run dev` in Chrome (Web Speech API support varies — Chrome/Edge required for this check). In the Chat tab: confirm the mic button appears next to Send. Click it, grant microphone permission if prompted, speak a short question (e.g. "What is the price of R15 V4"), confirm the input box fills with live transcript text and the placeholder shows "Listening...", and confirm the message auto-sends once you stop speaking (button returns to idle state, message appears in the conversation). Also confirm: in a browser without `SpeechRecognition` support (or by temporarily stubbing `window.SpeechRecognition = undefined` in devtools), the mic button doesn't render and the rest of the input form works normally.

---

## Post-plan note

Since this repository has no git history, there's nothing to commit at the end of each task — completion is marked by checking off the task's checkboxes once `npm run lint` and the manual browser check both pass. If the user later initializes git for this project, an initial commit capturing this whole revamp can be made at that point.

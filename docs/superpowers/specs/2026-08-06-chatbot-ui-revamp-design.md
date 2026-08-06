# ChatbotView UI Revamp: Design

**Date:** 2026-08-06
**Scope:** `src/components/ChatbotView.tsx` and `src/index.css` only (one new `@theme` keyframe block for the message-entrance animation). No `App.tsx` or other component changes needed.

## Problem

`ChatbotView` currently:
- Hardcodes dark-only Tailwind color classes throughout (`bg-[#0a0a0a]`, `border-gray-800`, `text-white`, etc.), so it ignores the app's existing 4-way theme system (`racing-dark`, `corporate-light`, `cyber-neon`, `championship-gold`) — it never looks right under `corporate-light`.
- Renders messages and info cards (bike card, purchase-lead confirmation) as static, dense, table-like blocks with no entrance animation, reading more like an embedded web form than a chat conversation.
- Has voice **output** (`speakText` via `window.speechSynthesis`) but no voice **input** — text entry is the only way to talk to the bot.

## Goals

1. Chat visually respects the app's theme system, specifically rendering correctly under `corporate-light` (and, as a side effect of the fix, the other three themes too).
2. The conversation feels like a modern messaging app (WhatsApp/iMessage-style): animated message entry, a typing-dots indicator, slimmer inline cards.
3. Users can speak instead of type: a mic button transcribes speech and auto-sends.

## Non-goals

- No new theme modes beyond the existing four.
- No dedicated chat-only light/dark toggle — light mode is driven by the existing global `ThemeSelectorModal`, which sets `data-theme` on `document.documentElement`, same as the rest of the app.
- No new npm dependencies (no animation library, no speech-recognition library).
- No changes to other components' theming (that's a separate, larger effort noted in `CLAUDE.md` — out of scope here).

## Design

### 1. Theming: reuse existing CSS variables

`src/index.css` already defines a full CSS-variable palette per theme (`--bg-main`, `--bg-card`, `--bg-subcard`, `--text-main`, `--text-muted`, `--border-color`, `--accent-primary`), scoped under `[data-theme="..."]` selectors, driven by `document.documentElement.setAttribute('data-theme', theme)` in `App.tsx`. This is a Tailwind v4 project (`@import "tailwindcss"` in `index.css`, no `tailwind.config.js`), so these variables are consumed via Tailwind arbitrary-value classes.

`ChatbotView` needs **no new prop and no `App.tsx` changes** — the cascade already reaches it. Every literal hardcoded color class in the JSX (~40 occurrences: `bg-[#0a0a0a]`, `border-gray-800`, `text-white`, `text-gray-400`, `bg-[#141414]`, etc.) is replaced with the matching variable-backed class:

| Current literal | Replacement |
|---|---|
| `bg-[#0a0a0a]` (panel/page bg) | `bg-[var(--bg-main)]` |
| `bg-[#141414]` (bot bubble / cards) | `bg-[var(--bg-card)]` |
| `border-gray-800` | `border-[var(--border-color)]` |
| `text-white` | `text-[var(--text-main)]` |
| `text-gray-400` / `text-gray-500` | `text-[var(--text-muted)]` |
| `bg-[#004791]` (user bubble, brand accent) | unchanged — brand blue stays literal in all themes |

This fixes rendering under **all four themes** (not just `corporate-light`), since it rides the same mechanism the rest of the CSS variable system already uses, rather than introducing a new per-component theme-prop pattern.

### 2. Visual polish

- **Message entrance animation**: new messages (user and bot) animate in via a new `animate-slide-up-fade` keyframe, added via a Tailwind v4 `@theme` block in `src/index.css` (no `tailwind.config.js` exists in this project), replacing the current instant-appear.
- **Typing indicator**: replace the current bouncing-icon + pulsing-text line with three small bouncing dots in a bubble-shaped container, positioned where the bot's next reply will appear — standard messaging-app affordance.
- **Bubble/card slimming**: the bike-card and purchase-lead-confirmation blocks currently render as dense multi-column data blocks inside the chat bubble. Slim to a single-row compact layout (thumbnail + name + price + one primary action button); the rest of the current detail (salesman info, WhatsApp/email dispatch links) moves behind a "view details" expand, so the base bubble reads as a chat message rather than an embedded form.
- **Header**: keep the existing online-status pulse dot; make the bot avatar itself subtly pulse/glow only while `isLoading` is true.
- Implementation uses only Tailwind CSS transitions/keyframes, consistent with the file's existing use of `animate-fade-in`, `animate-pulse`, `animate-bounce`, `animate-ping`. No new dependency.

### 3. Voice input

A mic button is added to the input form, left of Send.

- Uses the native `SpeechRecognition` / `webkitSpeechRecognition` browser API — no new dependency, mirrors how `speakText` already calls `window.speechSynthesis` directly.
- **Feature detection**: if neither `window.SpeechRecognition` nor `window.webkitSpeechRecognition` exists, the mic button is not rendered at all.
- On click: starts recognition with `lang` set from the existing `language` prop, using the same `bn-BD` / `en-US` mapping `speakText` already uses.
- While listening: mic button shows a pulsing red state; input placeholder changes to a "Listening..." string (localized per `language`); interim transcript streams live into `inputPrompt` as the user speaks.
- On final result: calls `handleSendMessage(transcript)` directly — auto-send, no manual confirmation step.
- On error or no-speech-detected: silently resets to idle state, matching the existing quiet-failure behavior of `speakText`/TTS. No new error toast/UI.

### 4. Error handling

- Voice input failures (permission denied, no speech, unsupported browser) fail silently back to idle — consistent with existing TTS behavior in this file.
- Since colors now come from CSS variables already defined for all four themes in `src/index.css`, there's no risk of an undefined/missing color role — every variable referenced already has a value under every `[data-theme="..."]` selector.

### 5. Verification

No automated test suite exists in this repo; `npm run lint` (`tsc --noEmit`) is the only automated check. After implementation:
1. Run `npm run lint`.
2. Manually verify in the browser (`npm run dev`):
   - Cycle through all four themes (`racing-dark`, `corporate-light`, `cyber-neon`, `championship-gold`) via `ThemeSelectorModal` and confirm the chat panel, bubbles, input, and cards are legible and match each theme's palette (not just corporate-light).
   - Trigger the mic button, confirm live transcript + auto-send.
   - Confirm message entrance animation and typing-dots indicator render correctly across themes.

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { YAMAHA_BIKES, YAMAHA_OFFERS, SERVICE_CENTERS } from './src/data/yamahaData';
import {
  ACI_PRODUCTS_CATALOG,
  SERVICE_DIAGNOSTICS_KB,
  matchDiagnostics,
  getProductsByIds,
  DiagnosticIssue,
  ACIProduct
} from './src/data/aciProductsData';
import { autoCorrectLocation } from './src/data/locationData';
import {
  DEFAULT_CONTACT,
  getTechnicianForLocation,
  getRepresentativeForBrand,
  ResolvedTechnician
} from './src/data/techniciansData';
import { ServiceAppointment, PurchaseLead } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' })); // audio uploads for engine sound analysis

// ===========================================================================
// WhatsApp (whatsapp-web.js) — REAL auto-send with honest fallback
// ===========================================================================

type WhatsAppStatus = 'initializing' | 'qr_pending' | 'authenticated' | 'ready' | 'disconnected' | 'unavailable';

const whatsappState: {
  status: WhatsAppStatus;
  qrDataUrl: string | null;
  lastError: string | null;
  connectedNumber: string | null;
} = { status: 'initializing', qrDataUrl: null, lastError: null, connectedNumber: null };

let waClient: any = null;

async function initWhatsApp() {
  try {
    const waModule: any = await import('whatsapp-web.js');
    const { Client, LocalAuth } = waModule.default ?? waModule;
    const QRCode = await import('qrcode');

    // Prefer the system-installed Chrome (avoids flaky bundled-Chromium downloads)
    const fs = await import('fs');
    const systemChromeCandidates = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    const executablePath = systemChromeCandidates.find(p => fs.existsSync(p));

    waClient = new Client({
      authStrategy: new LocalAuth({ dataPath: path.join(process.cwd(), '.wwebjs_auth') }),
      // whatsapp-web.js hardcodes a stale Chrome/101 UA by default; WhatsApp's device-link
      // handshake rejects that fingerprint mismatch against a modern Chrome binary ("Couldn't
      // link device"). Use a current, real UA matching the actual installed browser instead.
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
        ...(executablePath ? { executablePath } : {})
      }
    });

    waClient.on('qr', async (qr: string) => {
      whatsappState.status = 'qr_pending';
      try {
        whatsappState.qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 1 });
      } catch {
        whatsappState.qrDataUrl = null;
      }
      console.log('\n[WHATSAPP] Scan this QR with the sender phone (WhatsApp > Linked Devices):');
      try {
        const qrTerm = await QRCode.toString(qr, { type: 'terminal', small: true });
        console.log(qrTerm);
      } catch { /* terminal QR is best-effort */ }
    });

    waClient.on('authenticated', () => {
      whatsappState.status = 'authenticated';
      whatsappState.qrDataUrl = null;
      console.log('[WHATSAPP] Authenticated.');
    });

    waClient.on('ready', () => {
      whatsappState.status = 'ready';
      whatsappState.qrDataUrl = null;
      whatsappState.connectedNumber = waClient?.info?.wid?.user || null;
      console.log(`[WHATSAPP] Client READY (number: ${whatsappState.connectedNumber}). Auto-send enabled.`);
    });

    waClient.on('disconnected', (reason: string) => {
      whatsappState.status = 'disconnected';
      whatsappState.lastError = `Disconnected: ${reason}`;
      console.warn('[WHATSAPP] Disconnected:', reason);
    });

    waClient.on('auth_failure', (msg: string) => {
      whatsappState.status = 'disconnected';
      whatsappState.lastError = `Auth failure: ${msg}`;
      console.warn('[WHATSAPP] Auth failure:', msg);
    });

    await waClient.initialize();
  } catch (err: any) {
    whatsappState.status = 'unavailable';
    whatsappState.lastError = err?.message || String(err);
    console.warn('[WHATSAPP] Client unavailable (falling back to wa.me links):', whatsappState.lastError);
  }
}

interface WhatsAppSendResult {
  delivered: boolean;
  mode: 'AUTO_SENT' | 'FALLBACK_LINK';
  status: string;
  targetPhone: string;
  whatsappUrl: string;
  error?: string;
}

async function sendWhatsAppMessage(targetPhoneRaw: string, text: string): Promise<WhatsAppSendResult> {
  const targetPhone = (targetPhoneRaw || process.env.WHATSAPP_TARGET_PHONE || '8801787687254').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;

  if (waClient && whatsappState.status === 'ready') {
    try {
      await waClient.sendMessage(`${targetPhone}@c.us`, text);
      console.log(`[WHATSAPP] AUTO-SENT to +${targetPhone}`);
      return { delivered: true, mode: 'AUTO_SENT', status: 'DELIVERED_VIA_WHATSAPP_WEB', targetPhone: `+${targetPhone}`, whatsappUrl: waUrl };
    } catch (err: any) {
      console.warn('[WHATSAPP] Send failed, falling back to link:', err?.message);
      return { delivered: false, mode: 'FALLBACK_LINK', status: 'SEND_FAILED_USE_LINK', targetPhone: `+${targetPhone}`, whatsappUrl: waUrl, error: err?.message };
    }
  }

  return {
    delivered: false,
    mode: 'FALLBACK_LINK',
    status: `NOT_CONNECTED (${whatsappState.status}) - open the link to send manually`,
    targetPhone: `+${targetPhone}`,
    whatsappUrl: waUrl
  };
}

// Dispatch log (in-memory)
interface DispatchLog {
  id: string;
  channel: 'WHATSAPP' | 'EMAIL';
  type: 'PURCHASE_LEAD' | 'SERVICE_BOOKING' | 'SERVICE_CONSULTATION' | 'PRODUCT_ORDER' | 'GENERAL_INQUIRY';
  refCode: string;
  customerName: string;
  customerPhone: string;
  target: string;
  targetName: string;
  messageText: string;
  delivered: boolean;
  mode: string;
  timestamp: string;
}
const dispatchLogs: DispatchLog[] = [];

const logDispatch = (entry: Omit<DispatchLog, 'id' | 'timestamp'>) => {
  const log: DispatchLog = { ...entry, id: `dsp-${Date.now()}-${Math.floor(Math.random() * 1000)}`, timestamp: new Date().toISOString() };
  dispatchLogs.unshift(log);
  return log;
};

// ===========================================================================
// Email (SMTP via .env only — no hardcoded credentials)
// ===========================================================================

const getTransporter = () => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpUser || !smtpPass) return null;
  return {
    transporter: nodemailer.createTransport({ service: 'gmail', auth: { user: smtpUser, pass: smtpPass } }),
    smtpUser
  };
};

interface EmailRow { label: string; value: string; highlight?: boolean }

const buildEmailHtml = (heading: string, refCode: string, intro: string, sections: { title: string; rows: EmailRow[] }[], actionText: string) => `
  <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 24px; border-radius: 12px; max-width: 620px;">
    <div style="border-bottom: 2px solid #004791; padding-bottom: 12px; margin-bottom: 16px;">
      <h1 style="color: #60a5fa; margin: 0; font-size: 19px;">${heading}</h1>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Reference: <strong>${refCode}</strong> | ${new Date().toLocaleString()}</p>
    </div>
    <p style="font-size: 14px; color: #cbd5e1;">${intro}</p>
    ${sections.map(sec => `
      <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; margin: 14px 0;">
        <h3 style="color: #38bdf8; margin-top: 0; font-size: 15px;">${sec.title}</h3>
        ${sec.rows.map(r => `<p style="margin: 6px 0; font-size: 13px;"><strong>${r.label}:</strong> <span style="${r.highlight ? 'color:#facc15;font-weight:bold;' : 'color:#e2e8f0;'}">${r.value}</span></p>`).join('')}
      </div>`).join('')}
    <div style="background-color: #004791; color: #ffffff; padding: 12px; border-radius: 8px; text-align: center; margin-top: 18px;">
      <p style="margin: 0; font-size: 13px; font-weight: bold;">${actionText}</p>
    </div>
    <p style="font-size: 11px; color: #64748b; margin-top: 18px; text-align: center;">ACI Motors Ltd. — Official Distributor of Yamaha, Yamalube, CEAT, Liqui Moly, EcoFlow, GoodWe & Aiko Solar in Bangladesh</p>
  </div>`;

async function sendEmail(to: string, subject: string, html: string): Promise<{ sent: boolean; message: string }> {
  const smtp = getTransporter();
  if (!smtp) return { sent: false, message: 'SMTP credentials not configured (set SMTP_USER / SMTP_PASS in .env)' };
  try {
    await smtp.transporter.sendMail({ from: `"ACI Motors AI Sales & Service Hub" <${smtp.smtpUser}>`, to, subject, html });
    console.log(`[SMTP] Mail sent to ${to}: ${subject}`);
    return { sent: true, message: `Email dispatched to ${to}` };
  } catch (err: any) {
    console.warn('[SMTP] Send failed:', err?.message);
    return { sent: false, message: `Email failed: ${err?.message}` };
  }
}

// ===========================================================================
// System prompt — generated from the data files (single source of truth)
// ===========================================================================

const formatBDT = (n: number) => `৳${n.toLocaleString('en-IN')}`;

const buildBikeLines = () =>
  YAMAHA_BIKES.map(b => {
    const offer = b.offerPriceBDT ? ` / Offer ${formatBDT(b.offerPriceBDT)}${b.cashbackBDT ? ` (${formatBDT(b.cashbackBDT)} cashback)` : ''}` : '';
    return `   - ${b.name} [${b.category}, ${b.engineCc}cc, ${b.mileage}, ${b.absType}]: Regular ${formatBDT(b.priceBDT)}${offer}. EMI from ${formatBDT(b.emiStartingBDT)}/month. Key: ${b.features.slice(0, 4).join(', ')}.`;
  }).join('\n');

const buildProductLines = () => {
  const byBrand: Record<string, ACIProduct[]> = {};
  for (const p of ACI_PRODUCTS_CATALOG) (byBrand[p.brand] ||= []).push(p);
  return Object.entries(byBrand)
    .map(([brand, items]) => `   ${brand}:\n` + items.map(p => `     - ${p.name} (${formatBDT(p.priceBDT)}): ${p.tagline}. Best for: ${p.recommendedFor.join('; ')}.`).join('\n'))
    .join('\n');
};

const buildDiagnosticLines = () =>
  SERVICE_DIAGNOSTICS_KB.map(iss => {
    const prods = getProductsByIds(iss.recommendedProducts).map(p => p.name).join(' + ') || 'Service center inspection';
    return `   - [${iss.urgency}] ${iss.titleEn} (symptoms: ${iss.symptoms.slice(0, 2).join('; ')}): ${iss.recommendedActionEn} → Products: ${prods}.`;
  }).join('\n');

const YAMAHA_SYSTEM_INSTRUCTION = `
You are "YamBot", the official Yamaha Motorbike Bangladesh (ACI Motors) AI Smart Sales & Service Assistant.
Assist buyers and current owners in Bangladesh in a warm, polite, professional, authentic local tone. Support Bengali (বাংলা) and English.

TOP PRIORITY — CUSTOMER SERVICE BEFORE SALES: When a customer describes a problem (noise, low mileage, vibration, starting issue, etc.), your FIRST job is to actually help — diagnose the likely root cause and explain the fix using Section 3's knowledge base, in plain language, as a real mechanic would. Never open with a product pitch. Only after you've fully explained the problem and solution may you mention a relevant product as an optional aid — and even then, keep it brief and secondary to the advice itself.

=== 1. YAMAHA BIKE LINEUP (ACI Motors BD, current official prices in BDT) ===
${buildBikeLines()}

=== 2. ACI MOTORS MULTI-BRAND PRODUCT PORTFOLIO ===
${buildProductLines()}

=== 3. SERVICE DIAGNOSTICS KNOWLEDGE BASE (use for ANY problem the customer reports — diagnose FIRST, before any product mention) ===
${buildDiagnosticLines()}

=== 4. DYNAMIC BUDGET UPSELL PROTOCOL ===
When a user gives a budget for a NEW bike purchase (not a service problem):
  1. Present the BEST bike strictly WITHIN the budget with price and key features.
  2. Also present the NEXT model ABOVE the budget (the upsell target) as a secondary option.
  3. Compare them plainly: exact price difference, extra EMI per month (difference/12 on 0% EMI), and the concrete features gained (TCS, Dual ABS, USD fork, VVA, quick shifter, resale value).
  4. Frame it as a helpful comparison, not a hard push: "for only ৳X more per month you get...". Always be truthful about prices.

=== 5. CROSS-SELL GUIDANCE (SECONDARY — only after the problem is fully explained) ===
Once you've diagnosed a service problem and explained the root cause and fix (Section 3), you MAY briefly mention the relevant product(s) as an optional aid (e.g. slippery ride → CEAT tires; low mileage → Carbon Cleaner + Octane Booster + Yamalube oil; 3,000+ km since oil change → Yamalube oil). Keep this short — it is a suggestion, not the main answer.
If the customer mentions a rural/village area, load shedding, farming, or off-grid needs, you may also mention the ACI rural energy line: EcoFlow power stations, GoodWe hybrid inverters, Aiko 620W solar panels.
End with a single, plain, low-pressure consent question — e.g. "Would you like to purchase this bike / book a service for this?" — and nothing more. Do NOT name, email, or phone-number any specific representative in your reply; the app's purchase/booking button already handles collecting the customer's name, phone and location and will introduce them to their assigned representative only after they submit it. Never invent or state a rep's name yourself.

=== 6. WARRANTY & SERVICING ===
   - 2-Year or 30,000 KM engine warranty; 4 free services (1st: 500-1k km, 2nd: 3k-4k km, 3rd: 6k-7k km, 4th: 9k-10k km).
   - Yamalube oil required for valid warranty. Hotline: 16508.

=== 7. LEAD & DISPATCH PROTOCOL ===
   - Never collect name, phone or location yourself in the chat, and never mention a representative's name/email/phone. If the customer agrees they want to purchase or book, simply tell them to use the purchase/booking button/form in the app — it collects their name, phone and District (জেলা) + Upazila (উপজেলা), auto-corrects misspelled locations (e.g. "Sylet" → Sylhet), and automatically notifies their assigned representative by email + WhatsApp.

Guidelines: Be accurate with BDT prices; use bullet points and bold for key specs; keep answers concise and mobile-friendly.
`;

// ===========================================================================
// Gemini client + retry
// ===========================================================================

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) console.warn('GEMINI_API_KEY is not set. Gemini API calls will fall back gracefully.');
  return new GoogleGenAI({ apiKey: apiKey || '', httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
};

async function generateGeminiContentWithRetry(ai: any, params: any) {
  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash'];
  if (params.model && !modelsToTry.includes(params.model)) modelsToTry.unshift(params.model);
  const uniqueModels = [...new Set(modelsToTry)];
  let lastError: any = null;
  for (const modelName of uniqueModels) {
    try {
      return await ai.models.generateContent({ ...params, model: modelName });
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${modelName} failed (${err?.message || err}). Trying next fallback...`);
    }
  }
  throw lastError;
}

// ===========================================================================
// Local fallback chat engine (no Gemini needed) — data-driven
// ===========================================================================

/** Render one bike's full detail block (used for single-bike and multi-bike answers). */
function renderBikeDetail(b: typeof YAMAHA_BIKES[number], language: 'bn' | 'en'): string {
  const popularNote = b.popularInBD
    ? (language === 'bn' ? `\n• **কেন জনপ্রিয়:** ${b.bestFor[0]} — বাংলাদেশের রাইডারদের অন্যতম পছন্দ` : `\n• **Why riders love it:** ${b.bestFor[0]} — one of our best-selling models in Bangladesh`)
    : '';
  return language === 'bn'
    ? `**${b.name}**\n• **ইঞ্জিন:** ${b.engineCc}cc, ${b.maxPower}\n• **অফিসিয়াল মূল্য:** ${formatBDT(b.priceBDT)}\n` +
      (b.cashbackBDT ? `• **ক্যাশব্যাক অফার:** ${formatBDT(b.cashbackBDT)} ছাড় (অফার প্রাইস: ${formatBDT(b.offerPriceBDT!)})\n` : '') +
      `• **মাইলেজ:** ${b.mileage}\n• **ব্রেক ও প্রযুক্তি:** ${b.absType}, ${b.features.slice(0, 3).join(', ')}\n• **EMI:** মাসিক ${formatBDT(b.emiStartingBDT)} থেকে${popularNote}`
    : `**${b.name}**\n• **Engine:** ${b.engineCc}cc, ${b.maxPower}\n• **Official Price:** ${formatBDT(b.priceBDT)}\n` +
      (b.cashbackBDT ? `• **Cashback:** ${formatBDT(b.cashbackBDT)} OFF (Offer Price: ${formatBDT(b.offerPriceBDT!)})\n` : '') +
      `• **Mileage:** ${b.mileage}\n• **Safety & Features:** ${b.absType}, ${b.features.slice(0, 3).join(', ')}\n• **EMI:** from ${formatBDT(b.emiStartingBDT)}/month${popularNote}`;
}

const URGENCY_OPENER: Record<string, { en: string; bn: string }> = {
  Critical: {
    en: "That's a safety-critical issue — I'd rather you know now than find out the hard way on the road. Here's exactly what's going on and how to fix it fast:",
    bn: 'এটি নিরাপত্তার দিক থেকে জরুরি একটি বিষয় — রাস্তায় বিপদে পড়ার আগেই ঠিক করে নেওয়া ভালো। সমস্যা ও দ্রুত সমাধান দেখুন:'
  },
  High: {
    en: "Good that you brought this up — left alone this tends to get worse (and pricier), so let's sort it out now.",
    bn: 'ভালো করেছেন জিজ্ঞেস করে — এটা অবহেলা করলে সমস্যা ও খরচ দুটোই বাড়ে, তাই এখনই সমাধান করে নেওয়া ভালো।'
  },
  Medium: {
    en: "This is a common one — totally fixable, and most riders see the difference within a day of treatment.",
    bn: 'এটা খুবই কমন একটি সমস্যা — সহজেই ঠিক করা যায়, বেশিরভাগ রাইডার একদিনের মধ্যেই পার্থক্য বুঝতে পারেন।'
  },
  Low: {
    en: "Nothing to worry about — a quick, low-cost fix will have you sorted.",
    bn: 'চিন্তার কিছু নেই — সহজ ও কম খরচে সমাধান হয়ে যাবে।'
  }
};

function generateLocalFallbackChatResponse(query: string, language: 'bn' | 'en'): string {
  const q = (query || '').toLowerCase();

  const matchedBikes = YAMAHA_BIKES.filter(b =>
    q.includes(b.name.toLowerCase()) ||
    q.includes(b.id.toLowerCase()) ||
    (b.id === 'r15-v4' && (q.includes('r15') && !q.includes('r15m'))) ||
    (b.id === 'r15m-v4' && q.includes('r15m')) ||
    (b.id === 'mt-15-v2' && q.includes('mt')) ||
    (b.id === 'fzs-v4-fi' && (q.includes('fz-s') || q.includes('fzs'))) ||
    (b.id === 'fzx-150' && (q.includes('fzx') || q.includes('fz-x'))) ||
    (b.id === 'aerox-155' && q.includes('aerox')) ||
    (b.id === 'fz25' && q.includes('fz25')) ||
    (b.id === 'saluto-125' && q.includes('saluto')) ||
    (b.id === 'rayzr-125-fi' && (q.includes('rayzr') || q.includes('ray-zr')))
  ).slice(0, 3);

  // Budget-based upsell in fallback mode too
  const budgetMatch = q.match(/(\d[\d,]{4,})/);
  let responseBody = '';
  let showPurchaseCTA = false;

  const diagnosed = matchDiagnostics(query, 1)[0];

  if (matchedBikes.length === 1) {
    responseBody = (language === 'bn' ? 'এখানে ' : "Here's ") + renderBikeDetail(matchedBikes[0], language);
    showPurchaseCTA = true;
  } else if (matchedBikes.length > 1) {
    const intro = language === 'bn'
      ? `আপনি একাধিক মডেল জিজ্ঞেস করেছেন — নিচে পাশাপাশি তুলনা দেওয়া হলো যাতে সহজে সিদ্ধান্ত নিতে পারেন:\n\n`
      : `You asked about a few models — here's a side-by-side so you can decide easily:\n\n`;
    const blocks = matchedBikes.map(b => renderBikeDetail(b, language)).join('\n\n');
    const cheapest = [...matchedBikes].sort((a, b) => (a.offerPriceBDT || a.priceBDT) - (b.offerPriceBDT || b.priceBDT))[0];
    const priciest = [...matchedBikes].sort((a, b) => (b.offerPriceBDT || b.priceBDT) - (a.offerPriceBDT || a.priceBDT))[0];
    const closing = cheapest.id !== priciest.id
      ? (language === 'bn'
          ? `\n\n💡 সংক্ষেপে: বাজেট-ফ্রেন্ডলি ও মাইলেজে এগিয়ে **${cheapest.name}**, আর বেশি পারফরম্যান্স ও ফিচার চাইলে **${priciest.name}** সেরা পছন্দ।`
          : `\n\n💡 In short: **${cheapest.name}** wins on budget and mileage, while **${priciest.name}** gives you more performance and features if you can stretch the budget.`)
      : '';
    responseBody = intro + blocks + closing;
    showPurchaseCTA = true;
  } else if (diagnosed) {
    // Customer service first: lead with root cause + fix. Products are mentioned only
    // as a brief, secondary aid after the actual problem has been explained.
    const prods = getProductsByIds(diagnosed.recommendedProducts);
    const prodLines = prods.map(p => `• **${p.name}** (${formatBDT(p.priceBDT)}): ${p.tagline}`).join('\n');
    const opener = URGENCY_OPENER[diagnosed.urgency]?.[language] || '';
    responseBody = language === 'bn'
      ? `🛠️ **${diagnosed.titleBn}**\n\n${opener}\n\n**সম্ভাব্য কারণ:** ${diagnosed.rootCause}\n\n**সমাধান:** ${diagnosed.recommendedActionBn}\n\n${diagnosed.requiresTechnician ? '⚠️ এই সমস্যার জন্য নিকটস্থ টেকনিশিয়ান পরিদর্শন প্রয়োজন। Service Assistant ট্যাব থেকে কনসালটেশন বুক করুন!\n\n' : ''}💡 **সহায়ক প্রোডাক্ট (ঐচ্ছিক):**\n${prodLines}`
      : `🛠️ **${diagnosed.titleEn}**\n\n${opener}\n\n**Likely Cause:** ${diagnosed.rootCause}\n\n**Solution:** ${diagnosed.recommendedActionEn}\n\n${diagnosed.requiresTechnician ? '⚠️ This issue needs a technician inspection — book a consultation from the Service Assistant tab!\n\n' : ''}💡 **Helpful products (optional):**\n${prodLines}`;
    showPurchaseCTA = true;
  } else if (budgetMatch && (q.includes('budget') || q.includes('বাজেট') || q.includes('suggest') || q.includes('kinbo') || q.includes('within'))) {
    const budget = Number(budgetMatch[1].replace(/,/g, ''));
    const within = YAMAHA_BIKES.filter(b => (b.offerPriceBDT || b.priceBDT) <= budget).sort((a, b) => b.priceBDT - a.priceBDT)[0];
    const upsell = YAMAHA_BIKES.filter(b => (b.offerPriceBDT || b.priceBDT) > budget).sort((a, b) => a.priceBDT - b.priceBDT)[0];
    if (within) {
      const upsellDelta = upsell ? (upsell.offerPriceBDT || upsell.priceBDT) - (within.offerPriceBDT || within.priceBDT) : 0;
      responseBody = language === 'bn'
        ? `আপনার ${formatBDT(budget)} বাজেটে সেরা বাইক **${within.name}** (${formatBDT(within.offerPriceBDT || within.priceBDT)})।\n\n` +
          (upsell ? `🚀 **তবে মাত্র ${formatBDT(upsellDelta)} বেশি দিলে** (মাসিক মাত্র ~${formatBDT(Math.round(upsellDelta / 12))} অতিরিক্ত ০% EMI-তে) পাবেন **${upsell.name}** — যাতে আছে: ${upsell.features.slice(0, 3).join(', ')}। রিসেল ভ্যালুও অনেক বেশি!` : '')
        : `Best bike within your ${formatBDT(budget)} budget: **${within.name}** (${formatBDT(within.offerPriceBDT || within.priceBDT)}).\n\n` +
          (upsell ? `🚀 **But for just ${formatBDT(upsellDelta)} more** (~${formatBDT(Math.round(upsellDelta / 12))}/month extra on 0% EMI) you can own the **${upsell.name}** — gaining: ${upsell.features.slice(0, 3).join(', ')}. Much higher resale value too!` : '')
        ;
      showPurchaseCTA = true;
    }
  } else if (q.includes('price') || q.includes('দাম') || q.includes('কত')) {
    const lines = YAMAHA_BIKES.filter(b => b.popularInBD).map(b =>
      `• **${b.name}:** ${formatBDT(b.offerPriceBDT || b.priceBDT)}${b.cashbackBDT ? ` (${formatBDT(b.cashbackBDT)} cashback)` : ''}`).join('\n');
    responseBody = (language === 'bn' ? `**ইয়ামাহা বাইকের বর্তমান অফিসিয়াল মূল্য তালিকা (ACI Motors):**\n\n` : `**Current Official Yamaha Price List in BD (ACI Motors):**\n\n`) + lines;
    showPurchaseCTA = true;
  } else if (q.includes('offer') || q.includes('অফার') || q.includes('discount')) {
    const lines = YAMAHA_OFFERS.map(o => `• **${language === 'bn' ? o.titleBn : o.titleEn}** — ${language === 'bn' ? o.descriptionBn : o.descriptionEn}`).join('\n');
    responseBody = (language === 'bn' ? `🔥 **চলমান অফারসমূহ:**\n\n` : `🔥 **Current Offers:**\n\n`) + lines;
    showPurchaseCTA = true;
  } else {
    responseBody = language === 'bn'
      ? `আমি **YamBot** — বাইকের দাম, বাজেট অনুযায়ী সাজেশন, সার্ভিস সমস্যার সমাধান (কম মাইলেজ, শব্দ, স্কিডিং ইত্যাদি) এবং ইঞ্জিন সাউন্ড ডায়াগনসিসে সাহায্য করি। এসিআই মটরস হটলাইন: ১৬৫০৮।`
      : `I am **YamBot** — ask me for bike prices, budget-based suggestions, service problem solutions (low mileage, noise, skidding etc.) or engine sound diagnosis. ACI Motors Hotline: 16508.`;
  }

  // Consent-only nudge — no rep name/email/phone here. The purchase/booking button in the
  // app UI collects name, phone and location, and reveals the assigned representative only
  // after the customer submits it.
  if (!showPurchaseCTA) return responseBody;

  const purchasePrompt = language === 'bn'
    ? `\n\n🛒 **আপনি কি এটি ক্রয় করতে বা এর জন্য সার্ভিস বুক করতে চান?** চাইলে নিচের বাটনে ট্যাপ করুন — আপনার লোকেশন অনুযায়ী নিকটস্থ প্রতিনিধি দ্রুত যোগাযোগ করবেন।`
    : `\n\n🛒 **Would you like to purchase this or book a service for it?** Tap the button below if so — your nearest representative will reach out based on your location.`;

  return responseBody + purchasePrompt;
}

// ===========================================================================
// API Routes
// ===========================================================================

// 1. Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, language } = req.body;
    if (!message) return res.status(400).json({ error: 'Message parameter is required' });

    const ai = getGeminiClient();
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      for (const h of history) {
        contents.push({ role: h.sender === 'user' ? 'user' : 'model', parts: [{ text: h.text }] });
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const langInstruction = language === 'bn'
      ? 'Please respond in fluent Bengali (বাংলা) script with polite BD tone.'
      : 'Please respond in English with polite Bangladeshi customer support tone.';

    let replyText = '';
    try {
      const response = await generateGeminiContentWithRetry(ai, {
        model: 'gemini-3.6-flash',
        contents,
        config: { systemInstruction: `${YAMAHA_SYSTEM_INSTRUCTION}\nUser Preferred Language: ${langInstruction}` }
      });
      replyText = response.text || '';
    } catch (geminiError: any) {
      console.warn('Gemini unavailable, using local catalog engine:', geminiError?.message);
      replyText = generateLocalFallbackChatResponse(message, language || 'en');
    }
    if (!replyText) replyText = generateLocalFallbackChatResponse(message, language || 'en');

    return res.json({ text: replyText, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.json({ text: generateLocalFallbackChatResponse(req.body?.message || '', req.body?.language || 'en'), timestamp: new Date().toISOString() });
  }
});

// 2. Bike Recommendation with structured upsell comparison
app.post('/api/recommend', async (req, res) => {
  try {
    const { quizState, language } = req.body;
    const budgetMax = quizState?.budgetRangeBDT?.[1] || 650000;
    const budgetMin = quizState?.budgetRangeBDT?.[0] || 100000;
    const preferredCategory = quizState?.preferredCategory;

    const effectivePrice = (b: typeof YAMAHA_BIKES[number]) => b.offerPriceBDT || b.priceBDT;

    let withinBudget = YAMAHA_BIKES.filter(b => effectivePrice(b) <= budgetMax && effectivePrice(b) >= budgetMin);
    if (preferredCategory && preferredCategory !== 'all') {
      const catMatches = withinBudget.filter(b => b.category === preferredCategory);
      if (catMatches.length > 0) withinBudget = catMatches;
    }
    const sorted = withinBudget.sort((a, b) => effectivePrice(b) - effectivePrice(a));
    const primaryBike = sorted[0] || YAMAHA_BIKES.reduce((min, b) => effectivePrice(b) < effectivePrice(min) ? b : min, YAMAHA_BIKES[0]);
    const secondaryBike = sorted[1] || null;

    // The upsell target: cheapest bike ABOVE the budget ceiling (prefer same/better category tier)
    const aboveBudget = YAMAHA_BIKES
      .filter(b => effectivePrice(b) > budgetMax && b.id !== primaryBike.id)
      .sort((a, b) => effectivePrice(a) - effectivePrice(b));
    const upsellBike = aboveBudget[0] || null;

    let upsellComparison: any = null;
    if (upsellBike) {
      const priceDelta = effectivePrice(upsellBike) - effectivePrice(primaryBike);
      const primaryFeatures = new Set(primaryBike.features);
      upsellComparison = {
        priceDelta,
        emiDeltaPerMonth: Math.round(priceDelta / 12),
        featuresGained: upsellBike.features.filter(f => !primaryFeatures.has(f)),
        powerGain: `${primaryBike.maxPower} → ${upsellBike.maxPower}`,
        absUpgrade: primaryBike.absType !== upsellBike.absType ? `${primaryBike.absType} → ${upsellBike.absType}` : null
      };
    }

    const ai = getGeminiClient();
    const prompt = `
Generate a personalized Yamaha recommendation for a Bangladesh customer:
- Budget: ${formatBDT(budgetMin)} to ${formatBDT(budgetMax)}
- Purpose: ${quizState?.ridingPurpose || 'Daily Commute'} | Category: ${preferredCategory || 'Any'} | Mileage priority: ${quizState?.mileagePriority || 'Balanced'} | ABS: ${quizState?.absRequirement || 'Yes'} | Experience: ${quizState?.experienceLevel || 'Intermediate'}

PRIMARY (within budget): ${primaryBike.name} (${formatBDT(effectivePrice(primaryBike))}, ${primaryBike.engineCc}cc, ${primaryBike.mileage})
${upsellBike ? `UPSELL TARGET (above budget): ${upsellBike.name} (${formatBDT(effectivePrice(upsellBike))}) — only ${formatBDT(upsellComparison.priceDelta)} more (~${formatBDT(upsellComparison.emiDeltaPerMonth)}/month extra on 0% EMI). Features gained: ${upsellComparison.featuresGained.join(', ')}.` : ''}

Write in ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}: (1) why ${primaryBike.name} is the best match within budget, (2) then a PERSUASIVE side-by-side upsell pitch for ${upsellBike?.name || 'n/a'} emphasizing safety/performance features gained and tiny monthly EMI difference, (3) end with a call to action to submit a purchase request (representative ${DEFAULT_CONTACT.name} will contact them).`;

    let recommendationText = '';
    try {
      const response = await generateGeminiContentWithRetry(ai, {
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: { systemInstruction: YAMAHA_SYSTEM_INSTRUCTION }
      });
      recommendationText = response.text || '';
    } catch (recErr: any) {
      console.warn('Recommendation Gemini call failed, using catalog fallback:', recErr?.message);
      const upsellPitchEn = upsellBike
        ? `\n\n🚀 **Smart Upgrade Option:** For only **${formatBDT(upsellComparison.priceDelta)} more** (~${formatBDT(upsellComparison.emiDeltaPerMonth)}/month extra on 0% EMI), the **${upsellBike.name}** unlocks: ${upsellComparison.featuresGained.slice(0, 4).join(', ')}${upsellComparison.absUpgrade ? `, plus braking upgrade ${upsellComparison.absUpgrade}` : ''} — and a much stronger resale value!`
        : '';
      const upsellPitchBn = upsellBike
        ? `\n\n🚀 **স্মার্ট আপগ্রেড অপশন:** মাত্র **${formatBDT(upsellComparison.priceDelta)} বেশি দিলে** (০% EMI-তে মাসে মাত্র ~${formatBDT(upsellComparison.emiDeltaPerMonth)} অতিরিক্ত) পাবেন **${upsellBike.name}** — অতিরিক্ত সুবিধা: ${upsellComparison.featuresGained.slice(0, 4).join(', ')}${upsellComparison.absUpgrade ? `, ব্রেকিং আপগ্রেড ${upsellComparison.absUpgrade}` : ''} — সাথে অনেক বেশি রিসেল ভ্যালু!`
        : '';
      recommendationText = language === 'bn'
        ? `আপনার বাজেট ও পছন্দে সেরা বাইক **${primaryBike.name}**!\n\n• **অফিসিয়াল দাম:** ${formatBDT(effectivePrice(primaryBike))}\n• **মাইলেজ:** ${primaryBike.mileage}\n• **ইঞ্জিন ও ব্রেকিং:** ${primaryBike.engineCc}cc, ${primaryBike.absType}${upsellPitchBn}\n\nক্রয় করতে চাইলে ফর্মটি পূরণ করুন — আমাদের প্রতিনিধি **${DEFAULT_CONTACT.name}** সরাসরি যোগাযোগ করবেন!`
        : `Based on your budget and preferences, your best match is the **${primaryBike.name}**!\n\n• **Official Price:** ${formatBDT(effectivePrice(primaryBike))}\n• **Mileage:** ${primaryBike.mileage}\n• **Engine & Safety:** ${primaryBike.engineCc}cc, ${primaryBike.absType}${upsellPitchEn}\n\nReady to buy? Submit the purchase form and our representative **${DEFAULT_CONTACT.name}** will contact you directly!`;
    }

    return res.json({ recommendationText, primaryBike, secondaryBike, upsellBike, upsellComparison, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Error in /api/recommend:', error);
    const primaryBike = YAMAHA_BIKES[0];
    return res.json({
      recommendationText: `Our recommended bike is ${primaryBike.name} (${formatBDT(primaryBike.priceBDT)}). Contact ${DEFAULT_CONTACT.name} (${DEFAULT_CONTACT.email}) for purchase details!`,
      primaryBike, secondaryBike: YAMAHA_BIKES[1], upsellBike: null, upsellComparison: null,
      timestamp: new Date().toISOString()
    });
  }
});

// 3. Catalog endpoints
app.get('/api/bikes', (req, res) => {
  const { category, maxPrice } = req.query;
  let bikes = YAMAHA_BIKES;
  if (category && category !== 'ALL') bikes = bikes.filter(b => b.category.toLowerCase() === (category as string).toLowerCase());
  if (maxPrice) bikes = bikes.filter(b => b.priceBDT <= Number(maxPrice));
  res.json({ bikes });
});

app.get('/api/offers', (req, res) => res.json({ offers: YAMAHA_OFFERS }));
app.get('/api/aci-products', (req, res) => res.json({ products: ACI_PRODUCTS_CATALOG }));
app.get('/api/diagnostics-kb', (req, res) => res.json({ diagnostics: SERVICE_DIAGNOSTICS_KB }));

app.get('/api/service-centers', (req, res) => {
  const { division, bikeId } = req.query;
  let centers = SERVICE_CENTERS;
  if (division && division !== 'ALL') centers = centers.filter(c => c.division.toLowerCase() === (division as string).toLowerCase());
  if (bikeId) centers = centers.filter(c => c.inventory[bikeId as string] && c.inventory[bikeId as string] !== 'Out of Stock');
  res.json({ centers });
});

// 4. WhatsApp status (for Social tab connection panel)
app.get('/api/whatsapp-status', (req, res) => {
  res.json({
    status: whatsappState.status,
    qrDataUrl: whatsappState.qrDataUrl,
    connectedNumber: whatsappState.connectedNumber,
    lastError: whatsappState.lastError,
    autoSendEnabled: whatsappState.status === 'ready'
  });
});

app.get('/api/whatsapp-dispatch-logs', (req, res) => res.json({ logs: dispatchLogs }));

// ===========================================================================
// Stores
// ===========================================================================

const appointmentsStore: ServiceAppointment[] = [];
const leadsStore: PurchaseLead[] = [];
const consultationsStore: any[] = [];
const productOrdersStore: any[] = [];

app.get('/api/appointments', (req, res) => res.json({ appointments: appointmentsStore }));
app.get('/api/leads', (req, res) => res.json({ leads: leadsStore }));
app.get('/api/consultations', (req, res) => res.json({ consultations: consultationsStore }));
app.get('/api/product-orders', (req, res) => res.json({ orders: productOrdersStore }));

// 5. Book Service Appointment
app.post('/api/book-appointment', async (req, res) => {
  const { customerName, customerPhone, customerEmail, bikeModel, registrationNumber, serviceCenterId, date, timeSlot, serviceType, notes } = req.body;
  if (!customerName || !customerPhone || !bikeModel || !serviceCenterId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const center = SERVICE_CENTERS.find(c => c.id === serviceCenterId);
  const centerName = center ? center.nameEn : 'Yamaha Authorized Service Center';
  const bookingRef = `YMH-BD-${Math.floor(10000 + Math.random() * 90000)}`;

  const newAppointment: ServiceAppointment = {
    id: `apt-${Date.now()}`, bookingRef, customerName, customerPhone, customerEmail,
    bikeModel, registrationNumber: registrationNumber || 'N/A', serviceCenterId,
    serviceCenterName: centerName, date, timeSlot,
    serviceType: serviceType || 'Periodic Maintenance', notes,
    status: 'Confirmed', createdAt: new Date().toISOString()
  };
  appointmentsStore.unshift(newAppointment);

  const waText = `*🔧 ACI MOTORS YAMAHA - SERVICE BOOKING*\n*Ref:* ${bookingRef}\n*Customer:* ${customerName}\n*Phone:* ${customerPhone}\n*Bike:* ${bikeModel} (${registrationNumber || 'N/A'})\n*Center:* ${centerName}\n*Date:* ${date} at ${timeSlot}\n*Type:* ${serviceType || 'Periodic Maintenance'}${notes ? `\n*Notes:* ${notes}` : ''}\n*Manager:* ${DEFAULT_CONTACT.name} (${DEFAULT_CONTACT.phone})`;

  const waResult = await sendWhatsAppMessage(DEFAULT_CONTACT.phone, waText);
  logDispatch({ channel: 'WHATSAPP', type: 'SERVICE_BOOKING', refCode: bookingRef, customerName, customerPhone, target: waResult.targetPhone, targetName: DEFAULT_CONTACT.name, messageText: waText, delivered: waResult.delivered, mode: waResult.mode });

  const emailResult = await sendEmail(
    DEFAULT_CONTACT.email,
    `[SERVICE BOOKING ${bookingRef}] ${customerName} - ${bikeModel} at ${centerName}`,
    buildEmailHtml('🔧 ACI Motors Yamaha — Service Booking Confirmed', bookingRef,
      `Dear ${DEFAULT_CONTACT.name}, a customer booked a service appointment via YamBot.`,
      [{ title: '👤 Booking Details', rows: [
        { label: 'Customer', value: customerName },
        { label: 'Phone', value: customerPhone, highlight: true },
        { label: 'Bike', value: `${bikeModel} (${registrationNumber || 'N/A'})` },
        { label: 'Center', value: centerName },
        { label: 'Slot', value: `${date} at ${timeSlot}` },
        { label: 'Service Type', value: serviceType || 'Periodic Maintenance' },
        ...(notes ? [{ label: 'Notes', value: notes }] : [])
      ] }],
      `Please prepare the service bay and confirm with ${customerName} at ${customerPhone}.`)
  );
  logDispatch({ channel: 'EMAIL', type: 'SERVICE_BOOKING', refCode: bookingRef, customerName, customerPhone, target: DEFAULT_CONTACT.email, targetName: DEFAULT_CONTACT.name, messageText: emailResult.message, delivered: emailResult.sent, mode: 'SMTP' });

  return res.json({
    success: true,
    appointment: newAppointment,
    whatsappNotice: {
      sent: waResult.delivered, autoDispatched: waResult.delivered, mode: waResult.mode, status: waResult.status,
      targetPhone: waResult.targetPhone, targetName: DEFAULT_CONTACT.name, whatsappUrl: waResult.whatsappUrl, messagePreview: waText
    },
    emailNotice: emailResult,
    message: waResult.delivered
      ? `Appointment confirmed! WhatsApp + Email notice auto-sent to ${DEFAULT_CONTACT.name}.`
      : `Appointment confirmed! Email dispatched; WhatsApp is not connected — use the link to send the notice manually.`
  });
});

// 6. Purchase Lead
app.post('/api/purchase-lead', async (req, res) => {
  try {
    const { customerName, customerPhone, location, district, upazila, preferredBike } = req.body;
    if (!customerName || !customerPhone) return res.status(400).json({ error: 'Customer Name and Phone Number are required.' });

    const corrected = autoCorrectLocation(district || location || 'Dhaka');
    const locLabel = `${upazila || corrected.upazila}, ${corrected.district}`;
    const bike = preferredBike || 'Yamaha YZF R15 V4';
    const technician = getTechnicianForLocation(corrected.district, upazila || corrected.upazila);
    const leadRef = `YMH-LEAD-${Math.floor(10000 + Math.random() * 90000)}`;

    const emailResult = await sendEmail(
      DEFAULT_CONTACT.email,
      `[URGENT LEAD ${leadRef}] Purchase Request - ${customerName} (${bike})`,
      buildEmailHtml('🏍️ ACI Motors Yamaha — Urgent Customer Purchase Lead', leadRef,
        `Dear ${DEFAULT_CONTACT.name}, a customer requested immediate purchase assistance via YamBot.`,
        [{ title: '👤 Customer Details', rows: [
          { label: 'Name', value: customerName },
          { label: 'Phone', value: customerPhone, highlight: true },
          { label: 'Location', value: `${locLabel}${corrected.wasCorrected ? ' (auto-corrected spelling)' : ''}` },
          { label: 'Preferred Bike', value: bike, highlight: true },
          { label: 'Nearest Service Point', value: `${technician.serviceCenterName} — ${technician.serviceCenterAddress}` },
          { label: 'Service Point Phone', value: technician.serviceCenterPhone }
        ] }],
        `Action Required: contact ${customerName} at ${customerPhone} immediately to finalize the order!`)
    );

    const waText = `*🏍️ ACI MOTORS YAMAHA - URGENT CUSTOMER LEAD*\n*Ref:* ${leadRef}\n*Customer:* ${customerName}\n*Phone:* ${customerPhone}\n*Location:* ${locLabel}\n*Model:* ${bike}\n*Nearest Point:* ${technician.serviceCenterName}\n\n*Action:* Contact ${customerName} at ${customerPhone} for purchase & test ride!`;
    const waResult = await sendWhatsAppMessage(DEFAULT_CONTACT.phone, waText);

    logDispatch({ channel: 'EMAIL', type: 'PURCHASE_LEAD', refCode: leadRef, customerName, customerPhone, target: DEFAULT_CONTACT.email, targetName: DEFAULT_CONTACT.name, messageText: emailResult.message, delivered: emailResult.sent, mode: 'SMTP' });
    logDispatch({ channel: 'WHATSAPP', type: 'PURCHASE_LEAD', refCode: leadRef, customerName, customerPhone, target: waResult.targetPhone, targetName: DEFAULT_CONTACT.name, messageText: waText, delivered: waResult.delivered, mode: waResult.mode });

    const newLead: PurchaseLead = {
      id: `lead-${Date.now()}`, leadRef, customerName, customerPhone,
      location: locLabel, preferredBike: bike,
      salesmanName: DEFAULT_CONTACT.name, salesmanEmail: DEFAULT_CONTACT.email, salesmanLocation: corrected.district,
      status: 'Sent To Salesman', createdAt: new Date().toISOString(), emailSent: emailResult.sent
    };
    leadsStore.unshift(newLead);

    return res.json({
      success: true,
      lead: newLead,
      salesman: { ...DEFAULT_CONTACT, designation: technician.designation, location: corrected.district },
      locationCorrection: corrected.wasCorrected ? corrected : null,
      whatsappNotice: {
        sent: waResult.delivered, autoDispatched: waResult.delivered, mode: waResult.mode, status: waResult.status,
        targetPhone: waResult.targetPhone, targetName: DEFAULT_CONTACT.name, whatsappUrl: waResult.whatsappUrl, messagePreview: waText
      },
      emailNotice: emailResult,
      message: `Your purchase request for ${bike} has been dispatched to ${DEFAULT_CONTACT.name} (${DEFAULT_CONTACT.email})${waResult.delivered ? ' via Email + WhatsApp auto-send' : ' via Email (WhatsApp link ready)'}. Expect a call shortly!`
    });
  } catch (error: any) {
    console.error('Error in /api/purchase-lead:', error);
    return res.status(500).json({ error: 'Failed to process purchase lead' });
  }
});

// 7. Service Consultation — diagnosis + nearest technician + product cross-sell dispatch
app.post('/api/service-consultation', async (req, res) => {
  try {
    const { customerName, customerPhone, district, upazila, locationInput, bikeModel, problemKey, problemText, consentedProductIds, language } = req.body;
    if (!customerName || !customerPhone) return res.status(400).json({ error: 'Customer name and phone are required.' });

    const corrected = autoCorrectLocation(district || locationInput || 'Dhaka');
    const locLabel = `${upazila || corrected.upazila}, ${corrected.district}`;
    const technician: ResolvedTechnician = getTechnicianForLocation(corrected.district, upazila || corrected.upazila);
    const refCode = `YMH-SRV-${Math.floor(10000 + Math.random() * 90000)}`;

    // Diagnose
    let issues: DiagnosticIssue[] = [];
    if (problemKey) {
      const found = SERVICE_DIAGNOSTICS_KB.find(x => x.problemKey === problemKey || x.id === problemKey);
      if (found) issues = [found];
    }
    if (issues.length === 0 && problemText) issues = matchDiagnostics(problemText, 2);
    const primaryIssue = issues[0] || null;

    const recommendedProducts = primaryIssue ? getProductsByIds(primaryIssue.recommendedProducts) : [];
    const consented: ACIProduct[] = Array.isArray(consentedProductIds) && consentedProductIds.length > 0
      ? getProductsByIds(consentedProductIds)
      : [];

    // --- Technician dispatch email ---
    const emailResult = await sendEmail(
      technician.email,
      `[SERVICE CONSULT ${refCode}] ${customerName} - ${primaryIssue?.titleEn || 'General Issue'} (${corrected.district})`,
      buildEmailHtml('🔧 ACI Motors — Nearest Technician Consultation Request', refCode,
        `Dear ${technician.name} (${technician.designation}), a customer near your territory needs consultation.`,
        [
          { title: '👤 Customer', rows: [
            { label: 'Name', value: customerName },
            { label: 'Phone', value: customerPhone, highlight: true },
            { label: 'Location', value: `${locLabel}${corrected.wasCorrected ? ' (spelling auto-corrected)' : ''}` },
            { label: 'Bike', value: bikeModel || 'Not specified' }
          ] },
          { title: '🩺 AI Diagnosis', rows: primaryIssue ? [
            { label: 'Problem', value: primaryIssue.titleEn, highlight: true },
            { label: 'Urgency', value: primaryIssue.urgency },
            { label: 'Root Cause', value: primaryIssue.rootCause },
            { label: 'Recommended Action', value: primaryIssue.recommendedActionEn },
            { label: 'Products To Carry', value: recommendedProducts.map(p => `${p.name} (${formatBDT(p.priceBDT)})`).join('; ') || 'Inspection only' }
          ] : [{ label: 'Customer Description', value: problemText || 'Not provided' }] }
        ],
        `Please contact ${customerName} at ${customerPhone} and schedule the nearest-location visit at ${technician.serviceCenterName} (${technician.serviceCenterAddress}, ${technician.serviceCenterPhone}).`)
    );
    logDispatch({ channel: 'EMAIL', type: 'SERVICE_CONSULTATION', refCode, customerName, customerPhone, target: technician.email, targetName: technician.name, messageText: emailResult.message, delivered: emailResult.sent, mode: 'SMTP' });

    // --- Cross-sell dispatch to brand representatives (grouped by email) ---
    const repDispatches: any[] = [];
    if (consented.length > 0) {
      const byEmail = new Map<string, { brands: Set<string>; products: ACIProduct[] }>();
      for (const p of consented) {
        const rep = getRepresentativeForBrand(p.brand);
        const entry = byEmail.get(rep.email) || { brands: new Set(), products: [] };
        entry.brands.add(p.brand);
        entry.products.push(p);
        byEmail.set(rep.email, entry);
      }
      for (const [repEmail, entry] of byEmail) {
        const orderRef = `ACI-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const prodRows = entry.products.map(p => ({ label: p.brand, value: `${p.name} — ${formatBDT(p.priceBDT)}`, highlight: true }));
        const repEmailResult = await sendEmail(
          repEmail,
          `[PRODUCT ORDER ${orderRef}] ${customerName} wants: ${entry.products.map(p => p.name).join(', ')}`,
          buildEmailHtml('🛒 ACI Motors — Cross-Sell Product Purchase Request', orderRef,
            `A customer agreed to purchase the following ACI products during an AI service consultation (${refCode}).`,
            [
              { title: '👤 Customer', rows: [
                { label: 'Name', value: customerName },
                { label: 'Phone', value: customerPhone, highlight: true },
                { label: 'Location', value: locLabel }
              ] },
              { title: '📦 Requested Products', rows: prodRows }
            ],
            `Please contact ${customerName} at ${customerPhone} to arrange delivery/installation from the nearest point in ${corrected.district}.`)
        );
        productOrdersStore.unshift({
          id: `ord-${Date.now()}-${Math.floor(Math.random() * 999)}`, orderRef, consultationRef: refCode,
          customerName, customerPhone, location: locLabel,
          products: entry.products.map(p => ({ id: p.id, name: p.name, brand: p.brand, priceBDT: p.priceBDT })),
          repEmail, emailSent: repEmailResult.sent, createdAt: new Date().toISOString()
        });
        logDispatch({ channel: 'EMAIL', type: 'PRODUCT_ORDER', refCode: orderRef, customerName, customerPhone, target: repEmail, targetName: [...entry.brands].join(' / ') + ' Representative', messageText: repEmailResult.message, delivered: repEmailResult.sent, mode: 'SMTP' });
        repDispatches.push({ orderRef, repEmail, brands: [...entry.brands], products: entry.products.map(p => p.name), emailSent: repEmailResult.sent });
      }
    }

    // --- WhatsApp summary to representative ---
    const waText = `*🔧 ACI MOTORS - SERVICE CONSULTATION*\n*Ref:* ${refCode}\n*Customer:* ${customerName} (${customerPhone})\n*Location:* ${locLabel}\n*Bike:* ${bikeModel || 'N/A'}\n*Diagnosis:* ${primaryIssue ? `${primaryIssue.titleEn} [${primaryIssue.urgency}]` : (problemText || 'General')}\n${consented.length > 0 ? `*Products Agreed:* ${consented.map(p => p.name).join(', ')}\n` : ''}*Nearest Center:* ${technician.serviceCenterName}\n*Address:* ${technician.serviceCenterAddress}\n*Center Phone:* ${technician.serviceCenterPhone}\n\n*Action:* Contact customer for nearest-location service!`;
    const waResult = await sendWhatsAppMessage(DEFAULT_CONTACT.phone, waText);
    logDispatch({ channel: 'WHATSAPP', type: 'SERVICE_CONSULTATION', refCode, customerName, customerPhone, target: waResult.targetPhone, targetName: DEFAULT_CONTACT.name, messageText: waText, delivered: waResult.delivered, mode: waResult.mode });

    const consultation = {
      id: `con-${Date.now()}`, refCode, customerName, customerPhone,
      district: corrected.district, upazila: upazila || corrected.upazila, locationCorrected: corrected.wasCorrected,
      bikeModel: bikeModel || null,
      diagnosis: primaryIssue ? { titleEn: primaryIssue.titleEn, titleBn: primaryIssue.titleBn, urgency: primaryIssue.urgency, rootCause: primaryIssue.rootCause, actionEn: primaryIssue.recommendedActionEn, actionBn: primaryIssue.recommendedActionBn } : null,
      technician: {
        name: technician.name, email: technician.email, phone: technician.phone,
        serviceCenterName: technician.serviceCenterName, serviceCenterAddress: technician.serviceCenterAddress,
        serviceCenterPhone: technician.serviceCenterPhone, designation: technician.designation
      },
      consentedProducts: consented.map(p => p.name),
      createdAt: new Date().toISOString()
    };
    consultationsStore.unshift(consultation);

    return res.json({
      success: true,
      refCode,
      diagnosis: primaryIssue,
      alternativeDiagnoses: issues.slice(1),
      recommendedProducts,
      technician: consultation.technician,
      locationCorrection: corrected.wasCorrected ? corrected : null,
      dispatches: { technicianEmail: emailResult, productOrders: repDispatches, whatsapp: { sent: waResult.delivered, mode: waResult.mode, status: waResult.status, whatsappUrl: waResult.whatsappUrl } },
      message: language === 'bn'
        ? `কনসালটেশন রিকোয়েস্ট (${refCode}) সফলভাবে পাঠানো হয়েছে! নিকটস্থ টেকনিশিয়ান ${technician.name} (${technician.serviceCenterName}) দ্রুত যোগাযোগ করবেন।`
        : `Consultation request (${refCode}) dispatched! Nearest technician ${technician.name} (${technician.serviceCenterName}) will contact you shortly.`
    });
  } catch (error: any) {
    console.error('Error in /api/service-consultation:', error);
    return res.status(500).json({ error: 'Failed to process service consultation' });
  }
});

// 8. Standalone product order (cross-sell consent from chat / product cards)
app.post('/api/product-order-lead', async (req, res) => {
  try {
    const { customerName, customerPhone, district, upazila, productIds } = req.body;
    if (!customerName || !customerPhone || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Name, phone and at least one product are required.' });
    }
    const corrected = autoCorrectLocation(district || 'Dhaka');
    const locLabel = `${upazila || corrected.upazila}, ${corrected.district}`;
    const products = getProductsByIds(productIds);
    const orderRef = `ACI-ORD-${Math.floor(10000 + Math.random() * 90000)}`;

    const byEmail = new Map<string, ACIProduct[]>();
    for (const p of products) {
      const rep = getRepresentativeForBrand(p.brand);
      byEmail.set(rep.email, [...(byEmail.get(rep.email) || []), p]);
    }

    const emailResults: any[] = [];
    for (const [repEmail, prods] of byEmail) {
      const r = await sendEmail(
        repEmail,
        `[PRODUCT ORDER ${orderRef}] ${customerName} wants: ${prods.map(p => p.name).join(', ')}`,
        buildEmailHtml('🛒 ACI Motors — Product Purchase Request', orderRef,
          `A customer requested ACI products via YamBot.`,
          [
            { title: '👤 Customer', rows: [
              { label: 'Name', value: customerName },
              { label: 'Phone', value: customerPhone, highlight: true },
              { label: 'Location', value: locLabel }
            ] },
            { title: '📦 Products', rows: prods.map(p => ({ label: p.brand, value: `${p.name} — ${formatBDT(p.priceBDT)}`, highlight: true })) }
          ],
          `Contact ${customerName} at ${customerPhone} for nearest-location delivery in ${corrected.district}.`)
      );
      emailResults.push({ repEmail, sent: r.sent });
      logDispatch({ channel: 'EMAIL', type: 'PRODUCT_ORDER', refCode: orderRef, customerName, customerPhone, target: repEmail, targetName: 'Product Representative', messageText: r.message, delivered: r.sent, mode: 'SMTP' });
    }

    const waText = `*🛒 ACI MOTORS - PRODUCT ORDER*\n*Ref:* ${orderRef}\n*Customer:* ${customerName} (${customerPhone})\n*Location:* ${locLabel}\n*Products:* ${products.map(p => `${p.name} (${formatBDT(p.priceBDT)})`).join(', ')}\n\n*Action:* Arrange nearest-location delivery!`;
    const waResult = await sendWhatsAppMessage(DEFAULT_CONTACT.phone, waText);
    logDispatch({ channel: 'WHATSAPP', type: 'PRODUCT_ORDER', refCode: orderRef, customerName, customerPhone, target: waResult.targetPhone, targetName: DEFAULT_CONTACT.name, messageText: waText, delivered: waResult.delivered, mode: waResult.mode });

    productOrdersStore.unshift({
      id: `ord-${Date.now()}`, orderRef, customerName, customerPhone, location: locLabel,
      products: products.map(p => ({ id: p.id, name: p.name, brand: p.brand, priceBDT: p.priceBDT })),
      emailResults, createdAt: new Date().toISOString()
    });

    return res.json({ success: true, orderRef, products, locationCorrection: corrected.wasCorrected ? corrected : null, emailResults, whatsapp: { sent: waResult.delivered, mode: waResult.mode, whatsappUrl: waResult.whatsappUrl }, message: `Order ${orderRef} dispatched — the nearest representative will contact ${customerName} shortly.` });
  } catch (error: any) {
    console.error('Error in /api/product-order-lead:', error);
    return res.status(500).json({ error: 'Failed to process product order' });
  }
});

// 9. Engine Sound AI Analysis
app.post('/api/analyze-engine-sound', async (req, res) => {
  try {
    const { audioBase64, mimeType, bikeModel, extraNotes, language } = req.body;
    if (!audioBase64) return res.status(400).json({ error: 'audioBase64 is required' });

    const kbSummary = SERVICE_DIAGNOSTICS_KB
      .map(i => `${i.problemKey}: ${i.titleEn} (symptoms: ${i.symptoms.join('; ')})`)
      .join('\n');

    const analysisPrompt = `You are a master Yamaha motorcycle service technician. Listen carefully to this engine sound recording${bikeModel ? ` from a ${bikeModel}` : ''}${extraNotes ? `. Rider notes: ${extraNotes}` : ''}.

Identify audible issues (knocking, chain rattle, tappet noise, belt screech, misfire, backfire, bearing whine, healthy idle, etc.).
Then map your findings to AT MOST 3 of these known problem keys:
${kbSummary}

Respond with STRICT JSON only (no markdown):
{
  "soundObservations": "what you hear, 2-3 sentences",
  "healthScore": 0-100,
  "matchedProblemKeys": ["key1", "key2"],
  "verdict": "one-line verdict",
  "additionalAdvice": "1-2 sentences"
}`;

    const ai = getGeminiClient();
    let analysis: any = null;
    try {
      const response = await generateGeminiContentWithRetry(ai, {
        model: 'gemini-3.6-flash',
        contents: [{
          role: 'user',
          parts: [
            { inlineData: { mimeType: mimeType || 'audio/webm', data: audioBase64 } },
            { text: analysisPrompt }
          ]
        }]
      });
      const raw = (response.text || '').replace(/```json|```/g, '').trim();
      analysis = JSON.parse(raw);
    } catch (err: any) {
      console.warn('Audio Gemini analysis failed, using heuristic fallback:', err?.message);
      const heuristicIssues = extraNotes ? matchDiagnostics(extraNotes, 2) : [SERVICE_DIAGNOSTICS_KB.find(i => i.problemKey === 'engine_vibration')!];
      analysis = {
        soundObservations: language === 'bn'
          ? 'এআই অডিও ইঞ্জিন এই মুহূর্তে ব্যস্ত — আপনার বর্ণনার ভিত্তিতে সম্ভাব্য ডায়াগনসিস দেওয়া হলো। সঠিক ফলের জন্য একটু পরে আবার চেষ্টা করুন।'
          : 'AI audio engine is busy right now — showing a diagnosis based on your description. Please retry shortly for full acoustic analysis.',
        healthScore: 65,
        matchedProblemKeys: heuristicIssues.map(i => i.problemKey),
        verdict: language === 'bn' ? 'প্রাথমিক ডায়াগনসিস (অডিও ছাড়া)' : 'Preliminary diagnosis (without audio)',
        additionalAdvice: language === 'bn' ? 'নিকটস্থ সার্ভিস সেন্টারে ফিজিক্যাল ইন্সপেকশন করালে শতভাগ নিশ্চিত হওয়া যাবে।' : 'A physical inspection at the nearest service center will give 100% certainty.',
        fallback: true
      };
    }

    const matchedIssues = (analysis.matchedProblemKeys || [])
      .map((key: string) => SERVICE_DIAGNOSTICS_KB.find(i => i.problemKey === key))
      .filter(Boolean) as DiagnosticIssue[];
    const productMap = matchedIssues.map(issue => ({
      issue: { titleEn: issue.titleEn, titleBn: issue.titleBn, urgency: issue.urgency, actionEn: issue.recommendedActionEn, actionBn: issue.recommendedActionBn, problemKey: issue.problemKey, requiresTechnician: issue.requiresTechnician },
      products: getProductsByIds(issue.recommendedProducts)
    }));

    return res.json({ success: true, analysis, matchedIssues: productMap, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Error in /api/analyze-engine-sound:', error);
    return res.status(500).json({ error: 'Failed to analyze engine sound' });
  }
});

// 10. Social webhook simulators (kept)
app.post('/api/whatsapp-webhook-sim', async (req, res) => {
  const { message, senderPhone } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  try {
    const ai = getGeminiClient();
    const prompt = `The user sent a WhatsApp message to Yamaha BD Official WhatsApp Bot (${DEFAULT_CONTACT.phone}): "${message}".
Generate a helpful auto-reply for WhatsApp format: *bold* for prices/names, _italics_, bullets, emojis (🛵🏍️🛠️📍). Include hotline 16508. Concise and structured.`;
    let replyMessage = '';
    try {
      const response = await generateGeminiContentWithRetry(ai, { model: 'gemini-3.6-flash', contents: prompt, config: { systemInstruction: YAMAHA_SYSTEM_INSTRUCTION } });
      replyMessage = response.text || '';
    } catch {
      replyMessage = generateLocalFallbackChatResponse(message, 'bn');
    }
    return res.json({ platform: 'whatsapp', senderPhone: senderPhone || '+8801711223344', replyMessage, timestamp: new Date().toISOString() });
  } catch {
    return res.status(500).json({ error: 'WhatsApp bot simulation failed' });
  }
});

app.post('/api/messenger-webhook-sim', async (req, res) => {
  const { message, senderPsid } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  try {
    const ai = getGeminiClient();
    const prompt = `The user sent a Facebook Messenger message to Yamaha Bangladesh Page: "${message}".
Generate a friendly Messenger-format auto-reply with quick action suggestions like [🏍️ View Price List], [📍 Find Showroom], [📅 Book Servicing], [💰 Latest Offers].`;
    let replyMessage = '';
    try {
      const response = await generateGeminiContentWithRetry(ai, { model: 'gemini-3.6-flash', contents: prompt, config: { systemInstruction: YAMAHA_SYSTEM_INSTRUCTION } });
      replyMessage = response.text || '';
    } catch {
      replyMessage = generateLocalFallbackChatResponse(message, 'bn');
    }
    return res.json({
      platform: 'messenger', senderPsid: senderPsid || 'fb_psid_982347102', replyMessage,
      quickReplies: ['🏍️ Price List BDT', '🔥 Latest Offers', '📍 Showrooms Near Me', '📅 Book Service'],
      timestamp: new Date().toISOString()
    });
  } catch {
    return res.status(500).json({ error: 'FB Messenger bot simulation failed' });
  }
});

// ===========================================================================
// Start Express + Vite
// ===========================================================================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Yamaha BD Chatbot Server running on http://localhost:${PORT}`);
  });

  // Start WhatsApp client in the background (never blocks server startup)
  initWhatsApp();
}

startServer();

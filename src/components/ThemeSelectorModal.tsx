import React from 'react';
import { Palette, Check, Sparkles, Layout, Monitor, Moon, Sun, Flame, Award, Smartphone, Eye } from 'lucide-react';
import { ThemeMode, LayoutMode, Language } from '../types';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  currentLayout: LayoutMode;
  setLayout: (layout: LayoutMode) => void;
  language: Language;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  setTheme,
  currentLayout,
  setLayout,
  language
}) => {
  if (!isOpen) return null;

  const themes: {
    id: ThemeMode;
    nameEn: string;
    nameBn: string;
    descriptionEn: string;
    descriptionBn: string;
    badge: string;
    badgeColor: string;
    previewBg: string;
    previewText: string;
    accentColor: string;
    swatches: string[];
  }[] = [
    {
      id: 'racing-dark',
      nameEn: 'Yamaha Racing Stealth (Default)',
      nameBn: 'ইয়ামাহা রেসিং স্টিলথ (ডিফল্ট)',
      descriptionEn: 'High-octane midnight dark theme with official Yamaha Racing Blue & cyan telemetry accents.',
      descriptionBn: 'অফিসিয়াল ইয়ামাহা রেসিং ব্লু এবং সাটিন মেটালিক ব্ল্যাক হাই-টেক থিম।',
      badge: 'Classic Racing',
      badgeColor: 'bg-[#004791] text-white',
      previewBg: 'bg-[#050505] border-gray-800',
      previewText: 'text-white',
      accentColor: '#004791',
      swatches: ['#050505', '#0a0a0a', '#004791', '#38bdf8']
    },
    {
      id: 'corporate-light',
      nameEn: 'Yamaha Showroom Light',
      nameBn: 'ইয়ামাহা শো-রুম লাইট (ক্লিন থিম)',
      descriptionEn: 'Ultra-clean corporate white & blue showroom design with high contrast legibility.',
      descriptionBn: 'উজ্জ্বল পরিষ্কার হোয়াইট ও ডিপ ব্লু কারপোরেট শো-রুম এক্সপেরিয়েন্স।',
      badge: 'Executive Clean',
      badgeColor: 'bg-blue-600 text-white',
      previewBg: 'bg-slate-50 border-slate-300',
      previewText: 'text-slate-900',
      accentColor: '#0284c7',
      swatches: ['#f8fafc', '#ffffff', '#0284c7', '#0f172a']
    },
    {
      id: 'cyber-neon',
      nameEn: 'Cyber-Neon (Dark Side / MT-Series)',
      nameBn: 'সাইবার-নিয়ন (এমটি ডার্ক সিরিজ)',
      descriptionEn: 'Hyper-naked MT-series inspired futuristic neon teal & electric cyan glassmorphism.',
      descriptionBn: 'এমটি-১৫ ডার্ক সাইড ইন্সপায়ার্ড সাইবার নিয়ন গ্লাস থিম।',
      badge: 'MT-15 Cyber',
      badgeColor: 'bg-cyan-500 text-black font-extrabold',
      previewBg: 'bg-[#070a12] border-cyan-900/50',
      previewText: 'text-cyan-100',
      accentColor: '#00f5d4',
      swatches: ['#070a12', '#0f172a', '#00f5d4', '#ff4d00']
    },
    {
      id: 'championship-gold',
      nameEn: 'Championship Gold & Carbon',
      nameBn: 'চ্যাম্পিয়নশিপ গোল্ড ও কার্বন (লকজারি)',
      descriptionEn: 'Anniversary edition luxury theme with warm matte titanium graphite & championship gold accents.',
      descriptionBn: 'অ্যানিভার্সারি স্পেশাল গোল্ডেন ট্রিম ও প্রিমিয়াম কার্বন ব্ল্যাক থিম।',
      badge: '60th Anniversary',
      badgeColor: 'bg-amber-500 text-black font-extrabold',
      previewBg: 'bg-[#0d0d0d] border-amber-900/40',
      previewText: 'text-amber-100',
      accentColor: '#eab308',
      swatches: ['#0d0d0d', '#171717', '#eab308', '#fef08a']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0f172a] border border-gray-700 rounded-2xl max-w-4xl w-full p-6 text-white shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#004791] text-white rounded-xl shadow-lg shadow-[#004791]/40">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>{language === 'bn' ? 'থিম এবং ইউআই লেআউট ডেমো গ্যালাক্সি' : 'Theme & UI Layout Showcase'}</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Live Preview
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                {language === 'bn' 
                  ? 'আপনার পছন্দের ভিজ্যুয়াল থিম বা লেআউট ফরমেট নির্বাচন করুন' 
                  : 'Select your preferred visual style or multi-column layout format'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-gray-800/80 hover:bg-gray-800 rounded-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Section 1: Visual Themes */}
        <div className="mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>{language === 'bn' ? '১. ভিজ্যুয়াল কালার থিমসমূহ' : '1. Select Color Theme'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition duration-200 relative ${
                    isSelected
                      ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/50 shadow-xl'
                      : 'border-gray-800 bg-slate-900/60 hover:border-gray-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Badge & Active Check */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.badgeColor}`}>
                      {t.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'সক্রিয়' : 'Active'}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-base text-white mb-1">
                    {language === 'bn' ? t.nameBn : t.nameEn}
                  </h4>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    {language === 'bn' ? t.descriptionBn : t.descriptionEn}
                  </p>

                  {/* Live Mini Preview Box */}
                  <div className={`p-3 rounded-lg border mb-3 ${t.previewBg} transition`}>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className={`font-bold ${t.previewText}`}>YamBot AI Demo</span>
                      <span className="text-[10px] text-gray-400">0% EMI BDT 14,200/mo</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.accentColor }}></div>
                      <div className="h-1.5 flex-1 rounded bg-gray-700/50"></div>
                      <button 
                        className="text-[10px] font-bold px-2 py-0.5 rounded text-white shadow-sm"
                        style={{ backgroundColor: t.accentColor }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Swatch dots */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-mono uppercase">Palette:</span>
                    <div className="flex items-center gap-1">
                      {t.swatches.map((hex, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: UI Layout Formats (4 Options) */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
            <Layout className="w-4 h-4" />
            <span>{language === 'bn' ? '২. ইউআই লেআউট ফরমেট (৪টি অপশন)' : '2. Select UI Layout Format (4 Options)'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Layout 1: Standard Full View */}
            <div
              onClick={() => setLayout('standard')}
              className={`cursor-pointer rounded-xl p-4 border transition ${
                currentLayout === 'standard'
                  ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-xl'
                  : 'border-gray-800 bg-slate-900/60 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? '১. স্ট্যান্ডার্ড ট্যাবেড ভিউ' : '1. Standard Tabbed View'}</span>
                </div>
                {currentLayout === 'standard' && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {language === 'bn'
                  ? 'সবথেকে ক্লিন স্ট্যান্ডার্ড সিঙ্গল-পেজ ফোকাসড লেআউট।'
                  : 'Clean focused tabbed navigation where each section gets full-screen view.'}
              </p>
              {/* Diagram */}
              <div className="h-14 rounded-lg bg-slate-950 border border-gray-800 p-2 flex flex-col gap-1">
                <div className="h-3 bg-slate-800 rounded flex items-center px-2 text-[8px] text-gray-400">Header Nav Tabs</div>
                <div className="flex-1 bg-slate-900 rounded border border-gray-800 flex items-center justify-center text-[9px] text-emerald-400 font-bold">
                  Active Screen Content (100% Focus)
                </div>
              </div>
            </div>

            {/* Layout 2: Split Dashboard View */}
            <div
              onClick={() => setLayout('split-dashboard')}
              className={`cursor-pointer rounded-xl p-4 border transition ${
                currentLayout === 'split-dashboard'
                  ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-xl'
                  : 'border-gray-800 bg-slate-900/60 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'bn' ? '২. স্প্লিট ডুয়াল-প্যানেল ড্যাশবোর্ড' : '2. Split Dual-Panel Mode'}</span>
                </div>
                {currentLayout === 'split-dashboard' && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {language === 'bn'
                  ? 'বাঁদিকে পারমানেন্ট এআই অ্যাসিস্ট্যান্ট চ্যাটবট + ডানদিকে লাইভ ক্যাটালগ ও বুকিং হাব।'
                  : 'Side-by-side view: AI Assistant fixed on left + catalog & service tools on right.'}
              </p>
              {/* Diagram */}
              <div className="h-14 rounded-lg bg-slate-950 border border-gray-800 p-1 flex gap-1">
                <div className="w-2/5 bg-blue-950/80 rounded border border-blue-800/60 p-1 flex items-center justify-center text-[8px] text-blue-300 font-bold">
                  YamBot AI Chat
                </div>
                <div className="w-3/5 bg-slate-900 rounded border border-gray-800 p-1 flex items-center justify-center text-[8px] text-emerald-300 font-bold">
                  Catalog & Booking Panel
                </div>
              </div>
            </div>

            {/* Layout 3: Command Center Grid View */}
            <div
              onClick={() => setLayout('command-center')}
              className={`cursor-pointer rounded-xl p-4 border transition ${
                currentLayout === 'command-center'
                  ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-xl'
                  : 'border-gray-800 bg-slate-900/60 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>{language === 'bn' ? '৩. গ্রিড কমান্ড সেন্টার (Multi-Card Telemetry)' : '3. Multi-Card Command Center'}</span>
                </div>
                {currentLayout === 'command-center' && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {language === 'bn'
                  ? 'একক স্ক্রিনে একসঙ্গে চ্যাটবট, সার্ভিস লকেটর, ও প্রাইজ ক্যারাউজালের ৩-কলাম ড্যাশবোর্ড।'
                  : 'High-density telemetry dashboard with AI chat, showroom locator & EMI tools on 1 screen.'}
              </p>
              {/* Diagram */}
              <div className="h-14 rounded-lg bg-slate-950 border border-gray-800 p-1 grid grid-cols-3 gap-1">
                <div className="bg-blue-950/60 rounded border border-blue-800/40 flex items-center justify-center text-[7px] text-blue-300 font-bold">
                  AI Chat
                </div>
                <div className="bg-slate-900 rounded border border-gray-800 flex items-center justify-center text-[7px] text-amber-300 font-bold">
                  Live Pricing
                </div>
                <div className="bg-slate-900 rounded border border-gray-800 flex items-center justify-center text-[7px] text-emerald-300 font-bold">
                  Quick Service
                </div>
              </div>
            </div>

            {/* Layout 4: Compact Portal View */}
            <div
              onClick={() => setLayout('compact-portal')}
              className={`cursor-pointer rounded-xl p-4 border transition ${
                currentLayout === 'compact-portal'
                  ? 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/50 shadow-xl'
                  : 'border-gray-800 bg-slate-900/60 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>{language === 'bn' ? '৪. কম্প্যাক্ট পোর্টেবল পোর্টাল (Mobile-First Bar)' : '4. Compact Mobile-First Portal'}</span>
                </div>
                {currentLayout === 'compact-portal' && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {language === 'bn'
                  ? 'স্মার্টফোন স্পেসিফিক ডক বার ও দ্রুত এক্সেস ড্রয়ার সহ দ্রুত চ্যাটিং পোর্টাল।'
                  : 'Mobile-first compact view with sticky bottom quick app-bar and floating drawer.'}
              </p>
              {/* Diagram */}
              <div className="h-14 rounded-lg bg-slate-950 border border-gray-800 p-1 flex flex-col justify-between">
                <div className="h-7 bg-slate-900 rounded border border-gray-800 flex items-center justify-center text-[8px] text-purple-300 font-bold">
                  Stream Feed
                </div>
                <div className="h-3 bg-purple-900/60 rounded border border-purple-700/50 flex items-center justify-center text-[7px] text-white font-bold">
                  Sticky Bottom Quick Dock
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-8 pt-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {language === 'bn' ? 'যেকোনো সময় ওপরের টপবার থেকে থিম পরিবর্তন করা যাবে।' : 'You can switch themes anytime from the top bar.'}
          </p>
          <button
            onClick={onClose}
            className="bg-[#004791] hover:bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-[#004791]/40 transition text-sm flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'bn' ? 'থিম প্র প্রয়োগ করুন' : 'Confirm & Apply Theme'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

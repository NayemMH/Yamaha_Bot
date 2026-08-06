import React from 'react';
import { MessageSquare, Compass, Tag, MapPin, Calendar, Share2, PhoneCall, Volume2, Stethoscope } from 'lucide-react';
import { Language, ThemeMode, LayoutMode } from '../types';

export type AppTab = 'chat' | 'recommend' | 'service-assistant' | 'audio-analyzer' | 'prices' | 'locator' | 'booking' | 'social';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentTheme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  currentLayout: LayoutMode;
  onOpenThemeModal: () => void;
}

interface NavItem {
  tab: AppTab;
  icon: React.ElementType;
  iconColor: string;
  labelEn: string;
  labelBn: string;
  shortEn: string;
  shortBn: string;
}

const NAV_ITEMS: NavItem[] = [
  { tab: 'chat',              icon: MessageSquare, iconColor: 'text-blue-300',    labelEn: 'AI Chatbot',        labelBn: 'এআই চ্যাটবট',          shortEn: 'Chatbot',   shortBn: 'চ্যাটবট' },
  { tab: 'recommend',         icon: Compass,       iconColor: 'text-indigo-300',  labelEn: 'Bike Recommender',  labelBn: 'বাইক রেকমেন্ডার',      shortEn: 'Finder',    shortBn: 'পছন্দ' },
  { tab: 'service-assistant', icon: Stethoscope,   iconColor: 'text-emerald-300', labelEn: 'Service Assistant', labelBn: 'সার্ভিস অ্যাসিস্ট্যান্ট', shortEn: 'Service AI', shortBn: 'সার্ভিস' },
  { tab: 'audio-analyzer',    icon: Volume2,       iconColor: 'text-amber-300',   labelEn: 'Sound Analyzer',    labelBn: 'সাউন্ড অ্যানালাইজার',   shortEn: 'Sound AI',  shortBn: 'সাউন্ড' },
  { tab: 'prices',            icon: Tag,           iconColor: 'text-emerald-300', labelEn: 'Price & Offers',    labelBn: 'দাম ও অফার',           shortEn: 'Prices',    shortBn: 'মূল্য' },
  { tab: 'locator',           icon: MapPin,        iconColor: 'text-amber-300',   labelEn: 'Showrooms & Stock', labelBn: 'শোরুম ও স্টক',         shortEn: 'Showrooms', shortBn: 'শোরুম' },
  { tab: 'booking',           icon: Calendar,      iconColor: 'text-cyan-300',    labelEn: 'Book Service',      labelBn: 'সার্ভিস বুকিং',        shortEn: 'Booking',   shortBn: 'বুকিং' },
  { tab: 'social',            icon: Share2,        iconColor: 'text-emerald-300', labelEn: 'WhatsApp / FB',     labelBn: 'WhatsApp / FB',        shortEn: 'Social',    shortBn: 'সোশ্যাল' }
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  currentTheme
}) => {
  const isLight = currentTheme === 'corporate-light';

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 border-b shadow-2xl ${
      isLight ? 'bg-white text-slate-900 border-slate-200 shadow-slate-200' : 'bg-[#0a0a0a] text-white border-gray-800'
    }`}>
      {/* Top banner */}
      <div className={`px-4 py-1.5 text-xs border-b transition-colors ${
        isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#050505] border-gray-800 text-gray-300'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-blue-600 dark:text-blue-300">Yamaha Bangladesh (ACI Motors)</span>
            <span className="hidden sm:inline text-gray-400">•</span>
            <span className="hidden sm:inline opacity-80">
              {language === 'bn' ? 'অফিসিয়াল এআই সেলস, সার্ভিস ও কেয়ার পোর্টাল' : 'Official AI Sales, Service & Care Portal'}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="tel:16508"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border font-medium transition ${
                isLight ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-[#004791]/20 text-blue-200 border-[#004791]/30'
              }`}
            >
              <PhoneCall className="w-3 h-3 text-[#004791]" />
              <span>Hotline: <strong>16508</strong></span>
            </a>

            <div className={`flex items-center p-0.5 rounded-lg border ${
              isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#111111] border-gray-800'
            }`}>
              {(['en', 'bn'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 text-xs rounded-md font-medium transition ${
                    language === lang
                      ? 'bg-[#004791] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'EN' : 'বাংলা'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div onClick={() => setActiveTab('chat')} className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-lg bg-[#004791] shrink-0 flex items-center justify-center font-bold italic tracking-tighter text-xl text-white shadow-lg shadow-[#004791]/30 group-hover:scale-105 transition">
            Y
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-lg sm:text-xl tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                YAMAHA <span className="text-[#004791]">BD</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#004791]/30 border border-[#004791]/50 text-blue-300 px-1.5 py-0.2 rounded">
                ASSISTANT
              </span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
              Sales • Service • Yamalube • CEAT • Liqui Moly • Solar
            </p>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#111111] p-1 rounded-xl border border-gray-800">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === item.tab
                    ? 'bg-[#004791] text-white shadow-md shadow-[#004791]/30 border border-blue-400/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.iconColor}`} />
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden bg-[#0a0a0a] border-t border-gray-800 px-2 py-1.5 overflow-x-auto flex items-center gap-1 scrollbar-none">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`flex-1 min-w-[68px] flex flex-col items-center gap-1 py-1.5 px-2 rounded-lg text-[10px] font-medium whitespace-nowrap transition ${
                activeTab === item.tab ? 'bg-[#004791] text-white' : 'text-gray-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? item.shortBn : item.shortEn}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};

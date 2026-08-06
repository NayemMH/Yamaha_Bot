import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { ChatbotView } from './components/ChatbotView';
import { RecommenderView } from './components/RecommenderView';
import { ServiceAssistantView } from './components/ServiceAssistantView';
import { AudioEngineAnalyzerView } from './components/AudioEngineAnalyzerView';
import { PriceListAndOffersView } from './components/PriceListAndOffersView';
import { ServiceCenterLocatorView } from './components/ServiceCenterLocatorView';
import { BookServiceView } from './components/BookServiceView';
import { SocialIntegrationView } from './components/SocialIntegrationView';
import { FAQModal } from './components/FAQModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { Language, ThemeMode, LayoutMode } from './types';
import { PhoneCall, ShieldCheck, Heart, Palette } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('chat');
  const [language, setLanguage] = useState<Language>('bn'); // Default Bangla for BD market
  const [theme, setTheme] = useState<ThemeMode>('racing-dark');
  const [layout, setLayout] = useState<LayoutMode>('standard');
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [preSelectedCenterId, setPreSelectedCenterId] = useState<string | undefined>(undefined);

  // Synchronize active theme with document element attribute for instant global CSS styling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSelectCenterForBooking = (centerId: string) => {
    setPreSelectedCenterId(centerId);
    setActiveTab('booking');
  };

  const getContainerBg = () => {
    switch (theme) {
      case 'corporate-light':
        return 'bg-[#f8fafc] text-slate-900 selection:bg-blue-600 selection:text-white';
      case 'cyber-neon':
        return 'bg-[#070a12] text-cyan-100 selection:bg-cyan-500 selection:text-black';
      case 'championship-gold':
        return 'bg-[#0d0d0d] text-amber-100 selection:bg-amber-500 selection:text-black';
      case 'racing-dark':
      default:
        return 'bg-[#050505] text-gray-100 selection:bg-[#004791] selection:text-white';
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatbotView language={language} onNavigateTab={setActiveTab} />;
      case 'recommend':
        return <RecommenderView language={language} onNavigateTab={setActiveTab} />;
      case 'service-assistant':
        return <ServiceAssistantView language={language} onNavigateTab={setActiveTab} />;
      case 'audio-analyzer':
        return <AudioEngineAnalyzerView language={language} onNavigateTab={setActiveTab} />;
      case 'prices':
        return <PriceListAndOffersView language={language} onNavigateTab={setActiveTab} />;
      case 'locator':
        return <ServiceCenterLocatorView language={language} onSelectCenterForBooking={handleSelectCenterForBooking} />;
      case 'booking':
        return <BookServiceView language={language} preSelectedCenterId={preSelectedCenterId} />;
      case 'social':
        return <SocialIntegrationView language={language} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${getContainerBg()}`}>
      {/* Header with Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        currentTheme={theme}
        setTheme={setTheme}
        currentLayout={layout}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
      />

      {/* Floating Theme Quick Selector Switcher pill for quick preview */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-gray-700 text-white p-1.5 rounded-full shadow-2xl">
        <button
          onClick={() => setIsThemeModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold transition shadow-lg shadow-blue-500/20"
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'থিম ডেমো পরিবর্তন' : 'Demo Switcher'}</span>
        </button>
      </div>

      {/* Theme & Layout Selector Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={theme}
        setTheme={setTheme}
        currentLayout={layout}
        setLayout={setLayout}
        language={language}
      />

      {/* Main Content Area supporting 4 Layout Modes */}
      <main className="flex-1 pb-16">
        {layout === 'split-dashboard' && (
          /* Layout 2: Split Dual-Panel Mode */
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 h-[750px] sticky top-20">
              <ChatbotView language={language} onNavigateTab={setActiveTab} />
            </div>
            <div className="lg:col-span-7">
              {activeTab === 'chat' ? (
                <PriceListAndOffersView language={language} onNavigateTab={setActiveTab} />
              ) : (
                renderActiveView()
              )}
            </div>
          </div>
        )}

        {layout === 'command-center' && (
          /* Layout 3: Multi-Card Command Center Telemetry Grid */
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
            {/* Top Telemetry Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/80 border border-gray-800 p-4 rounded-2xl">
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Official Hotline</div>
                <div className="text-base font-extrabold text-blue-400">16508 (ACI Motors)</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Top Selling Model</div>
                <div className="text-base font-extrabold text-yellow-400">YZF R15 V4</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">EMI Facility</div>
                <div className="text-base font-extrabold text-emerald-400">0% Interest / 36 Mo</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase font-bold">Showrooms BD</div>
                <div className="text-base font-extrabold text-cyan-400">120+ Active Outlets</div>
              </div>
            </div>

            {/* 3 Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: YamBot AI Assistant */}
              <div className="lg:col-span-4 h-[700px] border border-gray-800 rounded-2xl overflow-hidden bg-slate-950">
                <ChatbotView language={language} onNavigateTab={setActiveTab} />
              </div>

              {/* Column 2: Price & EMI Calculator / Recommender */}
              <div className="lg:col-span-4 space-y-6">
                <PriceListAndOffersView language={language} onNavigateTab={setActiveTab} />
              </div>

              {/* Column 3: Showroom Locator & Service Booking */}
              <div className="lg:col-span-4 space-y-6">
                <ServiceCenterLocatorView
                  language={language}
                  onSelectCenterForBooking={handleSelectCenterForBooking}
                />
              </div>
            </div>
          </div>
        )}

        {layout === 'compact-portal' && (
          /* Layout 4: Compact Mobile-First Portal Stream Layout */
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {renderActiveView()}
          </div>
        )}

        {layout === 'standard' && (
          /* Layout 1: Standard Full View */
          <>{renderActiveView()}</>
        )}

        {/* Global FAQs Section at bottom of pages */}
        {activeTab !== 'chat' && (
          <div className="mt-12">
            <FAQModal language={language} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t py-10 px-4 transition-colors ${
        theme === 'corporate-light'
          ? 'bg-slate-100 text-slate-600 border-slate-300'
          : 'bg-[#0a0a0a] text-gray-400 border-neutral-800'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className={`font-extrabold text-lg tracking-wider ${theme === 'corporate-light' ? 'text-slate-900' : 'text-white'}`}>YAMAHA</span>
              <span className="bg-[#004791] text-white font-bold px-1.5 py-0.2 rounded text-[10px]">BD</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Official Yamaha Motorbike AI Sales, Service & Product Assistant under ACI Motors Limited — covering Yamalube, CEAT, Liqui Moly, EcoFlow, GoodWe & Aiko Solar.
            </p>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>ACI Motors Authorized Distributor</span>
            </div>
          </div>

          <div>
            <h4 className={`font-bold uppercase tracking-wider mb-3 ${theme === 'corporate-light' ? 'text-slate-900' : 'text-white'}`}>Quick Navigation</h4>
            <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('chat')} className="hover:text-blue-500 transition">AI YamBot Chat</button></li>
              <li><button onClick={() => setActiveTab('recommend')} className="hover:text-blue-500 transition">Personal Bike Recommender</button></li>
              <li><button onClick={() => setActiveTab('service-assistant')} className="hover:text-blue-500 transition">Service Assistant & Diagnostics</button></li>
              <li><button onClick={() => setActiveTab('prices')} className="hover:text-blue-500 transition">Price List & 0% EMI Calculator</button></li>
              <li><button onClick={() => setActiveTab('locator')} className="hover:text-blue-500 transition">Showrooms & Stock Locator</button></li>
              <li><button onClick={() => setActiveTab('booking')} className="hover:text-blue-500 transition">Schedule Maintenance Service</button></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-bold uppercase tracking-wider mb-3 ${theme === 'corporate-light' ? 'text-slate-900' : 'text-white'}`}>Yamaha Lineup BD</h4>
            <ul className="space-y-1.5 opacity-90">
              <li>Yamaha YZF R15 V4 & R15M</li>
              <li>Yamaha MT-15 V2 Streetfighter</li>
              <li>Yamaha FZ-S V4 & FZS V2</li>
              <li>Yamaha FZ-X Scrambler & FZ25</li>
              <li>Yamaha Saluto 125, RayZR 125 & Aerox 155</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className={`font-bold uppercase tracking-wider ${theme === 'corporate-light' ? 'text-slate-900' : 'text-white'}`}>ACI Motors Customer Care</h4>
            <a
              href="tel:16508"
              className="inline-flex items-center gap-2 bg-[#004791] hover:bg-blue-700 text-white font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-[#004791]/30 transition text-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Hotline: 16508</span>
            </a>
            <p className="text-[11px] opacity-75 leading-normal">
              ACI Centre, 245 Tejgaon Industrial Area, Dhaka-1208, Bangladesh.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-500/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] opacity-75 gap-2">
          <p>© {new Date().getFullYear()} Yamaha Motorbike Bangladesh (ACI Motors). All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Rev Your Heart</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>Yamaha BD</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

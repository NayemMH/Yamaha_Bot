import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Volume2, VolumeX, RotateCcw, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, PhoneCall, ExternalLink, ShoppingCart, Mail, Phone, MapPin, UserCheck, X, Building, MessageCircle } from 'lucide-react';
import { ChatMessage, Language, BikeModel, PurchaseLead } from '../types';
import { YAMAHA_BIKES } from '../data/yamahaData';
import { LocationPicker } from './LocationPicker';

interface ChatbotViewProps {
  language: Language;
  onNavigateTab: (tab: 'chat' | 'recommend' | 'service-assistant' | 'audio-analyzer' | 'prices' | 'locator' | 'booking' | 'social') => void;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({ language, onNavigateTab }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: language === 'bn'
        ? 'স্বাগতম! আমি "YamBot" - ইয়ামাহা বাংলাদেশ (এসিআই মটরস) এর অফিসিয়াল এআই স্মার্ট অ্যাসিস্ট্যান্ট।\n\nআমি আপনাকে ইয়ামাহা বাইকের বর্তমান অফিসিয়াল প্রাইস, স্পেসিফিকেশন, ক্যাশব্যাক অফার, শোরুম ও ইনভেন্টরি চেক এবং সার্ভিস বুকিংয়ে সাহায্য করতে পারি। আপনি কীভাবে সাহায্য চান?'
        : 'Welcome to Yamaha Motorbike Bangladesh! I am "YamBot", your official AI Customer Specialist.\n\nI can assist you with official BDT price lists, current cashback offers, bike comparisons, showroom stock checks, and maintenance appointment bookings. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuickReplies: language === 'bn' ? [
        '🛒 R15 V4 বাইকটি ক্রয় করতে চাই',
        '🏍️ R15 V4 এবং MT-15 এর বর্তমান দাম কত?',
        '🔥 নতুন ক্যাশব্যাক অফারগুলো দেখান',
        '📍 ঢাকায় কাছে সার্ভিস সেন্টার ও শোরুম',
        '📅 অনলাইন ফ্রি সার্ভিস বুকিং করবো কীভাবে?'
      ] : [
        '🛒 I Want to Purchase R15 V4',
        '🏍️ What is the price of R15 V4 in BD?',
        '🔥 Show current cashback offers',
        '📍 Showrooms & Service Centers in Dhaka',
        '📅 How to book a free service appointment?'
      ]
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [enableAudio, setEnableAudio] = useState(false);

  // Purchase Lead Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custDistrict, setCustDistrict] = useState('Dhaka');
  const [custUpazila, setCustUpazila] = useState('Tejgaon / Central');
  const [selectedBike, setSelectedBike] = useState('Yamaha YZF R15 V4');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleOpenPurchaseModal = (bikeName?: string) => {
    if (bikeName) setSelectedBike(bikeName);
    setShowPurchaseModal(true);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || isSubmittingLead) return;

    setIsSubmittingLead(true);
    try {
      const response = await fetch('/api/purchase-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName,
          customerPhone: custPhone,
          district: custDistrict,
          upazila: custUpazila,
          preferredBike: selectedBike
        })
      });

      const data = await response.json();

      if (data.success && data.lead) {
        // Auto-launch WhatsApp Web/App pre-filled lead message
        if (data.whatsappNotice?.whatsappUrl) {
          try {
            window.open(data.whatsappNotice.whatsappUrl, '_blank');
          } catch (e) {
            console.log('Popup blocked for automatic WhatsApp opening');
          }
        }

        const confirmMsg: ChatMessage = {
          id: `lead-confirm-${Date.now()}`,
          sender: 'bot',
          text: language === 'bn'
            ? `ধন্যবাদ ${custName}! আপনার ${selectedBike} বাইকটির ক্রয় সংক্রান্ত তথ্য আমাদের সিনিয়র সেলস স্পেশালিস্ট **Md. Mahadi Hassan** (${data.salesman.location}, ইমেইল: Mahadi.Nayem@aci-bd.com, হোয়াটসঅ্যাপ: +8801787687254) এর কাছে ইমেইল এবং হোয়াটসঅ্যাপে পাঠানো হয়েছে।\n\n📱 **হোয়াটসঅ্যাপ ডিসপ্যাচ:** নিচে দেওয়া সবুজ হোয়াটসঅ্যাপ বোতামে ক্লিক করে সরাসরি মো: মাহাদী হাসান (+8801787687254) এর হোয়াটসঅ্যাপে প্রি-ফরম্যাটেড লিডটি পাঠান।`
            : `Thank you ${custName}! Your purchase inquiry for ${selectedBike} has been dispatched via Email & WhatsApp Lead Notice directly to Senior Sales Representative **Md. Mahadi Hassan** (${data.salesman.location}, Email: Mahadi.Nayem@aci-bd.com, WhatsApp: +8801787687254).\n\n📱 **WhatsApp Direct Dispatch:** Click the green WhatsApp button on the card below to send the pre-filled lead directly to Mr. Mahadi Hassan (+8801787687254)!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          purchaseLeadRef: {
            ...data.lead,
            whatsappNotice: data.whatsappNotice
          },
          suggestedQuickReplies: [
            '📍 Find Nearest Showroom in Dhaka',
            '💰 EMI Calculator & Loan Eligibility'
          ]
        };

        setMessages(prev => [...prev, confirmMsg]);
        setShowPurchaseModal(false);
        setCustName('');
        setCustPhone('');
      }
    } catch (err) {
      console.error('Lead submission error:', err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*_#`~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    // Trigger purchase modal directly if user says "buy" or "purchase" or clicks buy trigger
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('buy') || lowerQuery.includes('purchase') || lowerQuery.includes('ক্রয়') || lowerQuery.includes('কিনবো')) {
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

    // Check if query mentions a specific bike to attach a custom bike card
    const matchedBike = YAMAHA_BIKES.find(b => 
      lowerQuery.includes(b.name.toLowerCase()) || 
      lowerQuery.includes(b.id.toLowerCase()) || 
      (b.id === 'r15-v4' && (lowerQuery.includes('r15') || lowerQuery.includes('v4'))) ||
      (b.id === 'mt-15-v2' && lowerQuery.includes('mt')) ||
      (b.id === 'fzs-v4-fi' && lowerQuery.includes('fz'))
    );

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6),
          language
        })
      });

      const data = await response.json();
      const botText = data.text || 'Sorry, I am unable to connect right now. Please call ACI Motors Helpline 16508.';

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bikeCard: matchedBike,
        suggestedQuickReplies: language === 'bn' ? [
          '🛒 বাইকটি ক্রয় করতে চাই (সরাসরি যোগাযোগ)',
          '📅 সার্ভিস বুকিং করুন',
          '💰 ইএমআই (EMI) লোন ক্যালকুলেটর'
        ] : [
          '🛒 I Want to Purchase This Bike',
          '📅 Book Service Now',
          '💰 EMI Monthly Loan Calculator'
        ]
      };

      setMessages(prev => [...prev, botMsg]);

      if (enableAudio) {
        speakText(botText);
      }
    } catch (err) {
      console.error('Chatbot request error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: language === 'bn'
          ? 'দুঃখিত, সংযোগে সমস্যা হয়েছে। আপনি অনুগ্রহ করে ইয়ামাহা এসিআই মটরস হটলাইন ১৬৫০৮ নম্বরে ফোন করুন অথবা নিচে থেকে বিকল্প অপশন বেছে নিন।'
          : 'Sorry, a network connection error occurred. Please feel free to call our hotline at 16508 for immediate assistance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    stopSpeech();
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'bot',
        text: language === 'bn'
          ? 'চ্যাট হিস্ট্রি রিসেট হয়েছে! ইয়ামাহা বাইক সম্পর্কে অন্য কিছু জানার থাকলে লিখুন।'
          : 'Chat history reset! Feel free to ask anything about Yamaha motorbikes in Bangladesh.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuickReplies: [
          '🏍️ Show R15 V4 Price & Offers',
          '📍 Showrooms in Chittagong',
          '⛽ Highest Mileage Yamaha Bike'
        ]
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-140px)] min-h-[580px]">
      {/* Top Bar inside Chatbot */}
      <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-xl gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full bg-[#004791]/20 border border-[#004791]/40 flex items-center justify-center text-blue-400 transition ${isLoading ? 'animate-pulse' : ''}`}>
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-main)]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[var(--text-main)] text-sm sm:text-base">YamBot - Yamaha AI Support</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
                Online
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {language === 'bn' ? 'এসিআই মটরস অফিসিয়াল নলেজবেস যুক্ত' : 'Powered by Gemini AI & ACI Motors Knowledge'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio speech toggle */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeech();
              }
              setEnableAudio(!enableAudio);
            }}
            title="Toggle Voice Speech Output"
            className={`p-2 rounded-xl text-xs font-medium border transition ${
              enableAudio || isSpeaking
                ? 'bg-[#004791]/20 text-blue-400 border-[#004791]/50'
                : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-main)]'
            }`}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4 text-red-400 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleClearChat}
            title="Reset Chat"
            className="p-2 bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message History Window */}
      <div className="flex-1 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)] p-4 overflow-y-auto space-y-4 shadow-inner scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col animate-slide-up-fade ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`flex items-start gap-2.5 max-w-[90%] sm:max-w-[80%] ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-[#004791] text-white shadow-md shadow-[#004791]/30'
                    : 'bg-[var(--bg-subcard)] text-blue-400 border border-[var(--border-color)]'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Speech Bubble */}
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-[#004791] text-white rounded-tr-none shadow-lg shadow-[#004791]/10'
                    : 'bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-tl-none shadow-md'
                }`}
              >
                {msg.text}

                {/* Bike Card embedded if matched */}
                {msg.bikeCard && (
                  <div className="mt-3 bg-[var(--bg-main)] border border-[#004791]/40 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-center">
                    <img
                      src={msg.bikeCard.image}
                      alt={msg.bikeCard.name}
                      className="w-full sm:w-28 h-20 object-cover rounded-lg border border-[var(--border-color)]"
                    />
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--text-main)] text-sm">{msg.bikeCard.name}</span>
                        <span className="text-xs bg-[#004791]/30 text-blue-300 px-2 py-0.5 rounded-md font-semibold border border-[#004791]/40">
                          {msg.bikeCard.engineCc}cc
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">{msg.bikeCard.tagline}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="font-extrabold text-emerald-400 text-sm">
                          ৳{(msg.bikeCard.offerPriceBDT || msg.bikeCard.priceBDT).toLocaleString()}
                        </span>
                        {msg.bikeCard.cashbackBDT && (
                          <span className="bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded text-[10px] font-bold">
                            ৳{msg.bikeCard.cashbackBDT.toLocaleString()} Off
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => handleOpenPurchaseModal(msg.bikeCard?.name)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition shadow-md"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ক্রয় করতে চাই' : 'Buy Bike'}</span>
                      </button>
                      <button
                        onClick={() => onNavigateTab('prices')}
                        className="px-3 py-1.5 bg-[#004791] hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                      >
                        <span>{language === 'bn' ? 'বিস্তারিত' : 'View Specs'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Purchase Lead Confirmation Slip */}
                {msg.purchaseLeadRef && (
                  <div className="mt-3 bg-[var(--bg-main)] border-2 border-emerald-500/60 rounded-xl p-3.5 text-xs text-left space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Sales Representative Notified!</span>
                      </div>
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">{msg.purchaseLeadRef.leadRef}</span>
                    </div>

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

                    {/* Auto-Dispatched WhatsApp Lead Notice Badge & Direct Action */}
                    <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-lg p-2.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <span>WhatsApp Lead Ready (+8801787687254)</span>
                        </span>
                        <span className="text-[10px] bg-emerald-900/60 text-emerald-200 px-1.5 py-0.5 rounded border border-emerald-500/30">Auto-Formatted</span>
                      </div>
                      <p className="text-[10px] text-[var(--text-main)] leading-normal">
                        Lead notice formatted for Senior Sales Representative <strong className="text-[var(--text-main)]">Md. Mahadi Hassan (+8801787687254)</strong>. Tap below to launch WhatsApp and deliver directly to his phone!
                      </p>
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
                    </div>

                    <div className="border-t border-[var(--border-color)] pt-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <span className="text-[var(--text-muted)] flex items-center gap-1">
                        <Mail className="w-3 h-3 text-blue-400" />
                        <span>Salesman Contact: <strong className="text-[var(--text-main)]">+8801787687254</strong></span>
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
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
                  </div>
                )}

                <span
                  className={`block text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-blue-100/80 text-right' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>

            {/* Suggested Quick Reply Chips */}
            {msg.suggestedQuickReplies && msg.suggestedQuickReplies.length > 0 && (
              <div className="mt-2.5 ml-10 flex flex-wrap gap-1.5 max-w-[85%]">
                {msg.suggestedQuickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    className="text-xs bg-[var(--bg-subcard)] hover:bg-[#004791]/20 hover:border-[#004791]/60 text-[var(--text-main)] hover:text-blue-200 border border-[var(--border-color)] px-3 py-1.5 rounded-full transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>{reply}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

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

        <div ref={chatEndRef} />
      </div>

      {/* Preset Action Buttons Grid */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[var(--text-muted)] text-[11px] font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          {language === 'bn' ? 'দ্রুত প্রশ্ন:' : 'Quick Questions:'}
        </span>
        {[
          { labelEn: 'R15 V4 Price', labelBn: 'R15 V4 দাম', text: 'What is the exact price and cashback offer for R15 V4 in BD?' },
          { labelEn: 'MT-15 V2 Specs', labelBn: 'MT-15 বৈশিষ্ট্য', text: 'Tell me MT-15 V2 features and mileage in Bangladesh' },
          { labelEn: 'Dhaka Showrooms', labelBn: 'ঢাকার শোরুম', text: 'Show top Yamaha authorized service centers and showrooms in Dhaka' },
          { labelEn: '0% EMI Scheme', labelBn: '০% ইএমআই সুবিধা', text: 'How can I buy a Yamaha bike with 0% EMI loan in Bangladesh?' }
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(item.text)}
            className="shrink-0 bg-[var(--bg-main)] hover:bg-[var(--bg-subcard)] text-[var(--text-main)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg transition"
          >
            {language === 'bn' ? item.labelBn : item.labelEn}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="mt-2 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[var(--bg-main)] border border-[var(--border-color)] focus-within:border-[#004791] p-2 rounded-2xl shadow-xl transition"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'ইয়ামাহা বাইকের দাম, সার্ভিস বা যে কোনো বিষয়ে লিখুন (বাংলা বা ইংরেজি)...'
                : 'Ask YamBot about Yamaha prices, offers, specs, maintenance...'
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-white flex items-center gap-1.5 transition ${
              inputPrompt.trim() && !isLoading
                ? 'bg-[#004791] hover:bg-blue-700 shadow-lg shadow-[#004791]/30'
                : 'bg-[var(--bg-subcard)] text-[var(--text-muted)] cursor-not-allowed border border-[var(--border-color)]'
            }`}
          >
            <span>{language === 'bn' ? 'পাঠান' : 'Send'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Purchase Assistance Direct Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[var(--bg-card)] border border-[#004791]/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-subcard)] hover:bg-[var(--border-color)] rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-main)] text-base">
                  {language === 'bn' ? 'ইয়ামাহা বাইক ক্রয় অনুসন্ধান' : 'Yamaha Bike Purchase Assistance'}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {language === 'bn' ? 'সরাসরি সেলস রিপ্রেজেন্টেটিভ এর সাথে সংযুক্ত হন' : 'Connect directly with ACI Motors Sales Team'}
                </p>
              </div>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                  {language === 'bn' ? 'পছন্দের বাইক মডেল:' : 'Preferred Bike Model:'}
                </label>
                <select
                  value={selectedBike}
                  onChange={(e) => setSelectedBike(e.target.value)}
                  className="w-full bg-[var(--bg-subcard)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[#004791]"
                >
                  {YAMAHA_BIKES.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name} — ৳{(b.offerPriceBDT || b.priceBDT).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    {language === 'bn' ? 'আপনার নাম:' : 'Your Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="e.g. Md. Tanvir Rahman"
                    className="w-full bg-[var(--bg-subcard)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#004791]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-main)] mb-1">
                    {language === 'bn' ? 'মোবাইল/যোগাযোগ নম্বর:' : 'Contact Phone Number:'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    placeholder="e.g. +8801700000000"
                    className="w-full bg-[var(--bg-subcard)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#004791]"
                  />
                </div>
              </div>

              <LocationPicker
                language={language}
                district={custDistrict}
                upazila={custUpazila}
                onChange={(d, u) => { setCustDistrict(d); setCustUpazila(u); }}
              />

              {/* Designated Salesman Info Box */}
              <div className="bg-[var(--bg-subcard)]/90 border border-blue-500/30 rounded-xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-blue-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Assigned Senior Sales Representative:
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">ACI MOTORS BD</span>
                </div>
                <div className="text-[var(--text-main)] text-xs">
                  <strong>Name:</strong> Md. Mahadi Hassan | <strong>Location:</strong> Dhaka
                </div>
                <div className="text-[var(--text-muted)] text-[11px] flex items-center gap-1">
                  <Mail className="w-3 h-3 text-amber-400" />
                  <span>Notification Email: <strong className="text-amber-300">Mahadi.Nayem@aci-bd.com</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-[var(--bg-subcard)] hover:bg-[var(--border-color)] text-[var(--text-main)] font-medium text-xs rounded-xl transition"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingLead || !custName || !custPhone}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[var(--bg-subcard)] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition"
                >
                  {isSubmittingLead ? (
                    <span>Sending Lead...</span>
                  ) : (
                    <>
                      <span>{language === 'bn' ? 'অনুরোধ পাঠান' : 'Submit Purchase Request'}</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

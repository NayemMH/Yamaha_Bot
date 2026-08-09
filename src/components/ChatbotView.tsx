import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Volume2, VolumeX, RotateCcw, CheckCircle2, ChevronRight, ShoppingCart, Mail, UserCheck, X, MessageCircle, Mic } from 'lucide-react';
import { ChatMessage, Language, BikeModel, PurchaseLead, ProductCard } from '../types';
import { YAMAHA_BIKES } from '../data/yamahaData';
import { autoCorrectLocation, CorrectedLocation } from '../data/locationData';

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
        ? 'স্বাগতম! আমি "YamBot" - ইয়ামাহা বাংলাদেশ (এসিআই মটরস) এর অফিসিয়াল এআই স্মার্ট অ্যাসিস্ট্যান্ট।\n\nআমি আপনাকে ইয়ামাহা বাইকের বর্তমান অফিসিয়াল প্রাইস, স্পেসিফিকেশন, ক্যাশব্যাক অফার, শোরুম ও ইনভেন্টরি চেক এবং সার্ভিস বুকিংয়ে সাহায্য করতে পারি। আপনি কীভাবে সাহায্য চান?'
        : 'Welcome to Yamaha Motorbike Bangladesh! I am "YamBot", your official AI Customer Specialist.\n\nI can assist you with official BDT price lists, current cashback offers, bike comparisons, showroom stock checks, and maintenance appointment bookings. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedQuickReplies: language === 'bn' ? [
        '🛒 R15 V4 বাইকটি ক্রয় করতে চাই',
        '🏍️ R15 V4 এবং MT-15 এর বর্তমান দাম কত?',
        '🔥 নতুন ক্যাশব্যাক অফারগুলো দেখান',
        '📍 ঢাকায় কাছে সার্ভিস সেন্টার ও শোরুম',
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

  const [expandedLeadIds, setExpandedLeadIds] = useState<Set<string>>(new Set());

  const toggleLeadExpanded = (id: string) => {
    setExpandedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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

  const submitLead = async (flow: LeadFlowState) => {
    if (!flow.correctedLocation || !flow.name || !flow.phone) return;
    if (isSubmittingLead) return;
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

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

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
      transcriptRef.current = transcript;
      setInputPrompt(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalText = transcriptRef.current.trim();
      transcriptRef.current = '';
      if (finalText) {
        setInputPrompt('');
        handleSendMessage(finalText);
      }
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

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
        productCard: data.productCard || undefined,
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
          ? 'দুঃখিত, সংযোগে সমস্যা হয়েছে। আপনি অনুগ্রহ করে ইয়ামাহা এসিআই মটরস হটলাইন ১৬৫০৮ নম্বরে ফোন করুন অথবা নিচে থেকে বিকল্প অপশন বেছে নিন।'
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
          ? 'চ্যাট হিস্ট্রি রিসেট হয়েছে! ইয়ামাহা বাইক সম্পর্কে অন্য কিছু জানার থাকলে লিখুন।'
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
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-3 sm:p-4 mb-4 flex items-center justify-between shadow-xl gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full bg-[#004791]/20 border border-[#004791]/40 flex items-center justify-center text-blue-400 transition ${isLoading ? 'animate-pulse' : ''}`}>
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--bg-card)]"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[var(--text-main)] text-sm sm:text-base">YamBot - Yamaha AI Support</h2>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-medium px-2 py-0.5 rounded-full border border-emerald-500/30">
                Online
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {language === 'bn' ? 'এসিআই মটরস অফিসিয়াল নলেজবেস যুক্ত' : 'Powered by Gemini AI & ACI Motors Knowledge'}
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
      <div className="flex-1 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 overflow-y-auto space-y-4 shadow-inner scrollbar-thin">
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
                    : 'bg-[var(--bg-subcard)] border border-[var(--border-color)] text-[var(--text-main)] rounded-tl-none shadow-md'
                }`}
              >
                {msg.text}

                {/* Bike Card embedded if matched */}
                {msg.bikeCard && (
                  <div className="mt-3 bg-[var(--bg-main)] border border-[#004791]/40 rounded-xl p-2.5 flex items-center gap-2.5">
                    <img
                      src={msg.bikeCard.image}
                      alt={msg.bikeCard.name}
                      className="w-14 h-14 object-cover rounded-lg border border-[var(--border-color)] shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-bold text-[var(--text-main)] text-xs block truncate">{msg.bikeCard.name}</span>
                      <span className="font-extrabold text-emerald-400 text-xs">৳{(msg.bikeCard.offerPriceBDT || msg.bikeCard.priceBDT).toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => msg.bikeCard && handleStartBikeLead(msg.bikeCard.name)}
                      disabled={!!leadFlow}
                      className="shrink-0 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-md"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'আগ্রহী' : "I'm Interested"}</span>
                    </button>
                  </div>
                )}

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

                {/* Purchase Lead Confirmation Slip */}
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
                        aria-label={expandedLeadIds.has(msg.id) ? 'Hide details' : 'Show details'}
                        aria-expanded={expandedLeadIds.has(msg.id)}
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
            <div className="flex items-center gap-1.5 bg-[var(--bg-subcard)] border border-[var(--border-color)] px-4 py-3.5 rounded-2xl rounded-tl-none w-fit">
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
          className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-color)] focus-within:border-[#004791] p-2 rounded-2xl shadow-xl transition"
        >
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
              aria-label="Voice Input"
              aria-pressed={isListening}
              className={`p-2.5 rounded-xl transition ${
                isListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                  : 'bg-[#004791]/10 text-blue-400 border border-[#004791]/30 hover:text-blue-300 hover:bg-[#004791]/20'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

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
    </div>
  );
};

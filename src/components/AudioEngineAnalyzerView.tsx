import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, Square, Activity, CheckCircle2, Send, Wrench, Sparkles, Volume2, RotateCcw, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { ACIProduct } from '../data/aciProductsData';
import { YAMAHA_BIKES } from '../data/yamahaData';
import { LocationPicker } from './LocationPicker';

interface AudioEngineAnalyzerViewProps {
  language: Language;
  onNavigateTab: (tab: any) => void;
}

interface MatchedIssue {
  issue: {
    titleEn: string; titleBn: string; urgency: string;
    actionEn: string; actionBn: string; problemKey: string; requiresTechnician: boolean;
  };
  products: ACIProduct[];
}

interface AnalysisResult {
  analysis: {
    soundObservations: string;
    healthScore: number;
    verdict: string;
    additionalAdvice: string;
    fallback?: boolean;
  };
  matchedIssues: MatchedIssue[];
}

const urgencyColor = (u: string) => {
  switch (u) {
    case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
};

export const AudioEngineAnalyzerView: React.FC<AudioEngineAnalyzerViewProps> = ({ language }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [extraNotes, setExtraNotes] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Dispatch modal
  const [showTechModal, setShowTechModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('Tejgaon / Central');
  const [consentedIds, setConsentedIds] = useState<Set<string>>(new Set());
  const [isSubmittingDispatch, setIsSubmittingDispatch] = useState(false);
  const [dispatchResultMsg, setDispatchResultMsg] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated frequency-bar visualizer (decorative; reacts to recording/analyzing state)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    let step = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 24;
      const width = canvas.width / bars;
      for (let i = 0; i < bars; i++) {
        const base = 30 + ((i * 37) % 55);
        const dynamicVal = isRecording || isAnalyzing
          ? Math.min(100, Math.max(10, base + Math.sin(step * 0.25 + i) * 40))
          : base * 0.4;
        const h = (dynamicVal / 100) * canvas.height;
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#004791');
        grad.addColorStop(0.5, '#38bdf8');
        grad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = grad;
        ctx.fillRect(i * width + 2, canvas.height - h, width - 4, h);
      }
      step += 1;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, [isRecording, isAnalyzing]);

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleStartRecord = async () => {
    setMicError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 9) { stopRecording(); return 10; }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      setMicError(language === 'bn'
        ? 'মাইক্রোফোন অ্যাক্সেস পাওয়া যায়নি। ব্রাউজারে মাইক পারমিশন দিন অথবা অডিও ফাইল আপলোড করুন।'
        : 'Microphone access denied. Allow mic permission in your browser, or upload an audio file instead.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const runAnalysis = async () => {
    if (!audioBlob || isAnalyzing) return;
    setIsAnalyzing(true);
    setResult(null);
    try {
      const audioBase64 = await blobToBase64(audioBlob);
      const response = await fetch('/api/analyze-engine-sound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64, mimeType: audioBlob.type || 'audio/webm', bikeModel, extraNotes, language })
      });
      const data = await response.json();
      if (data.success) {
        setResult(data);
        const preChecked = new Set<string>();
        (data.matchedIssues as MatchedIssue[]).forEach(mi => mi.products.forEach(p => preChecked.add(p.id)));
        setConsentedIds(preChecked);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleConsent = (id: string) => {
    setConsentedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || isSubmittingDispatch) return;
    setIsSubmittingDispatch(true);
    try {
      const topIssue = result?.matchedIssues[0];
      const response = await fetch('/api/service-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName,
          customerPhone: custPhone,
          district,
          upazila,
          bikeModel,
          problemKey: topIssue?.issue.problemKey,
          problemText: result?.analysis.soundObservations || extraNotes,
          consentedProductIds: [...consentedIds],
          language
        })
      });
      const data = await response.json();
      if (data.success) {
        setDispatchResultMsg(
          (language === 'bn'
            ? `কনসালটেশন ${data.refCode} সফলভাবে পাঠানো হয়েছে!\nটেকনিশিয়ান: ${data.technician.name} (${data.technician.serviceCenterName})\nইমেইল: ${data.technician.email}`
            : `Consultation ${data.refCode} dispatched successfully!\nTechnician: ${data.technician.name} (${data.technician.serviceCenterName})\nEmail: ${data.technician.email}`) +
          (data.dispatches?.productOrders?.length > 0
            ? `\n${language === 'bn' ? 'প্রোডাক্ট অর্ডার:' : 'Product orders:'} ${data.dispatches.productOrders.map((o: any) => o.orderRef).join(', ')}`
            : '')
        );
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsSubmittingDispatch(false);
    }
  };

  const allSuggestedProducts: ACIProduct[] = [];
  result?.matchedIssues.forEach(mi => mi.products.forEach(p => {
    if (!allSuggestedProducts.find(x => x.id === p.id)) allSuggestedProducts.push(p);
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold mb-3">
          <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>{language === 'bn' ? 'রিয়েল এআই ইঞ্জিন সাউন্ড ডায়াগনস্টিক' : 'Real AI Engine Sound Diagnostic Studio'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {language === 'bn' ? 'ইঞ্জিনের শব্দ রেকর্ড করুন — এআই সমস্যা ধরবে' : 'Record Your Engine — AI Finds The Problem'}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {language === 'bn'
            ? 'বাইকের ইঞ্জিন চালু রেখে ৫-১০ সেকেন্ড রেকর্ড করুন বা অডিও আপলোড করুন। জেমিনি এআই শব্দ বিশ্লেষণ করে ডায়াগনসিস, প্রোডাক্ট সাজেশন ও নিকটস্থ টেকনিশিয়ান ডিসপ্যাচ করবে।'
            : 'Keep the engine running and record 5-10 seconds (or upload audio). Gemini AI analyzes the acoustics, maps them to our diagnostics knowledge base, and dispatches the nearest technician.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: capture */}
        <div className="lg:col-span-6 bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'লাইভ অডিও ক্যাপচার' : 'Live Audio Capture'}</span>
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 font-mono px-2 py-0.5 rounded border border-blue-500/30">GEMINI AUDIO AI</span>
          </div>

          <div className="bg-[#050505] border border-gray-800 rounded-xl p-4 mb-5 relative overflow-hidden">
            <canvas ref={canvasRef} width={400} height={120} className="w-full h-28 object-contain" />
            {isRecording && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 text-red-400 font-bold text-sm">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                <span>{language === 'bn' ? 'রেকর্ড হচ্ছে' : 'Recording'}... ({recordingSeconds}/10s)</span>
              </div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-blue-400 text-xs font-bold gap-2">
                <Sparkles className="w-6 h-6 animate-spin text-amber-400" />
                <span>{language === 'bn' ? 'এআই অ্যাকুস্টিক বিশ্লেষণ চলছে...' : 'AI acoustic analysis in progress...'}</span>
              </div>
            )}
          </div>

          {micError && (
            <div className="mb-4 flex items-start gap-2 text-[11px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{micError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            {!isRecording ? (
              <button onClick={handleStartRecord} disabled={isAnalyzing}
                className="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-[#004791] hover:bg-blue-700 text-white shadow-lg shadow-[#004791]/30 transition">
                <Mic className="w-4 h-4" />
                <span>{language === 'bn' ? 'রেকর্ড শুরু করুন' : 'Start Recording'}</span>
              </button>
            ) : (
              <button onClick={stopRecording}
                className="py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-red-600 text-white animate-pulse transition">
                <Square className="w-4 h-4" />
                <span>{language === 'bn' ? 'রেকর্ড বন্ধ করুন' : 'Stop Recording'}</span>
              </button>
            )}
            <label className="py-3 px-4 bg-[#141414] hover:bg-[#222222] text-gray-200 border border-gray-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'অডিও আপলোড' : 'Upload Audio'}</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {audioUrl && (
            <div className="mb-4 bg-[#111111] border border-gray-800 rounded-xl p-3 space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{language === 'bn' ? 'রেকর্ড করা অডিও' : 'Captured Audio'}</span>
              <audio controls src={audioUrl} className="w-full h-9" />
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">{language === 'bn' ? 'বাইকের মডেল (ঐচ্ছিক)' : 'Bike Model (optional)'}</label>
              <select value={bikeModel} onChange={e => setBikeModel(e.target.value)}
                className="w-full bg-slate-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                <option value="">{language === 'bn' ? '-- মডেল বাছাই করুন --' : '-- Select model --'}</option>
                {YAMAHA_BIKES.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">{language === 'bn' ? 'সমস্যার বর্ণনা (ঐচ্ছিক)' : 'Describe the symptom (optional)'}</label>
              <input type="text" value={extraNotes} onChange={e => setExtraNotes(e.target.value)}
                placeholder={language === 'bn' ? 'যেমন: বেশি RPM এ খটখট শব্দ হয়' : 'e.g. rattling sound above 6000 RPM'}
                className="w-full bg-slate-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
            </div>
            <button onClick={runAnalysis} disabled={!audioBlob || isAnalyzing}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition ${
                audioBlob && !isAnalyzing
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-xl shadow-amber-900/40'
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}>
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? (language === 'bn' ? 'বিশ্লেষণ চলছে...' : 'Analyzing...') : (language === 'bn' ? 'এআই ডায়াগনসিস চালান' : 'Run AI Diagnosis')}</span>
            </button>
          </div>
        </div>

        {/* Right: results */}
        <div className="lg:col-span-6 bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'bn' ? 'এআই ডায়াগনসিস রিপোর্ট' : 'AI Diagnosis Report'}</span>
            </span>
            {result && (
              <span className={`text-[10px] px-2 py-0.5 rounded border font-extrabold ${
                result.analysis.healthScore >= 75 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : result.analysis.healthScore >= 50 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                {language === 'bn' ? 'হেলথ স্কোর' : 'Health'}: {result.analysis.healthScore}/100
              </span>
            )}
          </div>

          {!result && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 text-sm gap-3 py-12">
              <Wrench className="w-10 h-10 text-gray-700" />
              <p>{language === 'bn' ? 'রেকর্ড বা আপলোড করে "এআই ডায়াগনসিস চালান" চাপুন — রিপোর্ট এখানে আসবে।' : 'Record or upload engine audio, then press "Run AI Diagnosis" — your report will appear here.'}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 flex-1">
              <div className="bg-[#111111] border border-gray-800 rounded-xl p-4">
                <h3 className="font-extrabold text-base text-white mb-1.5">{result.analysis.verdict}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{result.analysis.soundObservations}</p>
                {result.analysis.additionalAdvice && (
                  <p className="text-[11px] text-blue-300 mt-2">{result.analysis.additionalAdvice}</p>
                )}
              </div>

              {result.matchedIssues.map((mi, idx) => (
                <div key={idx} className="bg-[#111111] border border-gray-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-white">{language === 'bn' ? mi.issue.titleBn : mi.issue.titleEn}</h4>
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-semibold shrink-0 ${urgencyColor(mi.issue.urgency)}`}>{mi.issue.urgency}</span>
                  </div>
                  <p className="text-xs text-gray-400">{language === 'bn' ? mi.issue.actionBn : mi.issue.actionEn}</p>
                  <div className="space-y-2 pt-1">
                    {mi.products.map(p => (
                      <div key={p.id} className="bg-[#050505] border border-gray-800 p-2.5 rounded-lg flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">{p.brand}</span>
                          <div className="font-bold text-white text-xs mt-0.5 truncate">{p.name}</div>
                        </div>
                        <span className="font-black text-emerald-400 text-xs shrink-0">৳{p.priceBDT.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={() => { setShowTechModal(true); setDispatchResultMsg(''); }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40 transition">
                <Wrench className="w-4 h-4" />
                <span>{language === 'bn' ? 'নিকটস্থ টেকনিশিয়ান ডিসপ্যাচ + প্রোডাক্ট অর্ডার' : 'Dispatch Nearest Technician + Order Products'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Dispatch modal */}
      {showTechModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f172a] border border-blue-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowTechModal(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition">✕</button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{language === 'bn' ? 'টেকনিশিয়ান কনসালটেশন ও প্রোডাক্ট অর্ডার' : 'Technician Consultation & Product Order'}</h3>
                <p className="text-xs text-gray-400">{language === 'bn' ? 'জেলা-উপজেলা অনুযায়ী নিকটস্থ টেকনিশিয়ান ম্যাচ হবে' : 'Nearest technician is matched by your District & Upazila'}</p>
              </div>
            </div>

            {dispatchResultMsg ? (
              <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl text-emerald-200 text-xs leading-relaxed whitespace-pre-line space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{language === 'bn' ? 'সফলভাবে পাঠানো হয়েছে' : 'Dispatched Successfully'}</span>
                </div>
                <div>{dispatchResultMsg}</div>
                <button onClick={() => setShowTechModal(false)}
                  className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition">Close</button>
              </div>
            ) : (
              <form onSubmit={handleDispatchSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">{language === 'bn' ? 'আপনার নাম' : 'Your Full Name'}</label>
                    <input type="text" required value={custName} onChange={e => setCustName(e.target.value)}
                      placeholder="e.g. Sajjad Ahmed"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#004791]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">{language === 'bn' ? 'ফোন নম্বর' : 'Contact Phone'}</label>
                    <input type="tel" required value={custPhone} onChange={e => setCustPhone(e.target.value)}
                      placeholder="+8801XXXXXXXXX"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#004791]" />
                  </div>
                </div>

                <LocationPicker language={language} district={district} upazila={upazila}
                  onChange={(d, u) => { setDistrict(d); setUpazila(u); }} />

                {allSuggestedProducts.length > 0 && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                      <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'bn' ? 'কোন প্রোডাক্টগুলো কিনতে চান? (প্রতিনিধি যোগাযোগ করবেন)' : 'Which products do you want to buy? (rep will contact you)'}</span>
                    </label>
                    {allSuggestedProducts.map(p => (
                      <label key={p.id} className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 cursor-pointer hover:border-emerald-500/50 transition">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input type="checkbox" checked={consentedIds.has(p.id)} onChange={() => toggleConsent(p.id)}
                            className="accent-emerald-500 w-4 h-4 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">{p.brand}</span>
                            <div className="text-xs text-white font-semibold truncate">{p.name}</div>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-400 shrink-0">৳{p.priceBDT.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="bg-slate-900/90 border border-blue-500/30 rounded-xl p-3 text-xs space-y-1">
                  <div className="text-blue-400 font-bold">Default Service Representative (ACI Motors BD):</div>
                  <div className="text-gray-300">Name: <strong>Md. Mahadi Hassan</strong></div>
                  <div className="text-amber-300 font-mono text-[11px]">Email: Mahadi.Nayem@aci-bd.com</div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowTechModal(false)}
                    className="px-4 py-2 bg-slate-800 text-gray-300 text-xs font-medium rounded-xl transition">Cancel</button>
                  <button type="submit" disabled={isSubmittingDispatch || !custName || !custPhone}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition disabled:opacity-50">
                    {isSubmittingDispatch
                      ? <span>{language === 'bn' ? 'পাঠানো হচ্ছে...' : 'Dispatching...'}</span>
                      : <><span>{language === 'bn' ? 'কনসালটেশন পাঠান' : 'Submit Consultation'}</span><Send className="w-3.5 h-3.5" /></>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

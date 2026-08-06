import React, { useMemo, useState } from 'react';
import { Wrench, Search, Send, CheckCircle2, ShoppingBag, Stethoscope, AlertTriangle, Sun, Volume2 } from 'lucide-react';
import { Language } from '../types';
import {
  SERVICE_DIAGNOSTICS_KB,
  matchDiagnostics,
  getProductsByIds,
  DiagnosticIssue
} from '../data/aciProductsData';
import { YAMAHA_BIKES } from '../data/yamahaData';
import { LocationPicker } from './LocationPicker';

interface ServiceAssistantViewProps {
  language: Language;
  onNavigateTab: (tab: any) => void;
}

const urgencyColor = (u: string) => {
  switch (u) {
    case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  }
};

export const ServiceAssistantView: React.FC<ServiceAssistantViewProps> = ({ language, onNavigateTab }) => {
  const [selectedIssue, setSelectedIssue] = useState<DiagnosticIssue | null>(null);
  const [freeText, setFreeText] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [consentedIds, setConsentedIds] = useState<Set<string>>(new Set());

  // contact + dispatch
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [district, setDistrict] = useState('Dhaka');
  const [upazila, setUpazila] = useState('Tejgaon / Central');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [resultDetail, setResultDetail] = useState<any>(null);

  const freeTextMatches = useMemo(
    () => (freeText.trim().length >= 4 ? matchDiagnostics(freeText, 3) : []),
    [freeText]
  );

  const activeIssue = selectedIssue || freeTextMatches[0] || null;
  const recommendedProducts = activeIssue ? getProductsByIds(activeIssue.recommendedProducts) : [];

  const pickIssue = (issue: DiagnosticIssue) => {
    setSelectedIssue(issue);
    setConsentedIds(new Set(issue.recommendedProducts));
    setResultMsg('');
  };

  const toggleConsent = (id: string) => {
    setConsentedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/service-consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: custName,
          customerPhone: custPhone,
          district,
          upazila,
          bikeModel,
          problemKey: activeIssue?.problemKey,
          problemText: freeText,
          consentedProductIds: [...consentedIds],
          language
        })
      });
      const data = await response.json();
      if (data.success) {
        setResultDetail(data);
        setResultMsg(data.message);
      }
    } catch (err) {
      console.error('Consultation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isRural = activeIssue?.problemKey === 'rural_power';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-semibold mb-3">
          <Stethoscope className="w-4 h-4 animate-pulse" />
          <span>{language === 'bn' ? 'এআই সার্ভিস অ্যাসিস্ট্যান্ট ও প্রোডাক্ট কেয়ার' : 'AI Service Assistant & Product Care'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {language === 'bn' ? 'বাইকের সমস্যা বলুন — সমাধান, প্রোডাক্ট ও টেকনিশিয়ান পান' : 'Describe Your Bike Problem — Get Solution, Products & Technician'}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {language === 'bn'
            ? `${SERVICE_DIAGNOSTICS_KB.length}+ সমস্যার নলেজ বেস থেকে তাৎক্ষণিক ডায়াগনসিস। সম্মতি দিলে নিকটস্থ টেকনিশিয়ান ও প্রোডাক্ট প্রতিনিধির কাছে স্বয়ংক্রিয় ইমেইল যাবে।`
            : `Instant diagnosis from our ${SERVICE_DIAGNOSTICS_KB.length}-problem knowledge base. On your consent, automated emails go to the nearest technician and product representatives.`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: problem picker */}
        <div className="lg:col-span-5 bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>{language === 'bn' ? 'সমস্যা বাছাই করুন' : 'Pick Your Problem'}</span>
            </span>
            <button onClick={() => onNavigateTab('audio-analyzer')}
              className="flex items-center gap-1 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition">
              <Volume2 className="w-3 h-3" />
              <span>{language === 'bn' ? 'সাউন্ড দিয়ে ডায়াগনসিস?' : 'Diagnose by sound?'}</span>
            </button>
          </div>

          <input
            type="text"
            value={freeText}
            onChange={e => { setFreeText(e.target.value); setSelectedIssue(null); }}
            placeholder={language === 'bn' ? 'নিজের ভাষায় লিখুন: "মাইলেজ কম পাচ্ছি", "ব্রেকে শব্দ হয়"...' : 'Type freely: "getting low mileage", "brake squealing"...'}
            className="w-full bg-slate-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 mb-3"
          />
          {freeTextMatches.length > 0 && !selectedIssue && (
            <div className="mb-3 space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{language === 'bn' ? 'এআই ম্যাচ:' : 'AI matches:'}</span>
              {freeTextMatches.map(issue => (
                <button key={issue.id} onClick={() => pickIssue(issue)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-emerald-600/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-600/20 transition">
                  {language === 'bn' ? issue.titleBn : issue.titleEn}
                </button>
              ))}
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto pr-1 space-y-1.5">
            {SERVICE_DIAGNOSTICS_KB.map(issue => (
              <button
                key={issue.id}
                onClick={() => pickIssue(issue)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between gap-2 ${
                  activeIssue?.id === issue.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                    : 'bg-[#111111] border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <span className="font-semibold">{language === 'bn' ? issue.titleBn : issue.titleEn}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${urgencyColor(issue.urgency)}`}>{issue.urgency}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: diagnosis + dispatch */}
        <div className="lg:col-span-7 space-y-5">
          {!activeIssue && (
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-10 text-center text-gray-500 text-sm shadow-2xl">
              <Wrench className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              {language === 'bn' ? 'বাম দিক থেকে সমস্যা বাছাই করুন বা নিজের ভাষায় লিখুন।' : 'Pick a problem from the left, or describe it in your own words.'}
            </div>
          )}

          {activeIssue && (
            <>
              {/* Diagnosis card */}
              <div className={`bg-[#0a0a0a] border rounded-2xl p-5 shadow-2xl ${isRural ? 'border-amber-500/40' : 'border-gray-800'}`}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                    {isRural ? <Sun className="w-5 h-5 text-amber-400" /> : <Stethoscope className="w-5 h-5 text-emerald-400" />}
                    <span>{language === 'bn' ? activeIssue.titleBn : activeIssue.titleEn}</span>
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-extrabold shrink-0 ${urgencyColor(activeIssue.urgency)}`}>{activeIssue.urgency}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#111111] border border-gray-800 rounded-xl p-3">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">{language === 'bn' ? 'সম্ভাব্য কারণ' : 'Likely Root Cause'}</span>
                    <p className="text-gray-300 leading-relaxed">{activeIssue.rootCause}</p>
                  </div>
                  <div className="bg-[#111111] border border-gray-800 rounded-xl p-3">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-1">{language === 'bn' ? 'করণীয় সমাধান' : 'Recommended Action'}</span>
                    <p className="text-gray-300 leading-relaxed">{language === 'bn' ? activeIssue.recommendedActionBn : activeIssue.recommendedActionEn}</p>
                  </div>
                </div>
                {activeIssue.requiresTechnician && (
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{language === 'bn' ? 'এই সমস্যার জন্য টেকনিশিয়ান পরিদর্শন প্রয়োজন — নিচের ফর্ম দিয়ে নিকটস্থ টেকনিশিয়ান ডাকুন।' : 'This issue needs a technician inspection — use the form below to dispatch the nearest one.'}</span>
                  </div>
                )}
              </div>

              {/* Product cross-sell with consent */}
              {recommendedProducts.length > 0 && (
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5 shadow-2xl">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                      {language === 'bn' ? 'প্রস্তাবিত ACI প্রোডাক্ট — কিনতে টিক দিন' : 'Recommended ACI Products — tick to purchase'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {recommendedProducts.map(p => (
                      <label key={p.id} className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition ${
                        consentedIds.has(p.id) ? 'bg-emerald-600/10 border-emerald-500/50' : 'bg-[#111111] border-gray-800 hover:border-gray-700'
                      }`}>
                        <input type="checkbox" checked={consentedIds.has(p.id)} onChange={() => toggleConsent(p.id)}
                          className="accent-emerald-500 w-4 h-4 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">{p.brand}</span>
                            <span className="text-xs font-black text-emerald-400">৳{p.priceBDT.toLocaleString()}</span>
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">{p.name}</div>
                          <div className="text-[10px] text-gray-400 line-clamp-2">{p.tagline}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2.5">
                    {language === 'bn'
                      ? 'টিক দেওয়া প্রতিটি প্রোডাক্টের ব্র্যান্ড প্রতিনিধির কাছে স্বয়ংক্রিয় ইমেইল যাবে — তারা আপনার নিকটস্থ লোকেশন থেকে ডেলিভারি/ইনস্টলেশনের জন্য যোগাযোগ করবেন।'
                      : 'Each ticked product triggers an automated email to that brand\'s representative — they will contact you for nearest-location delivery/installation.'}
                  </p>
                </div>
              )}

              {/* Contact + location + submit */}
              <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5 shadow-2xl">
                {resultMsg ? (
                  <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl text-emerald-200 text-xs leading-relaxed space-y-3">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{language === 'bn' ? 'কনসালটেশন পাঠানো হয়েছে!' : 'Consultation Dispatched!'}</span>
                    </div>
                    <div className="whitespace-pre-line">{resultMsg}</div>
                    {resultDetail?.technician && (
                      <div className="bg-slate-900/70 rounded-lg p-3 space-y-0.5">
                        <div><strong>{language === 'bn' ? 'টেকনিশিয়ান:' : 'Technician:'}</strong> {resultDetail.technician.name} — {resultDetail.technician.designation}</div>
                        <div><strong>{language === 'bn' ? 'সার্ভিস পয়েন্ট:' : 'Service point:'}</strong> {resultDetail.technician.serviceCenterName}</div>
                        {resultDetail.technician.serviceCenterAddress && (
                          <div className="text-gray-400">{resultDetail.technician.serviceCenterAddress} {resultDetail.technician.serviceCenterPhone ? `• ${resultDetail.technician.serviceCenterPhone}` : ''}</div>
                        )}
                        <div className="font-mono text-amber-300">{resultDetail.technician.email}</div>
                      </div>
                    )}
                    {resultDetail?.dispatches?.productOrders?.length > 0 && (
                      <div className="bg-slate-900/70 rounded-lg p-3">
                        <strong>{language === 'bn' ? 'প্রোডাক্ট অর্ডার রেফারেন্স:' : 'Product order refs:'}</strong>{' '}
                        {resultDetail.dispatches.productOrders.map((o: any) => o.orderRef).join(', ')}
                      </div>
                    )}
                    {resultDetail?.locationCorrection && (
                      <div className="text-amber-300">
                        {language === 'bn' ? 'লোকেশন স্বয়ংক্রিয় সংশোধিত:' : 'Location auto-corrected to:'} {resultDetail.locationCorrection.district}
                      </div>
                    )}
                    <button onClick={() => { setResultMsg(''); setResultDetail(null); }}
                      className="w-full mt-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition">
                      {language === 'bn' ? 'নতুন কনসালটেশন' : 'New Consultation'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-blue-400" />
                      <span>{language === 'bn' ? 'নিকটস্থ টেকনিশিয়ানের কাছে পাঠান' : 'Dispatch To Nearest Technician'}</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" required value={custName} onChange={e => setCustName(e.target.value)}
                        placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                        className="w-full bg-slate-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                      <input type="tel" required value={custPhone} onChange={e => setCustPhone(e.target.value)}
                        placeholder="+8801XXXXXXXXX"
                        className="w-full bg-slate-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                      <select value={bikeModel} onChange={e => setBikeModel(e.target.value)}
                        className="w-full bg-slate-800/80 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                        <option value="">{language === 'bn' ? 'বাইক মডেল (ঐচ্ছিক)' : 'Bike model (optional)'}</option>
                        {YAMAHA_BIKES.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                      </select>
                    </div>
                    <LocationPicker language={language} district={district} upazila={upazila}
                      onChange={(d, u) => { setDistrict(d); setUpazila(u); }} />
                    <button type="submit" disabled={isSubmitting || !custName || !custPhone}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-900/40 transition disabled:opacity-50">
                      <Send className="w-4 h-4" />
                      <span>{isSubmitting
                        ? (language === 'bn' ? 'ইমেইল ও WhatsApp পাঠানো হচ্ছে...' : 'Sending Email & WhatsApp...')
                        : (language === 'bn' ? `কনসালটেশন + ${consentedIds.size}টি প্রোডাক্ট অর্ডার পাঠান` : `Send Consultation + ${consentedIds.size} Product Order(s)`)}</span>
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Compass, Sparkles, Check, ChevronRight, RotateCcw, ShieldCheck, Fuel, Gauge, Zap, Calendar, MapPin, Award, CheckCircle2, TrendingUp, ArrowUpRight, Scale, ShoppingCart } from 'lucide-react';
import { Language, RecommendationQuizState, BikeModel } from '../types';
import { YAMAHA_BIKES } from '../data/yamahaData';

interface RecommenderViewProps {
  language: Language;
  onNavigateTab: (tab: 'chat' | 'recommend' | 'service-assistant' | 'audio-analyzer' | 'prices' | 'locator' | 'booking' | 'social') => void;
}

export const RecommenderView: React.FC<RecommenderViewProps> = ({ language, onNavigateTab }) => {
  const [step, setStep] = useState<number>(1);
  const [quizState, setQuizState] = useState<RecommendationQuizState>({
    budgetRangeBDT: [150000, 280000], // Default budget around 2.8 Lakh
    ridingPurpose: 'daily_commute',
    preferredCategory: 'all',
    mileagePriority: 'medium',
    absRequirement: 'must_have',
    passengerComfort: 'moderate',
    experienceLevel: 'intermediate'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [budgetBike, setBudgetBike] = useState<BikeModel>(YAMAHA_BIKES[3]); // FZ-S V4
  const [upsellBike, setUpsellBike] = useState<BikeModel>(YAMAHA_BIKES[5]); // FZ-X 150
  const [aiPitchText, setAiPitchText] = useState<string>('');

  const handleGenerateRecommendation = async () => {
    setIsLoading(true);

    const userBudget = quizState.budgetRangeBDT[1];

    // Find best bike within user budget (highest price <= userBudget)
    const affordableBikes = YAMAHA_BIKES.filter(b => (b.offerPriceBDT || b.priceBDT) <= userBudget)
      .sort((a, b) => (b.offerPriceBDT || b.priceBDT) - (a.offerPriceBDT || a.priceBDT));

    const matchedBudgetBike = affordableBikes[0] || YAMAHA_BIKES[6]; // Default Saluto if low budget

    // Find next bike upper the budget level (lowest price > userBudget or next tier)
    const higherTierBikes = YAMAHA_BIKES.filter(b => (b.offerPriceBDT || b.priceBDT) > userBudget)
      .sort((a, b) => (a.offerPriceBDT || a.priceBDT) - (b.offerPriceBDT || b.priceBDT));

    const matchedUpsellBike = higherTierBikes[0] || 
      YAMAHA_BIKES.find(b => b.id !== matchedBudgetBike.id && (b.offerPriceBDT || b.priceBDT) > (matchedBudgetBike.offerPriceBDT || matchedBudgetBike.priceBDT)) ||
      YAMAHA_BIKES[0];

    setBudgetBike(matchedBudgetBike);
    setUpsellBike(matchedUpsellBike);

    const priceDiff = (matchedUpsellBike.offerPriceBDT || matchedUpsellBike.priceBDT) - (matchedBudgetBike.offerPriceBDT || matchedBudgetBike.priceBDT);
    const emiDiff = Math.round(priceDiff / 36);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizState,
          language,
          budgetBikeName: matchedBudgetBike.name,
          upsellBikeName: matchedUpsellBike.name,
          priceDiffBDT: priceDiff
        })
      });
      const data = await res.json();
      setAiPitchText(data.recommendationText || '');
    } catch (err) {
      console.error('Recommendation pitch fetch error:', err);
    } finally {
      setIsLoading(false);
      setStep(5); // Show results
    }
  };

  const handleResetQuiz = () => {
    setStep(1);
  };

  const priceDiff = (upsellBike.offerPriceBDT || upsellBike.priceBDT) - (budgetBike.offerPriceBDT || budgetBike.priceBDT);
  const emiDiff = Math.round(Math.max(300, priceDiff / 36));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title & Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 bg-[#004791]/10 border border-[#004791]/30 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>{language === 'bn' ? 'স্মার্ট বাজেট ও আপসেল পারফরম্যান্স ম্যাচমেকার' : 'AI Dynamic Budget & Upsell Comparison Studio'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {language === 'bn' ? 'আপনার বাজেটের সেরা বাইক এবং নেক্সট লেভেল ড্রিম বাইক' : 'Find Best Budget Bike & Explore Next-Level Upgrade'}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {language === 'bn'
            ? 'আপনার বাজেটে সেরা বাইকটি দেখুন এবং মাত্র সামান্য অতিরিক্ত ইনভেস্টে উন্নত টেকনোলজির আপসেল বাইকের ফিচার তুলনা করুন।'
            : 'Enter your budget to get the best bike within your preference, along with a side-by-side feature comparison of the next upper-tier model.'}
        </p>
      </div>

      {/* Quiz Progress Indicator */}
      {step <= 4 && (
        <div className="max-w-xl mx-auto mb-8 bg-[#0a0a0a] border border-gray-800 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
            <span>Step {step} of 4</span>
            <span className="text-blue-400 font-bold">{step * 25}% Completed</span>
          </div>
          <div className="w-full h-2 bg-[#181818] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#004791] transition-all duration-500"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Budget Selection */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">
            1. {language === 'bn' ? 'আপনার সর্বোচ্চ বাজেট নির্ধারণ করুন (BDT ৳):' : 'Set your maximum planned budget (BDT ৳):'}
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            {language === 'bn' ? 'আপনার বাজেট স্লাইডার পরিবর্তন করুন' : 'Slide to select your bike buying budget'}
          </p>

          <div className="bg-[#111111] p-6 rounded-xl border border-gray-800 text-center mb-8">
            <span className="text-xs text-gray-400 uppercase tracking-wider block mb-1">Planned Budget Preference</span>
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
              ৳{quizState.budgetRangeBDT[1].toLocaleString()} <span className="text-sm font-normal text-gray-400">BDT</span>
            </span>

            <input
              type="range"
              min="150000"
              max="950000"
              step="10000"
              value={quizState.budgetRangeBDT[1]}
              onChange={(e) =>
                setQuizState({
                  ...quizState,
                  budgetRangeBDT: [150000, Number(e.target.value)]
                })
              }
              className="w-full mt-6 accent-[#004791] cursor-pointer"
            />

            <div className="flex justify-between text-xs text-gray-500 mt-2 font-mono">
              <span>৳1,50,000 (Saluto 125)</span>
              <span>৳2,80,000 (FZ-S V4)</span>
              <span>৳5,20,000 (MT-15)</span>
              <span>৳9,50,000 (R3)</span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-[#004791] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition shadow-lg shadow-[#004791]/30"
            >
              <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Purpose */}
      {step === 2 && (
        <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">
            2. {language === 'bn' ? 'বাইক ব্যবহারের প্রধান উদ্দেশ্য কোনটি?' : 'What is your primary riding purpose?'}
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            {language === 'bn' ? 'আপনার প্রতিদিনের রাইডিং স্টাইল সিলেক্ট করুন' : 'Select how you will mostly ride your motorcycle'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {[
              { id: 'daily_commute', labelEn: 'Daily City Commute', labelBn: 'দৈনন্দিন সিটি যাতায়াত ও অফিস', desc: 'High mileage, easy handling in Dhaka/Ctg traffic' },
              { id: 'racing_track', labelEn: 'Sports & Speed Enthusiast', labelBn: 'স্পোর্টস লুক, গতি ও স্টাইল', desc: 'High RPM power, aero fairing, track control' },
              { id: 'long_touring', labelEn: 'Highway & Long Touring', labelBn: 'হাইওয়ে ট্যুরিং ও লং রাইড', desc: 'Relaxed posture, stability, scrambler style' },
              { id: 'family_comfort', labelEn: 'Family & Pillion Comfort', labelBn: 'পরিবার ও পেছনে বসার আরাম', desc: 'Wide double seat, smooth suspension' }
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => setQuizState({ ...quizState, ridingPurpose: opt.id as any })}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                  quizState.ridingPurpose === opt.id
                    ? 'bg-[#004791]/20 border-[#004791] text-white shadow-md'
                    : 'bg-[#111111] border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  quizState.ridingPurpose === opt.id ? 'border-blue-400 bg-[#004791] text-white' : 'border-gray-600'
                }`}>
                  {quizState.ridingPurpose === opt.id && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <div className="font-bold text-xs sm:text-sm">
                    {language === 'bn' ? opt.labelBn : opt.labelEn}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 text-xs text-gray-400 hover:text-white transition"
            >
              {language === 'bn' ? 'পেছনে যান' : 'Back'}
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-[#004791] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition shadow-lg shadow-[#004791]/30"
            >
              <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Style & Mileage */}
      {step === 3 && (
        <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">
            3. {language === 'bn' ? 'বাইকের ধরণ এবং মাইলেজ পছন্দ:' : 'Preferred Style & Mileage Priority'}
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            {language === 'bn' ? 'আপনার পছন্দের সেগমেন্ট সিলেক্ট করুন' : 'Choose your preferred motorcycle segment'}
          </p>

          <div className="space-y-6 mb-8">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Category Preference:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'all', label: 'Any Category' },
                  { id: 'Sports', label: 'Sports Fairing (R15)' },
                  { id: 'Street', label: 'Street Naked (MT-15 / FZ)' },
                  { id: 'Scrambler', label: 'Neo-Retro (FZ-X)' },
                  { id: 'Commuter', label: '125cc Commuter' },
                  { id: 'Scooter', label: 'RayZR Scooter' }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setQuizState({ ...quizState, preferredCategory: c.id as any })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition text-center ${
                      quizState.preferredCategory === c.id
                        ? 'bg-[#004791] text-white border-blue-400'
                        : 'bg-[#111111] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">Mileage vs Performance Preference:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'high', label: 'High Mileage (55-70 km/l)' },
                  { id: 'medium', label: 'Balanced (42-50 km/l)' },
                  { id: 'performance_first', label: 'Performance First (18.4 PS)' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setQuizState({ ...quizState, mileagePriority: m.id as any })}
                    className={`p-3 rounded-xl border text-xs font-medium transition text-center ${
                      quizState.mileagePriority === m.id
                        ? 'bg-[#004791] text-white border-blue-400'
                        : 'bg-[#111111] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 text-xs text-gray-400 hover:text-white transition"
            >
              {language === 'bn' ? 'পেছনে যান' : 'Back'}
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-[#004791] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition shadow-lg shadow-[#004791]/30"
            >
              <span>{language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Safety & Generation */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-1">
            4. {language === 'bn' ? 'এবিএস ব্রেকিং এবং সেফটি সিকিউরিটি:' : 'Safety & ABS Requirement'}
          </h2>
          <p className="text-xs text-gray-400 mb-6">
            {language === 'bn' ? 'এআই আপসেল ম্যাচমেকার তৈরি প্রস্তুত' : 'Final step to generate dynamic budget & upper-tier bike comparison'}
          </p>

          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQuizState({ ...quizState, absRequirement: 'must_have' })}
                className={`p-4 rounded-xl border text-xs font-semibold text-left transition ${
                  quizState.absRequirement === 'must_have'
                    ? 'bg-[#004791]/20 border-[#004791] text-white'
                    : 'bg-[#111111] border-gray-800 text-gray-400'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-1" />
                <div>Dual / Single ABS Safety</div>
                <div className="text-[10px] text-gray-500 font-normal">Maximum safety on wet BD pitch</div>
              </button>

              <button
                onClick={() => setQuizState({ ...quizState, absRequirement: 'optional' })}
                className={`p-4 rounded-xl border text-xs font-semibold text-left transition ${
                  quizState.absRequirement === 'optional'
                    ? 'bg-[#004791]/20 border-[#004791] text-white'
                    : 'bg-[#111111] border-gray-800 text-gray-400'
                }`}
              >
                <Gauge className="w-5 h-5 text-amber-400 mb-1" />
                <div>UBS / Disc Brakes Okay</div>
                <div className="text-[10px] text-gray-500 font-normal">Standard braking system</div>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 text-xs text-gray-400 hover:text-white transition"
            >
              {language === 'bn' ? 'পেছনে যান' : 'Back'}
            </button>
            <button
              onClick={handleGenerateRecommendation}
              disabled={isLoading}
              className="px-8 py-3.5 bg-[#004791] hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition shadow-xl shadow-[#004791]/40"
            >
              {isLoading ? (
                <span>Matching Budget & Upsell Comparison...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>{language === 'bn' ? 'বাজেট ও আপসেল বাইক তুলনা দেখুন' : 'Get Dynamic Budget & Upsell Pitch'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Results Screen with Dynamic Upsell Pitch & Comparison Table */}
      {step === 5 && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Banner: Upsell Conversion Hook */}
          <div className="bg-gradient-to-r from-[#004791]/30 via-purple-900/30 to-slate-900 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Smart Upsell Recommendation</span>
              </span>

              <button
                onClick={handleResetQuiz}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'বাজেট পরিবর্তন করুন' : 'Adjust Budget'}</span>
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
              {language === 'bn'
                ? `মাত্র ৳${priceDiff.toLocaleString()} টাকা (প্রতি মাসে আনুমানিক ৳${emiDiff}/- কিস্তি) বৃদ্ধি করলেই পাচ্ছেন সুপার ট্র্যাকশন ও পাওয়ার রাইড!`
                : `Why settle? Upgrade to ${upsellBike.name} for just ৳${priceDiff.toLocaleString()} extra (~৳${emiDiff}/month EMI difference)!`}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed">
              {language === 'bn'
                ? `আপনার দেওয়া বাজেট ৳${quizState.budgetRangeBDT[1].toLocaleString()} এর মধ্যে সেরা পছন্দ **${budgetBike.name}**। তবে, সামান্য বেশি ইনভেস্টে **${upsellBike.name}** আপনাকে দিচ্ছে উচ্চতর বিএস৬ পাওয়ার, ট্র্যাকশন কন্ট্রোল, আপসাইড ডাউন ফর্ক এবং দীর্ঘমেয়াদী রিসেল ভ্যালু!`
                : `Within your budget of ৳${quizState.budgetRangeBDT[1].toLocaleString()}, the top pick is **${budgetBike.name}**. However, by stepping up to **${upsellBike.name}**, you unlock superior technology, higher resale value, and top-tier track performance!`}
            </p>

            {aiPitchText && (
              <div className="mt-4 bg-black/30 border border-blue-500/20 rounded-xl p-4 text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-line">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'এআই পার্সোনালাইজড পিচ' : 'AI Personalized Pitch'}</span>
                </span>
                {aiPitchText}
              </div>
            )}
          </div>

          {/* Side-by-Side Bike Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Budget Bike Card */}
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 shadow-xl relative flex flex-col justify-between">
              <div>
                <span className="bg-slate-800 text-gray-300 font-bold text-xs px-3 py-1 rounded-full mb-3 inline-block border border-gray-700">
                  #1 Best Pick Within Your Budget
                </span>

                <img
                  src={budgetBike.image}
                  alt={budgetBike.name}
                  className="w-full h-48 object-cover rounded-xl border border-gray-800 mb-4"
                />

                <h3 className="text-xl font-bold text-white">{budgetBike.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{budgetBike.tagline}</p>

                <div className="mt-4 bg-[#111111] p-3 rounded-xl border border-gray-800 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Official Price:</span>
                    <strong className="text-emerald-400">৳{(budgetBike.offerPriceBDT || budgetBike.priceBDT).toLocaleString()} BDT</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Engine / Mileage:</span>
                    <strong className="text-white">{budgetBike.engineCc}cc • {budgetBike.mileage}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Braking Safety:</span>
                    <strong className="text-blue-300">{budgetBike.absType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">0% EMI Starts From:</span>
                    <strong className="text-amber-400">৳{budgetBike.emiStartingBDT.toLocaleString()}/mo</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 flex gap-2">
                <button
                  onClick={() => onNavigateTab('chat')}
                  className="flex-1 py-2.5 bg-[#181818] hover:bg-[#222222] text-gray-200 border border-gray-800 font-semibold text-xs rounded-xl transition"
                >
                  Buy Budget Bike
                </button>
              </div>
            </div>

            {/* 2. UPSELL BIKE CARD (Highlighted Pitch) */}
            <div className="bg-[#0a0a0a] border-2 border-[#004791] rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between">
              <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Recommended Upgrade</span>
              </span>

              <div>
                <span className="bg-[#004791] text-white font-extrabold text-xs px-3 py-1 rounded-full mb-3 inline-block shadow-md">
                  🚀 Higher Tier Upgrade Option
                </span>

                <img
                  src={upsellBike.image}
                  alt={upsellBike.name}
                  className="w-full h-48 object-cover rounded-xl border border-blue-500/40 mb-4 shadow-xl"
                />

                <h3 className="text-xl font-black text-white">{upsellBike.name}</h3>
                <p className="text-xs text-blue-300 font-medium mt-1">{upsellBike.tagline}</p>

                <div className="mt-4 bg-[#050505] p-3.5 rounded-xl border border-blue-500/30 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Upgrade Price:</span>
                    <strong className="text-2xl font-black text-emerald-400">
                      ৳{(upsellBike.offerPriceBDT || upsellBike.priceBDT).toLocaleString()} BDT
                    </strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400">Price Difference:</span>
                    <span className="text-amber-400 font-bold">+৳{priceDiff.toLocaleString()} BDT</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-400">Added EMI Cost (36 Mo):</span>
                    <span className="text-emerald-400 font-bold">+৳{emiDiff.toLocaleString()}/month</span>
                  </div>
                </div>

                {/* Exclusive Features List */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-300 block">Why Upgrade to {upsellBike.name}?</span>
                  {upsellBike.features.slice(0, 4).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 flex gap-2">
                <button
                  onClick={() => onNavigateTab('chat')}
                  className="w-full py-3 bg-[#004791] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#004791]/40 transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{language === 'bn' ? `আপগ্রেড করে ${upsellBike.name} ক্রয় করুন` : `Upgrade & Purchase ${upsellBike.name}`}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Comparison Table */}
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 font-bold text-white text-base mb-4">
              <Scale className="w-5 h-5 text-blue-400" />
              <span>Side-by-Side Feature Comparison Table</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#111111] text-gray-400">
                    <th className="p-3">Feature Spec</th>
                    <th className="p-3 text-gray-300 font-bold">{budgetBike.name} (Budget)</th>
                    <th className="p-3 text-blue-400 font-bold">{upsellBike.name} (Upgrade Tier)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60 text-gray-300">
                  <tr>
                    <td className="p-3 font-semibold text-gray-400">Official BDT Price</td>
                    <td className="p-3 font-bold text-emerald-400">৳{(budgetBike.offerPriceBDT || budgetBike.priceBDT).toLocaleString()}</td>
                    <td className="p-3 font-bold text-emerald-400">৳{(upsellBike.offerPriceBDT || upsellBike.priceBDT).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400">Engine Displacement</td>
                    <td className="p-3">{budgetBike.engineCc} cc</td>
                    <td className="p-3 font-bold text-white">{upsellBike.engineCc} cc</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400">Maximum Horsepower</td>
                    <td className="p-3">{budgetBike.maxPower}</td>
                    <td className="p-3 font-bold text-amber-300">{upsellBike.maxPower}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400">Fuel Economy Mileage</td>
                    <td className="p-3">{budgetBike.mileage}</td>
                    <td className="p-3">{upsellBike.mileage}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400">Safety Braking System</td>
                    <td className="p-3">{budgetBike.absType}</td>
                    <td className="p-3 font-bold text-blue-400">{upsellBike.absType}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400">Traction Control & VVA</td>
                    <td className="p-3">{budgetBike.features.some(f => f.includes('Traction') || f.includes('VVA')) ? 'Yes' : 'Standard'}</td>
                    <td className="p-3 font-bold text-emerald-400">Advanced TCS & VVA Integrated</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400">0% EMI Monthly Installment</td>
                    <td className="p-3 font-mono">৳{budgetBike.emiStartingBDT.toLocaleString()}/mo</td>
                    <td className="p-3 font-mono text-amber-400 font-bold">৳{upsellBike.emiStartingBDT.toLocaleString()}/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

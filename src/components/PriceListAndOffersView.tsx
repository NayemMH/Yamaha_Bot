import React, { useState } from 'react';
import { Tag, Calculator, Percent, Sparkles, ShieldCheck, Check, ChevronRight, Gift, Building2, ExternalLink } from 'lucide-react';
import { Language, BikeModel } from '../types';
import { YAMAHA_BIKES, YAMAHA_OFFERS } from '../data/yamahaData';

interface PriceListAndOffersViewProps {
  language: Language;
  onNavigateTab: (tab: 'chat' | 'recommend' | 'service-assistant' | 'audio-analyzer' | 'prices' | 'locator' | 'booking' | 'social') => void;
}

export const PriceListAndOffersView: React.FC<PriceListAndOffersViewProps> = ({
  language,
  onNavigateTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBikeForEmi, setSelectedBikeForEmi] = useState<BikeModel>(YAMAHA_BIKES[0]);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20% default
  const [tenureMonths, setTenureMonths] = useState<number>(12); // 12 months default
  const [interestRate, setInterestRate] = useState<number>(0); // 0% EMI default scheme

  // Filtered bikes
  const filteredBikes = YAMAHA_BIKES.filter((bike) => {
    if (selectedCategory === 'ALL') return true;
    return bike.category.toUpperCase() === selectedCategory.toUpperCase();
  });

  // EMI Calculations
  const bikePriceBDT = selectedBikeForEmi.offerPriceBDT || selectedBikeForEmi.priceBDT;
  const downPaymentAmount = Math.round((bikePriceBDT * downPaymentPercent) / 100);
  const loanPrincipal = bikePriceBDT - downPaymentAmount;

  // Monthly EMI Calculation formula: P * r * (1+r)^n / ((1+r)^n - 1) or simple interest scheme for 0%
  const monthlyInterestRate = interestRate > 0 ? interestRate / 12 / 100 : 0;
  const monthlyEmi =
    interestRate === 0
      ? Math.round(loanPrincipal / tenureMonths)
      : Math.round(
          (loanPrincipal * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, tenureMonths)) /
            (Math.pow(1 + monthlyInterestRate, tenureMonths) - 1)
        );

  const totalPayable = downPaymentAmount + monthlyEmi * tenureMonths;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#004791]/10 border border-[#004791]/30 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold mb-3">
          <Tag className="w-4 h-4 text-[#004791]" />
          <span>{language === 'bn' ? 'অফিসিয়াল এসিআই মটরস প্রাইস লিস্ট ২০২৬' : 'Official BDT Price List & Offers'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {language === 'bn' ? 'ইয়ামাহা বাইকের বর্তমান মূল্য তালিকা ও ক্যাশব্যাক অফার' : 'Yamaha Motorbike BD Updated Price List'}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {language === 'bn'
            ? 'ফ্ল্যাট ক্যাশব্যাক অফার, বিশেষ ছাড় এবং ইএমআই লোনের বিস্তারিত কিস্তি হিসাব করুন।'
            : 'Explore current official prices in BDT, cashback discounts, free gifts, and calculate 0% EMI monthly installments.'}
        </p>
      </div>

      {/* ACTIVE PROMOTIONAL OFFERS BANNER */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-400" />
          <span>{language === 'bn' ? 'চলমান ক্যাশব্যাক ও অফারসমূহ' : 'Active Promotions & Special Offers'}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {YAMAHA_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between hover:border-gray-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${offer.badgeColor}`}>
                    {offer.tag}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">Valid: {offer.validUntil}</span>
                </div>

                <h3 className="font-bold text-white text-sm sm:text-base leading-snug">
                  {language === 'bn' ? offer.titleBn : offer.titleEn}
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {language === 'bn' ? offer.descriptionBn : offer.descriptionEn}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-xs text-emerald-400 font-bold">
                  {offer.discountValueBDT > 0 ? `Up to ৳${offer.discountValueBDT.toLocaleString()} Benefit` : '0% Interest Scheme'}
                </span>
                <button
                  onClick={() => onNavigateTab('chat')}
                  className="text-xs text-[#004791] hover:text-blue-300 font-semibold flex items-center gap-1"
                >
                  <span>{language === 'bn' ? 'অফার টি জানুন' : 'Claim Offer'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BIKE CATALOGUE & PRICES */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#004791]" />
            <span>{language === 'bn' ? 'বাইক মডেল ও স্পেসিফিকেশন' : 'Bike Models & BDT Prices'}</span>
          </h2>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {['ALL', 'Sports', 'Street', 'Scrambler', 'Commuter', 'Scooter'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-[#004791] text-white shadow-md shadow-[#004791]/30'
                    : 'bg-[#0a0a0a] text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bike Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBikes.map((bike) => (
            <div
              key={bike.id}
              className="bg-[#0a0a0a] border border-gray-800 hover:border-[#004791]/50 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between group transition duration-300"
            >
              <div>
                {/* Bike Image Container */}
                <div className="relative h-48 bg-[#050505] overflow-hidden">
                  <img
                    src={bike.image}
                    alt={bike.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>

                  <span className="absolute top-3 left-3 bg-[#0a0a0a]/90 text-blue-400 border border-gray-800 font-bold text-[10px] px-2.5 py-1 rounded-md">
                    {bike.category}
                  </span>

                  {bike.cashbackBDT && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-md shadow-md animate-pulse">
                      ৳{bike.cashbackBDT.toLocaleString()} Cashback
                    </span>
                  )}
                </div>

                {/* Bike Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base sm:text-lg">{bike.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{bike.tagline}</p>
                  </div>

                  {/* Specs Pill Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#111111] p-2.5 rounded-xl text-center border border-gray-800">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Engine</span>
                      <span className="text-xs font-bold text-gray-200">{bike.engineCc} cc</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Brakes</span>
                      <span className="text-[11px] font-bold text-blue-300 truncate block">{bike.absType}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase block">Mileage</span>
                      <span className="text-xs font-bold text-emerald-400">{bike.mileage}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-1 text-xs text-gray-300">
                    {bike.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Available Colors Swatches */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-gray-500">Colors:</span>
                    <div className="flex items-center gap-1.5">
                      {bike.colors.map((c, i) => (
                        <span
                          key={i}
                          title={c.name}
                          className="w-3.5 h-3.5 rounded-full border border-gray-700 shadow-sm"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Footer */}
              <div className="p-5 pt-0 border-t border-gray-800/80 mt-2">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-[10px] text-gray-500 block uppercase">Price BDT (৳)</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-emerald-400">
                        ৳{(bike.offerPriceBDT || bike.priceBDT).toLocaleString()}
                      </span>
                      {bike.offerPriceBDT && (
                        <span className="text-xs text-gray-500 line-through">
                          ৳{bike.priceBDT.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 block">Starting EMI</span>
                    <span className="text-xs font-bold text-blue-300">
                      ৳{bike.emiStartingBDT.toLocaleString()} / mo
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedBikeForEmi(bike);
                      const el = document.getElementById('emi-calculator');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-2 bg-[#181818] hover:bg-[#222222] text-gray-200 border border-gray-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                  >
                    <Calculator className="w-3.5 h-3.5 text-blue-400" />
                    <span>EMI Calc</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('booking')}
                    className="w-full py-2 bg-[#004791] hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md shadow-[#004791]/20 transition"
                  >
                    <span>Book Test Ride</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INTERACTIVE EMI LOAN CALCULATOR SECTION */}
      <div id="emi-calculator" className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-[#004791]/10 border border-[#004791]/30 px-3 py-1 rounded-full text-blue-400 text-xs font-semibold mb-2">
            <Calculator className="w-3.5 h-3.5 text-[#004791]" />
            <span>Yamaha BD Financing Tool</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'bn' ? 'ইন্টারেক্টিভ ইএমআই (EMI) ক্যালকুলেটর' : 'Interactive Yamaha Bike EMI Calculator'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {language === 'bn'
              ? 'ডাউন পেমেন্ট ও মাসের মেয়াদ নির্বাচন করে আপনার মাসিক কিস্তির পরিমাণ হিসাব করুন।'
              : 'Calculate your exact monthly installments, down payment, and partner bank financing terms.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-6 bg-[#111111] p-6 rounded-2xl border border-gray-800">
            {/* Select Bike */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">Select Yamaha Motorbike Model:</label>
              <select
                value={selectedBikeForEmi.id}
                onChange={(e) => {
                  const b = YAMAHA_BIKES.find((bk) => bk.id === e.target.value);
                  if (b) setSelectedBikeForEmi(b);
                }}
                className="w-full bg-[#0a0a0a] border border-gray-800 text-white text-xs font-semibold p-3 rounded-xl focus:outline-none focus:border-[#004791]"
              >
                {YAMAHA_BIKES.map((bk) => (
                  <option key={bk.id} value={bk.id}>
                    {bk.name} - ৳{(bk.offerPriceBDT || bk.priceBDT).toLocaleString()} BDT
                  </option>
                ))}
              </select>
            </div>

            {/* Down Payment Slider */}
            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-semibold text-gray-300">Down Payment Percentage:</span>
                <span className="font-extrabold text-blue-400">{downPaymentPercent}% (৳{downPaymentAmount.toLocaleString()} BDT)</span>
              </div>
              <input
                type="range"
                min="10"
                max="70"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-[#004791] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>10% Down</span>
                <span>30% Standard</span>
                <span>50% High</span>
                <span>70% Max</span>
              </div>
            </div>

            {/* Tenure Selector */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">Loan Tenure (Months):</label>
              <div className="grid grid-cols-5 gap-2">
                {[6, 12, 18, 24, 36].map((m) => (
                  <button
                    key={m}
                    onClick={() => setTenureMonths(m)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                      tenureMonths === m
                        ? 'bg-[#004791] text-white border-blue-400 shadow-md'
                        : 'bg-[#0a0a0a] text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {m} Mos
                  </button>
                ))}
              </div>
            </div>

            {/* Scheme Type Toggle */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-2">EMI Scheme Type:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setInterestRate(0)}
                  className={`p-3 rounded-xl border text-xs text-left transition ${
                    interestRate === 0
                      ? 'bg-[#004791]/20 border-[#004791] text-white'
                      : 'bg-[#0a0a0a] border-gray-800 text-gray-400'
                  }`}
                >
                  <div className="font-bold text-blue-300">0% Interest Credit Card Scheme</div>
                  <div className="text-[10px] text-gray-500">City Bank, BRAC, DBBL, EBL Cards</div>
                </button>

                <button
                  onClick={() => setInterestRate(9)}
                  className={`p-3 rounded-xl border text-xs text-left transition ${
                    interestRate === 9
                      ? 'bg-[#004791]/20 border-[#004791] text-white'
                      : 'bg-[#0a0a0a] border-gray-800 text-gray-400'
                  }`}
                >
                  <div className="font-bold text-amber-300">9% Non-Card Biker Loan</div>
                  <div className="text-[10px] text-gray-500">City Bike Loan / BRAC Biker Loan</div>
                </button>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-5 bg-[#111111] border border-[#004791]/40 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <img
                src={selectedBikeForEmi.image}
                alt={selectedBikeForEmi.name}
                className="w-16 h-12 object-cover rounded-lg border border-gray-800"
              />
              <div>
                <h3 className="font-bold text-white text-sm">{selectedBikeForEmi.name}</h3>
                <span className="text-xs text-emerald-400 font-extrabold">
                  Total: ৳{bikePriceBDT.toLocaleString()} BDT
                </span>
              </div>
            </div>

            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-gray-800 text-center space-y-1">
              <span className="text-xs text-gray-400 uppercase tracking-wider block font-semibold">Estimated Monthly Installment</span>
              <div className="text-3xl font-black text-blue-400">
                ৳{monthlyEmi.toLocaleString()} <span className="text-xs font-normal text-gray-400">/ month</span>
              </div>
              <span className="text-[11px] text-gray-500 block">for {tenureMonths} months ({interestRate}% Interest)</span>
            </div>

            <div className="space-y-2 text-xs border-t border-gray-800 pt-4">
              <div className="flex justify-between text-gray-300">
                <span>Upfront Down Payment ({downPaymentPercent}%):</span>
                <span className="font-bold text-white">৳{downPaymentAmount.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Financed Loan Principal:</span>
                <span className="font-bold text-white">৳{loanPrincipal.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Total Amount Payable:</span>
                <span className="font-bold text-emerald-400">৳{totalPayable.toLocaleString()} BDT</span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('booking')}
              className="w-full py-3 bg-[#004791] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#004791]/30 transition flex items-center justify-center gap-2"
            >
              <span>Apply for Financing / Book Bike</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Partner Banks Grid */}
        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Official 0% EMI Partner Banks in Bangladesh</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {['City Bank', 'BRAC Bank', 'Eastern Bank (EBL)', 'Dutch Bangla Bank', 'Prime Bank'].map((bank, i) => (
              <div key={i} className="bg-[#111111] p-3 rounded-xl border border-gray-800 text-xs font-semibold text-gray-300">
                {bank}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { MapPin, Phone, Clock, Star, ShieldCheck, CheckCircle2, Search, Filter, Box, ArrowRight, Building2, PhoneCall } from 'lucide-react';
import { Language, ServiceCenter } from '../types';
import { SERVICE_CENTERS, YAMAHA_BIKES } from '../data/yamahaData';

interface ServiceCenterLocatorViewProps {
  language: Language;
  onSelectCenterForBooking: (centerId: string) => void;
}

export const ServiceCenterLocatorView: React.FC<ServiceCenterLocatorViewProps> = ({
  language,
  onSelectCenterForBooking
}) => {
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [selectedBikeStockFilter, setSelectedBikeStockFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter service centers
  const filteredCenters = SERVICE_CENTERS.filter((center) => {
    // Division match
    if (selectedDivision !== 'ALL' && center.division.toLowerCase() !== selectedDivision.toLowerCase()) {
      return false;
    }

    // Bike stock match
    if (selectedBikeStockFilter !== 'ALL') {
      const stockStatus = center.inventory[selectedBikeStockFilter];
      if (!stockStatus || stockStatus === 'Out of Stock') return false;
    }

    // Search text match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = center.nameEn.toLowerCase().includes(q) || center.nameBn.includes(q);
      const matchAddr = center.addressEn.toLowerCase().includes(q) || center.addressBn.includes(q);
      const matchArea = center.area.toLowerCase().includes(q) || center.district.toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchArea) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#004791]/10 border border-[#004791]/30 px-3.5 py-1.5 rounded-full text-blue-400 text-xs font-semibold mb-3">
          <MapPin className="w-4 h-4 text-[#004791]" />
          <span>{language === 'bn' ? 'বাংলাদেশব্যাপী সার্ভিস সেন্টার ও শোরুম' : 'ACI Motors Authorized Dealer Network'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {language === 'bn' ? 'সার্ভিস সেন্টার লোকেটর ও রিয়েল-টাইম ইনভেন্টরি' : 'Showroom Locator & Real-time Inventory Check'}
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {language === 'bn'
            ? 'আপনার নিকটস্থ ইয়ামাহা থ্রি-এস (3S) সেন্টার এবং বাইক মডেল স্টক স্ট্যাটাস সহজেই খুঁজুন।'
            : 'Find your nearest authorized 3S center, check live bike stock availability, and schedule servicing.'}
        </p>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'লোকেশন বা এরিয়ার নাম দিয়ে খুঁজুন (যেমন: তেজগাঁও, উত্তরা, মিরপুর, আগ্রাবাদ)...'
                  : 'Search by area, address, or center name (e.g., Mirpur, Uttara, Agrabad)...'
              }
              className="w-full bg-[#111111] border border-gray-800 focus:border-[#004791] text-white text-xs pl-10 pr-4 py-3 rounded-xl focus:outline-none"
            />
          </div>

          {/* Division Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-[#111111] border border-gray-800 text-white text-xs p-3 rounded-xl focus:outline-none focus:border-[#004791]"
            >
              <option value="ALL">All Bangladesh Divisions (সব বিভাগ)</option>
              <option value="Dhaka">Dhaka (ঢাকা)</option>
              <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
              <option value="Sylhet">Sylhet (সিলেট)</option>
              <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
              <option value="Khulna">Khulna (খুলনা)</option>
              <option value="Barisal">Barisal (বরিশাল)</option>
              <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
            </select>
          </div>

          {/* Real-time Bike Stock Availability Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedBikeStockFilter}
              onChange={(e) => setSelectedBikeStockFilter(e.target.value)}
              className="w-full bg-[#111111] border border-amber-500/40 text-amber-300 text-xs p-3 rounded-xl focus:outline-none focus:border-amber-400 font-medium"
            >
              <option value="ALL">📦 Filter by Bike Model Stock Availability</option>
              {YAMAHA_BIKES.map((b) => (
                <option key={b.id} value={b.id}>
                  Show centers with {b.name} In Stock
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Division Quick Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-gray-800 scrollbar-none">
          <span className="text-[11px] text-gray-500 font-semibold mr-1 shrink-0">Divisions:</span>
          {['ALL', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Mymensingh'].map((div) => (
            <button
              key={div}
              onClick={() => setSelectedDivision(div)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedDivision === div
                  ? 'bg-[#004791] text-white font-bold shadow-md shadow-[#004791]/20'
                  : 'bg-[#111111] text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {div}
            </button>
          ))}
        </div>
      </div>

      {/* SERVICE CENTERS CARDS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Found <strong className="text-white font-bold">{filteredCenters.length}</strong> Authorized Service Centers</span>
          {selectedBikeStockFilter !== 'ALL' && (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
              Stock Filter Active: {YAMAHA_BIKES.find(b => b.id === selectedBikeStockFilter)?.name}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCenters.map((center) => (
            <div
              key={center.id}
              className="bg-[#0a0a0a] border border-gray-800 hover:border-gray-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 relative group transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#004791]/10 border border-[#004791]/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Building2 className="w-4 h-4 text-[#004791]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-sm leading-tight">
                        {language === 'bn' ? center.nameBn : center.nameEn}
                      </h3>
                      <span className="text-[10px] text-gray-400 block mt-0.5 font-medium">
                        {center.area}, {center.division}
                      </span>
                    </div>
                  </div>

                  {center.isFlagship && (
                    <span className="bg-[#004791]/20 text-blue-300 border border-[#004791]/40 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                      Flagship
                    </span>
                  )}
                </div>

                {/* Rating & Hours */}
                <div className="flex items-center gap-4 text-xs text-gray-400 border-y border-gray-800/80 py-2.5 my-3">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{center.rating}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-[11px]">{center.openingHours}</span>
                  </div>
                </div>

                {/* Address & Phone */}
                <div className="space-y-2 text-xs text-gray-300">
                  <p className="flex items-start gap-2 leading-relaxed">
                    <MapPin className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                    <span>{language === 'bn' ? center.addressBn : center.addressEn}</span>
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={`tel:${center.phone}`}
                      className="flex items-center gap-1.5 text-blue-400 font-semibold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5 text-[#004791]" />
                      <span>{center.phone}</span>
                    </a>
                    {center.hotline && (
                      <span className="text-[10px] bg-[#111111] text-gray-400 px-2 py-0.5 rounded border border-gray-800">
                        Hotline: {center.hotline}
                      </span>
                    )}
                  </div>
                </div>

                {/* Services Available Badges */}
                <div className="mt-4">
                  <span className="text-[10px] text-gray-500 uppercase font-semibold block mb-1.5">Services Available:</span>
                  <div className="flex flex-wrap gap-1">
                    {center.servicesAvailable.map((srv, i) => (
                      <span
                        key={i}
                        className="bg-[#111111] text-gray-400 text-[10px] px-2 py-0.5 rounded-md border border-gray-800"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Live Bike Stock Inventory Box */}
                <div className="mt-4 bg-[#111111] p-3 rounded-xl border border-gray-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
                    <Box className="w-3 h-3 text-amber-400" />
                    <span>Live Showroom Bike Stock:</span>
                  </span>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {Object.entries(center.inventory).slice(0, 4).map(([bikeId, status]) => {
                      const bkName = YAMAHA_BIKES.find(b => b.id === bikeId)?.name.split(' ')[2] || bikeId;
                      return (
                        <div key={bikeId} className="flex items-center justify-between bg-[#0a0a0a] px-2 py-1 rounded border border-gray-800/50">
                          <span className="text-gray-300 font-medium truncate">{bkName}:</span>
                          <span className={`font-bold text-[10px] ${
                            status === 'In Stock' ? 'text-emerald-400' :
                            status === 'Limited Stock' ? 'text-amber-400' : 'text-gray-500'
                          }`}>
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectCenterForBooking(center.id)}
                className="w-full py-2.5 bg-[#004791] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#004791]/20 transition flex items-center justify-center gap-1.5"
              >
                <span>{language === 'bn' ? 'এখানে সার্ভিস বুক করুন' : 'Schedule Service Appointment'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

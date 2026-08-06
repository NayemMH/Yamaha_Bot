import React, { useMemo, useRef, useState } from 'react';
import { MapPin, Check, Wand2 } from 'lucide-react';
import { Language } from '../types';
import {
  BANGLADESH_DISTRICTS,
  autoCorrectLocation,
  suggestDistricts,
  suggestUpazilas
} from '../data/locationData';

interface LocationPickerProps {
  language: Language;
  district: string;
  upazila: string;
  onChange: (district: string, upazila: string, wasCorrected: boolean) => void;
  compact?: boolean;
}

/**
 * Zilla + Upazila picker: dropdown + free-text combobox with type-ahead and
 * fuzzy auto-correction ("Sylet" → Sylhet). Correction happens silently on
 * blur/selection and is shown as a small confirmation badge.
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({ language, district, upazila, onChange, compact }) => {
  const [districtInput, setDistrictInput] = useState(district);
  const [upazilaInput, setUpazilaInput] = useState(upazila);
  const [districtFocused, setDistrictFocused] = useState(false);
  const [upazilaFocused, setUpazilaFocused] = useState(false);
  const [correctionNote, setCorrectionNote] = useState<string | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const districtSuggestions = useMemo(
    () => (districtFocused ? suggestDistricts(districtInput, 6) : []),
    [districtInput, districtFocused]
  );
  const upazilaSuggestions = useMemo(
    () => (upazilaFocused ? suggestUpazilas(district, upazilaInput, 8) : []),
    [district, upazilaInput, upazilaFocused]
  );

  const applyDistrict = (nameEn: string, corrected = false) => {
    const distObj = BANGLADESH_DISTRICTS.find(x => x.nameEn === nameEn);
    const firstUpazila = distObj?.upazilas[0]?.nameEn || 'Sadar';
    setDistrictInput(nameEn);
    setUpazilaInput(firstUpazila);
    onChange(nameEn, firstUpazila, corrected);
  };

  const handleDistrictBlur = () => {
    blurTimer.current = setTimeout(() => {
      setDistrictFocused(false);
      if (!districtInput.trim()) return;
      const exact = BANGLADESH_DISTRICTS.find(x => x.nameEn.toLowerCase() === districtInput.trim().toLowerCase());
      if (exact) {
        if (exact.nameEn !== district) applyDistrict(exact.nameEn);
        return;
      }
      const corrected = autoCorrectLocation(districtInput);
      if (corrected.confidence > 0) {
        applyDistrict(corrected.district, corrected.wasCorrected);
        if (corrected.wasCorrected) {
          setCorrectionNote(
            language === 'bn'
              ? `"${districtInput}" স্বয়ংক্রিয়ভাবে সংশোধন করা হয়েছে → ${corrected.district}`
              : `Auto-corrected "${districtInput}" → ${corrected.district}`
          );
          setTimeout(() => setCorrectionNote(null), 5000);
        }
      }
    }, 180);
  };

  const handleUpazilaBlur = () => {
    blurTimer.current = setTimeout(() => {
      setUpazilaFocused(false);
      if (!upazilaInput.trim()) return;
      const suggestions = suggestUpazilas(district, upazilaInput, 1);
      const best = suggestions[0];
      if (best && best.toLowerCase() !== upazilaInput.trim().toLowerCase()) {
        setUpazilaInput(best);
        onChange(district, best, true);
        setCorrectionNote(
          language === 'bn'
            ? `উপজেলা সংশোধন: "${upazilaInput}" → ${best}`
            : `Upazila corrected: "${upazilaInput}" → ${best}`
        );
        setTimeout(() => setCorrectionNote(null), 5000);
      } else if (best) {
        onChange(district, best, false);
      } else {
        onChange(district, upazilaInput.trim(), false);
      }
    }, 180);
  };

  const inputCls = `w-full bg-slate-800/80 border border-gray-700 rounded-lg px-3 ${compact ? 'py-1.5 text-xs' : 'py-2 text-sm'} text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition`;
  const dropdownCls = 'absolute z-30 mt-1 w-full bg-slate-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden max-h-52 overflow-y-auto';
  const optionCls = 'w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-blue-600/30 flex items-center justify-between transition';

  return (
    <div className="space-y-2">
      <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-2 gap-3'}`}>
        {/* District (Zilla) combobox */}
        <div className="relative">
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
            {language === 'bn' ? 'জেলা (Zilla)' : 'District (Zilla)'}
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={districtInput}
              onChange={e => { setDistrictInput(e.target.value); setDistrictFocused(true); }}
              onFocus={() => { if (blurTimer.current) clearTimeout(blurTimer.current); setDistrictFocused(true); }}
              onBlur={handleDistrictBlur}
              placeholder={language === 'bn' ? 'যেমন: ঢাকা, সিলেট, বগুড়া...' : 'e.g. Dhaka, Sylhet, Bogura...'}
              className={`${inputCls} pl-8`}
            />
          </div>
          {districtFocused && districtSuggestions.length > 0 && (
            <div className={dropdownCls}>
              {districtSuggestions.map(dist => (
                <button
                  key={dist.id}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); applyDistrict(dist.nameEn); setDistrictFocused(false); }}
                  className={optionCls}
                >
                  <span>{dist.nameEn} <span className="text-gray-500">({dist.nameBn})</span></span>
                  <span className="text-[9px] text-gray-500 uppercase">{dist.division}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Upazila combobox */}
        <div className="relative">
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
            {language === 'bn' ? 'উপজেলা / এলাকা' : 'Upazila / Area'}
          </label>
          <input
            type="text"
            value={upazilaInput}
            onChange={e => { setUpazilaInput(e.target.value); setUpazilaFocused(true); }}
            onFocus={() => { if (blurTimer.current) clearTimeout(blurTimer.current); setUpazilaFocused(true); }}
            onBlur={handleUpazilaBlur}
            placeholder={language === 'bn' ? 'উপজেলা লিখুন বা বাছাই করুন' : 'Type or pick an upazila'}
            className={inputCls}
          />
          {upazilaFocused && upazilaSuggestions.length > 0 && (
            <div className={dropdownCls}>
              {upazilaSuggestions.map(name => (
                <button
                  key={name}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); setUpazilaInput(name); onChange(district, name, false); setUpazilaFocused(false); }}
                  className={optionCls}
                >
                  <span>{name}</span>
                  {name === upazila && <Check className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {correctionNote && (
        <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
          <Wand2 className="w-3 h-3 shrink-0" />
          <span>{correctionNote}</span>
        </div>
      )}
    </div>
  );
};

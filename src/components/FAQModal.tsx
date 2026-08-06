import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck, Search, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { FAQ_ITEMS } from '../data/yamahaData';

interface FAQModalProps {
  language: Language;
}

export const FAQModal: React.FC<FAQModalProps> = ({ language }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.questionEn.toLowerCase().includes(q) ||
      item.questionBn.includes(q) ||
      item.answerEn.toLowerCase().includes(q) ||
      item.answerBn.includes(q)
    );
  });

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-5xl mx-auto my-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#004791]/10 border border-[#004791]/30 px-3 py-1 rounded-full text-blue-400 text-xs font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#004791]" />
            <span>{language === 'bn' ? 'সাধারণ জিজ্ঞাসা ও উত্তর' : 'Frequently Asked Questions'}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {language === 'bn' ? 'ইয়ামাহা মোটরসাইকেল প্রশ্নোওর (Q&A)' : 'Yamaha BD Customer Q&A Knowledge Base'}
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs..."
            className="w-full bg-[#111111] border border-gray-800 text-white text-xs pl-8 pr-3 py-2 rounded-xl focus:outline-none focus:border-[#004791]"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredFaqs.map((faq) => {
          const isOpen = openFaqId === faq.id;
          return (
            <div
              key={faq.id}
              className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-blue-300 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="bg-[#004791]/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-semibold border border-[#004791]/30">
                    {language === 'bn' ? faq.categoryBn : faq.categoryEn}
                  </span>
                  <span>{language === 'bn' ? faq.questionBn : faq.questionEn}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 text-xs text-gray-300 leading-relaxed whitespace-pre-line border-t border-gray-800/80 pt-3">
                  {language === 'bn' ? faq.answerBn : faq.answerEn}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

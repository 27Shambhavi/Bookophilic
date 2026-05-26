import React, { useState } from 'react';
import { Quote, Languages } from 'lucide-react';

const BILINGUAL_QUOTES = [
  {
    en: "He who has a why to live can bear almost any how.",
    hi: "जिसके पास जीने का एक 'क्यों' है, वह लगभग किसी भी 'कैसे' को सहन कर सकता है।",
    author: "Friedrich Nietzsche"
  },
  {
    en: "The only true wisdom is in knowing you know nothing.",
    hi: "एकमात्र सच्ची बुद्धिमत्ता यह जानने में है कि आप कुछ नहीं जानते।",
    author: "Socrates"
  },
  {
    en: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    hi: "आपका अपने मन पर नियंत्रण है - बाहरी घटनाओं पर नहीं। इसे समझें, और आपको शक्ति मिलेगी।",
    author: "Marcus Aurelius"
  },
  {
    en: "Simplicity is the ultimate sophistication.",
    hi: "सादगी ही परम परिष्कार है।",
    author: "Leonardo da Vinci"
  },
  {
    en: "An obstacle is often a stepping stone.",
    hi: "एक बाधा अक्सर एक मील का पत्थर होती है।",
    author: "Seneca"
  }
];

export default function QuoteWidget() {
  const [showHindi, setShowHindi] = useState(false);
  
  // Pick a quote deterministically based on today's date
  const today = new Date().getDate();
  const quoteObj = BILINGUAL_QUOTES[today % BILINGUAL_QUOTES.length];

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-slate-900/60 to-primary-950/20">
      <div className="absolute -right-8 -top-8 text-primary-500/5 select-none pointer-events-none">
        <Quote className="w-32 h-32 transform rotate-180" />
      </div>

      <div className="relative flex gap-4 pr-24">
        <Quote className="w-8 h-8 text-teal-400 shrink-0 transform rotate-180" />
        <div className="space-y-2">
          <p className="text-slate-200 text-base md:text-lg italic font-medium leading-relaxed transition-all duration-300">
            "{showHindi ? quoteObj.hi : quoteObj.en}"
          </p>
          <p className="text-teal-400 font-bold text-sm tracking-wide uppercase">
            — {quoteObj.author}
          </p>
        </div>
      </div>

      <button 
        onClick={() => setShowHindi(!showHindi)}
        className="absolute right-4 bottom-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-all active:scale-95 cursor-pointer shadow-sm"
      >
        <Languages className="w-3.5 h-3.5 text-teal-400" />
        {showHindi ? "Show English" : "हिन्दी में अनुवाद"}
      </button>
    </div>
  );
}

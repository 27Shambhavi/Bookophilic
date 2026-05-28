import React, { useEffect, useState } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Copy, Check, Quote, RefreshCw } from 'lucide-react';
import mentorService from '../../services/mentor_service';

const LOCAL_SLIDES = [
  {
    type: 'quote',
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "Stoicism"
  },
  {
    type: 'quote',
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    category: "Philosophy"
  },
  {
    type: 'quote',
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca",
    category: "Stoicism"
  },
  {
    type: 'quote',
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs",
    category: "Inspiration"
  },
  {
    type: 'quote',
    text: "The important thing is not to stop questioning. Curiosity has its own reason for existing.",
    author: "Albert Einstein",
    category: "Science"
  },
  {
    type: 'quote',
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
    category: "Wisdom"
  },
  {
    type: 'quote',
    text: "It is not what happens to you, but how you react to it that matters.",
    author: "Epictetus",
    category: "Stoicism"
  },
  {
    type: 'quote',
    text: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche",
    category: "Philosophy"
  },
  {
    type: 'quote',
    text: "I have decided to be happy because it is good for my health.",
    author: "Voltaire",
    category: "Wisdom"
  },
  {
    type: 'quote',
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson",
    category: "Inspiration"
  },
  {
    type: 'affirmation',
    text: "I am cultivating deep focus, absorbing valuable insights, and growing wiser with every page I read.",
    author: "Self-Reflection",
    category: "Growth"
  },
  {
    type: 'affirmation',
    text: "I accept the universe's flow and focus only on what is within my control. Today, I build inner strength.",
    author: "Marcus Aurelius",
    category: "Stoic Affirmation"
  },
  {
    type: 'affirmation',
    text: "My mind is a vessel for endless curiosity. I embrace challenges as opportunities to learn and expand.",
    author: "Albert Einstein",
    category: "Curiosity"
  },
  {
    type: 'affirmation',
    text: "I trust my intuition, follow my heart, and commit myself to high-quality creation and deliberate learning.",
    author: "Steve Jobs",
    category: "Intuition"
  },
  {
    type: 'affirmation',
    text: "I separate external events from my internal choices. I master my judgements to maintain absolute tranquility.",
    author: "Epictetus",
    category: "Tranquility"
  },
  {
    type: 'affirmation',
    text: "I turn my focus inward. By cultivating peace, I radiate light and clarity to the world around me.",
    author: "Rumi",
    category: "Inner Peace"
  },
  {
    type: 'affirmation',
    text: "I guard my thoughts against imagined worries. I anchor myself fully in the present moment.",
    author: "Seneca",
    category: "Presence"
  },
  {
    type: 'affirmation',
    text: "I remain open, curious, and humble. By questioning and seeking truth, I deepen my understanding.",
    author: "Socrates",
    category: "Wisdom"
  }
];

export default function CoachingWidget() {
  const [slides, setSlides] = useState(LOCAL_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeMentor, setActiveMentor] = useState(mentorService.getMentor());

  // Fetch quotes from the internet
  const fetchInternetQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://dummyjson.com/quotes?limit=50');
      if (res.ok) {
        const data = await res.json();
        if (data && data.quotes && data.quotes.length > 0) {
          const internetQuotes = data.quotes.map(q => ({
            type: 'quote',
            text: q.quote,
            author: q.author,
            category: 'Internet Wisdom'
          }));
          // Combine local affirmations & classical quotes with new internet quotes
          // Shuffle them to make it dynamic
          const blended = [...LOCAL_SLIDES, ...internetQuotes].sort(() => 0.5 - Math.random());
          setSlides(blended);
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch internet quotes, using offline pool.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternetQuotes();

    const handleMentorChange = () => {
      setActiveMentor(mentorService.getMentor());
    };
    window.addEventListener('mentor_changed', handleMentorChange);
    return () => window.removeEventListener('mentor_changed', handleMentorChange);
  }, []);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    setCopied(false);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    setCopied(false);
  };

  const handleCopy = () => {
    const activeSlide = slides[currentIndex];
    const textToCopy = `"${activeSlide.text}" — ${activeSlide.author}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Steer the starting index towards active mentor if available
  useEffect(() => {
    if (activeMentor && slides.length > 0) {
      const idx = slides.findIndex(s => s.author.toLowerCase().includes(activeMentor.toLowerCase()));
      if (idx !== -1) {
        setCurrentIndex(idx);
      }
    }
  }, [activeMentor, slides]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-6 border border-white/5 bg-gradient-to-br from-slate-900/60 to-primary-950/20 animate-fadeIn min-h-[220px] flex flex-col justify-between">
      
      {/* Background Quote Watermark */}
      <div className="absolute -right-8 -top-8 text-primary-500/5 select-none pointer-events-none">
        <Quote className="w-32 h-32 transform rotate-180" />
      </div>

      {/* Header */}
      <div className="relative flex justify-between items-center pb-3 border-b border-white/5 z-10 font-sans">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-400 animate-pulse" />
          <h4 className="font-bold text-white text-xs uppercase tracking-wider select-none">
            Daily Wisdom & Affirmations
          </h4>
        </div>
        
        {/* Indicators and Controls */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-slate-500 font-extrabold select-none">
            {currentIndex + 1} / {slides.length}
          </span>
          <button
            onClick={fetchInternetQuotes}
            disabled={loading}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 hover:bg-white/5 rounded-lg border border-transparent"
            title="Refetch Quotes from Internet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Slide Body */}
      <div className="relative py-5 flex-1 flex flex-col justify-center min-h-[90px] z-10 font-sans">
        {/* Type Badge */}
        <div className="flex justify-between items-center mb-2">
          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold select-none ${
            currentSlide.type === 'quote' 
              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
              : 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
          }`}>
            {currentSlide.type === 'quote' ? '💬 Famous Quote' : '🧘 Positive Affirmation'}
          </span>
          {currentSlide.category && (
            <span className="text-[10px] text-slate-500 font-bold select-none italic">
              #{currentSlide.category}
            </span>
          )}
        </div>

        {/* Content */}
        <p className="text-slate-200 text-sm md:text-base italic font-semibold leading-relaxed transition-all duration-300">
          "{currentSlide.text}"
        </p>

        {/* Author */}
        <p className="text-primary-400 font-bold text-xs tracking-wide uppercase mt-2.5">
          — {currentSlide.author}
        </p>
      </div>

      {/* Slide Controls Footer */}
      <div className="relative flex justify-between items-center border-t border-white/5 pt-3 z-10 font-sans">
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
          title="Copy to Clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-teal-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              Copy wisdom
            </>
          )}
        </button>

        {/* Slide Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

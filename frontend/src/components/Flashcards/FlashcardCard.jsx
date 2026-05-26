import React, { useState } from 'react';
import { RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';

export default function FlashcardCard({ card, onScore }) {
  const [flipped, setFlipped] = useState(false);

  const ratings = [
    { value: 0, label: 'Forgot ❌', color: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/25' },
    { value: 2, label: 'Partially ⚠️', color: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/25' },
    { value: 3, label: 'Hard 🧠', color: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/25' },
    { value: 5, label: 'Easy ✨', color: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/25' },
  ];

  return (
    <div className="flex flex-col items-center max-w-lg w-full mx-auto">
      {/* 3D Container */}
      <div 
        className="w-full aspect-[1.6/1] cursor-pointer group perspective-1000 mb-6"
        onClick={() => setFlipped(!flipped)}
      >
        {/* Flipper card */}
        <div 
          className={`relative w-full h-full duration-500 transform-style-3d ${
            flipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden glass-panel rounded-3xl p-8 flex flex-col justify-between shadow-glass border border-white/10">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-extrabold tracking-widest text-teal-400">
                Question
              </span>
              <HelpCircle className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 flex items-center justify-center py-4">
              <p className="text-xl md:text-2xl font-bold text-center text-white select-none leading-relaxed">
                {card.question}
              </p>
            </div>
            <div className="flex justify-center items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <RefreshCw className="w-3.5 h-3.5" /> Click Card to Reveal Answer
            </div>
          </div>

          {/* Back Side (Rotated 180deg) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel bg-slate-900/90 rounded-3xl p-8 flex flex-col justify-between shadow-glass-glow border border-primary-500/30">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase font-extrabold tracking-widest text-primary-400">
                Answer
              </span>
              <CheckCircle className="w-5 h-5 text-slate-500" />
            </div>
            <div className="flex-1 flex items-center justify-center py-4 overflow-y-auto">
              <p className="text-lg md:text-xl text-center text-slate-200 select-none leading-relaxed">
                {card.answer}
              </p>
            </div>
            <div className="flex justify-center items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <RefreshCw className="w-3.5 h-3.5" /> Click Card to Show Question
            </div>
          </div>
        </div>
      </div>

      {/* SM-2 Feedback Ratings bar */}
      {flipped && (
        <div className="w-full glass-panel border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Rate your recall difficulty:
          </span>
          <div className="grid grid-cols-4 gap-2 w-full">
            {ratings.map((rating) => (
              <button
                key={rating.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onScore(card.id, rating.value);
                  setFlipped(false);
                }}
                className={`py-2 rounded-xl text-xs md:text-sm font-bold border transition-all ${rating.color}`}
              >
                {rating.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Tag, Send, Loader2 } from 'lucide-react';
import aiService from '../../services/aiService';

export default function ThemeWidget() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await aiService.analyzeTheme(text);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-white/5">
        <Tag className="w-5 h-5 text-primary-400" />
        <h4 className="font-bold text-white text-sm uppercase tracking-wider">
          AI Literary Theme Classifier
        </h4>
      </div>

      <textarea
        className="w-full h-24 bg-slate-900/50 border border-white/5 focus:border-primary-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all resize-none"
        placeholder="Paste a page text snippet or book synopsis here to extract underlying themes and categories..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-glass-glow transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Classifying...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Classify Themes
          </>
        )}
      </button>

      {result && (
        <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-3 text-sm animate-fadeIn">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Primary Category:</span>
            <span className="text-primary-400 font-bold px-2.5 py-0.5 bg-primary-500/10 rounded-md border border-primary-500/20 text-xs">
              {result.primary_genre}
            </span>
          </div>
          {result.secondary_genres && result.secondary_genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-slate-400 font-medium mr-1">Secondaries:</span>
              {result.secondary_genres.map((g) => (
                <span key={g} className="text-xs text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {g}
                </span>
              ))}
            </div>
          )}
          {result.themes && result.themes.length > 0 && (
            <div className="space-y-1.5 border-t border-white/5 pt-2">
              <span className="text-slate-400 font-medium block">Thematic Tags:</span>
              <div className="flex flex-wrap gap-1">
                {result.themes.map((t) => (
                  <span key={t} className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

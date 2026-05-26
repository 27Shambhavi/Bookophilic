import React, { useState } from 'react';
import { Smile, Send, Loader2 } from 'lucide-react';
import aiService from '../../services/aiService';

export default function SentimentWidget() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const data = await aiService.analyzeSentiment(text);
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
        <Smile className="w-5 h-5 text-teal-400" />
        <h4 className="font-bold text-white text-sm uppercase tracking-wider">
          AI Sentiment Analyzer
        </h4>
      </div>

      <textarea
        className="w-full h-24 bg-slate-900/50 border border-white/5 focus:border-primary-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all resize-none"
        placeholder="Type a note or paragraph here to analyze its underlying sentiment and emotional tone..."
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
            <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Analyze Sentiment
          </>
        )}
      </button>

      {result && (
        <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 space-y-2.5 text-sm animate-fadeIn">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Sentiment Classification:</span>
            <span className="text-teal-400 font-bold px-2.5 py-0.5 bg-teal-500/10 rounded-md border border-teal-500/20 text-xs">
              {result.sentiment}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Positivity Score:</span>
            <span className="text-white font-bold">{result.score}</span>
          </div>
          <div className="text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-2">
            <strong>Diagnostic:</strong> {result.details}
          </div>
        </div>
      )}
    </div>
  );
}

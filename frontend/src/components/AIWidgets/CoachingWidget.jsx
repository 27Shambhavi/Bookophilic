import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import aiService from '../../services/aiService';
import mentorService from '../../services/mentor_service';

export default function CoachingWidget() {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMentor, setActiveMentor] = useState(mentorService.getMentor());

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await aiService.getReadingCoachingInsights();
      setInsights(data.insights);
    } catch (err) {
      console.error(err);
      setInsights("No reading history found to compute cognitive insights. Log a reading session to generate your coach report!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    
    const handleMentorChange = () => {
      setActiveMentor(mentorService.getMentor());
    };
    window.addEventListener('mentor_changed', handleMentorChange);
    return () => window.removeEventListener('mentor_changed', handleMentorChange);
  }, []);

  const mentorConfig = mentorService.getMentorConfig(activeMentor);
  const adaptedInsights = insights ? mentorService.adaptText(insights, activeMentor) : '';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4 bg-gradient-to-br from-slate-900/60 to-primary-950/20">
      <div className="flex justify-between items-center pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          <h4 className="font-bold text-white text-sm uppercase tracking-wider">
            Daily Wisdom & Affirmations ({mentorConfig.name})
          </h4>
        </div>
        <button 
          onClick={fetchInsights}
          disabled={loading}
          className="text-slate-400 hover:text-white transition-colors"
          title="Refresh Wisdom & Quotes"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Reflecting on your learning journey...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights ? (
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-3 font-medium">
              {adaptedInsights}
              <div className="text-xs text-primary-400 font-bold mt-4 italic border-t border-white/5 pt-2 text-right">
                {mentorConfig.signature}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              Log reading sessions to receive wisdom and positive affirmations tailored to your reading journey.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

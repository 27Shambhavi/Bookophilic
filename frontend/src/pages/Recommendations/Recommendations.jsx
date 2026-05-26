import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Sparkles, Loader2, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import aiService from '../../services/aiService';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Recommendations() {
  const navigate = useNavigate();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRecs = async () => {
    try {
      const data = await aiService.getRecommendations();
      setRecs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }
    fetchRecs();
  }, [navigate]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await aiService.generateRecommendations();
      setRecs(result.data || []);
      alert("Recommendations recalculated successfully based on your latest catalog and page content!");
    } catch (err) {
      console.error(err);
      alert("Failed to compute matches. Make sure you have at least one book in your library and have set your favorite genres in settings!");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Sparkles className="w-8 h-8 text-primary-500" /> AI Book Matchmaker
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Discover your next read calculated using Jaccard overlaps and content embeddings.
              </p>
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={generating || loading}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-sm shadow-glass-glow disabled:opacity-50 transition-all"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Recalculating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Recalculate Matches
                </>
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-slate-400 font-medium">Querying vector databases...</p>
            </div>
          ) : recs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recs.map((rec) => (
                <div 
                  key={rec.id} 
                  className="glass-panel rounded-2xl p-6 border border-white/5 flex flex-col justify-between hover:border-primary-500/20 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">
                          {rec.recommended_title}
                        </h3>
                        <p className="text-slate-400 text-sm font-semibold">
                          by {rec.recommended_author}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
                        {Math.round(rec.score * 100)}% Match
                      </span>
                    </div>

                    {rec.reason && (
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed">
                        <strong>Match Reason:</strong> {rec.reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 max-w-md mx-auto space-y-5">
              <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">No matches found</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We need data to compute similarities! Ensure you have created books in your library and updated preferred genres in settings.
                </p>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm transition-all"
              >
                Compute Recommendations
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

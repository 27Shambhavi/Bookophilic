import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatsCard from '../../components/Dashboard/StatsCard';
import CoachingWidget from '../../components/AIWidgets/CoachingWidget';
import SentimentWidget from '../../components/AIWidgets/SentimentWidget';
import WisdomGraph from '../../components/Dashboard/WisdomGraph';
import { Book, CheckCircle, FileText, Brain, Loader2, Calendar, Trophy, User } from 'lucide-react';
import bookService from '../../services/bookService';
import noteService from '../../services/noteService';
import aiService from '../../services/aiService';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

import mentorService from '../../services/mentor_service';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(mentorService.getMentor());
  const [customMentorInput, setCustomMentorInput] = useState('');

  const handleMentorChange = (m) => {
    mentorService.setMentor(m);
    setSelectedMentor(m);
  };

  const [stats, setStats] = useState({
    booksCount: 0,
    completedCount: 0,
    notesCount: 0,
    dueCardsCount: 0,
  });
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        const booksList = await bookService.getBooks();
        setBooks(booksList);
        const completedBooks = booksList.filter(b => b.status === 'completed');
        const notesList = await noteService.getNotes();
        const dueCards = await aiService.getDueFlashcards();
        
        setStats({
          booksCount: booksList.length,
          completedCount: completedBooks.length,
          notesCount: notesList.length,
          dueCardsCount: dueCards.length,
        });
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [navigate]);

  const getWisdomTitle = (completed) => {
    if (completed === 0) return "Curious Explorer 🎒";
    if (completed <= 2) return "Mind Cultivator 🌱";
    if (completed <= 5) return "Cognitive Scholar 📖";
    if (completed <= 10) return "Wisdom Craftsman 🏛️";
    return "Existential Architect 🌌";
  };

  const wisdomTitle = getWisdomTitle(stats.completedCount);

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Performance Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">
                View your cognitive reading progress, study analytics, and AI recommendations.
              </p>
            </div>
            
            {!loading && (
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold shadow-md shadow-indigo-500/5">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                  <span>{wisdomTitle}</span>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-slate-400 font-medium">Aggregating reading metrics...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatsCard
                  title="Total Books"
                  value={stats.booksCount}
                  icon={Book}
                  description="Books in your library"
                  colorClass="from-indigo-500 to-indigo-600"
                />
                <StatsCard
                  title="Completed"
                  value={stats.completedCount}
                  icon={CheckCircle}
                  description="Read cover to cover"
                  colorClass="from-emerald-500 to-emerald-600"
                />
                <StatsCard
                  title="Study Notes"
                  value={stats.notesCount}
                  icon={FileText}
                  description="Total annotations saved"
                  colorClass="from-cyan-500 to-cyan-600"
                />
                <StatsCard
                  title="Due Flashcards"
                  value={stats.dueCardsCount}
                  icon={Brain}
                  description="Spaced review cards due"
                  trend={stats.dueCardsCount > 0 ? "Review Now" : "Clear"}
                  colorClass="from-pink-500 to-pink-600"
                />
              </div>

              {/* Coach Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <CoachingWidget />
                  <WisdomGraph books={books} />
                </div>

                <div className="space-y-8">
                  {/* Thinkers Selector */}
                  <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 select-none">
                      <User className="w-5 h-5 text-primary-400" /> Great Thinkers & Philosophers
                    </h3>
                    <p className="text-xs text-slate-400 select-none">
                      Select a popular thinker or search for any custom philosopher to steer quotes, positive reflections, and debates.
                    </p>
                    
                    {/* Preset Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {mentorService.getMentors().map(m => (
                        <button
                          key={m.key}
                          onClick={() => handleMentorChange(m.key)}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                            selectedMentor === m.key
                              ? 'bg-primary-500/10 border-primary-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.25)]'
                              : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <span className="block text-[11px] font-extrabold">{m.name}</span>
                          <span className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">{m.title}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Thinker Steer Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (customMentorInput.trim()) {
                          handleMentorChange(customMentorInput.trim());
                          setCustomMentorInput('');
                        }
                      }}
                      className="flex gap-2 pt-2 border-t border-white/5"
                    >
                      <input
                        type="text"
                        placeholder="Search/Type any thinker (e.g. Seneca)..."
                        className="flex-1 bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                        value={customMentorInput}
                        onChange={(e) => setCustomMentorInput(e.target.value)}
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer select-none"
                      >
                        Steer
                      </button>
                    </form>

                    {/* Active steered indicator if custom */}
                    {!['Socrates', 'Steve Jobs', 'Albert Einstein', 'Marcus Aurelius'].includes(selectedMentor) && (
                      <div className="flex justify-between items-center bg-violet-500/10 border border-violet-500/20 px-3 py-2.5 rounded-xl text-xs text-violet-400 font-bold animate-fadeIn">
                        <span>Currently Steered: {selectedMentor}</span>
                        <button
                          type="button"
                          onClick={() => handleMentorChange('Socrates')}
                          className="text-[10px] text-violet-300 hover:underline font-extrabold cursor-pointer border-none bg-transparent"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reading Challenges Widget */}
                  <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" /> Active Challenges
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Challenge 1 */}
                      {(() => {
                        const techBooks = books.filter(b => b.genre?.name === "Tech").length;
                        const pct = Math.min(100, Math.round((techBooks / 3) * 100));
                        return (
                          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="relative w-11 h-11 shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle cx="22" cy="22" r="18" fill="none" stroke="#3b82f6" strokeWidth="3" 
                                  strokeDasharray={2 * Math.PI * 18}
                                  strokeDashoffset={2 * Math.PI * 18 * (1 - pct / 100)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-white">{pct}%</span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">Tech Pioneer</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">Read 3 Tech/AI books ({techBooks}/3)</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Challenge 2 */}
                      {(() => {
                        const pct = stats.completedCount > 0 ? 100 : 0;
                        return (
                          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="relative w-11 h-11 shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle cx="22" cy="22" r="18" fill="none" stroke="#0ea5e9" strokeWidth="3" 
                                  strokeDasharray={2 * Math.PI * 18}
                                  strokeDashoffset={2 * Math.PI * 18 * (1 - pct / 100)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-white">{pct}%</span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">Deep Finisher</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">Complete 1 book in your collection ({stats.completedCount}/1)</p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Challenge 3 */}
                      {(() => {
                        const pct = Math.min(100, Math.round((stats.notesCount / 5) * 100));
                        return (
                          <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                            <div className="relative w-11 h-11 shrink-0">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                <circle cx="22" cy="22" r="18" fill="none" stroke="#14b8a6" strokeWidth="3" 
                                  strokeDasharray={2 * Math.PI * 18}
                                  strokeDashoffset={2 * Math.PI * 18 * (1 - pct / 100)}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-extrabold text-white">{pct}%</span>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">Active Annotator</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">Write 5 study notes ({stats.notesCount}/5)</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <SentimentWidget />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

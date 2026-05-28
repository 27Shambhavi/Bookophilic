import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import StatsCard from '../../components/Dashboard/StatsCard';
import CoachingWidget from '../../components/AIWidgets/CoachingWidget';
import SentimentWidget from '../../components/AIWidgets/SentimentWidget';
import WisdomGraph from '../../components/Dashboard/WisdomGraph';
import { Book, CheckCircle, FileText, Brain, Loader2, Calendar, Trophy, User, Sparkles, Search, ExternalLink } from 'lucide-react';
import bookService from '../../services/bookService';
import noteService from '../../services/noteService';
import aiService from '../../services/aiService';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

import mentorService from '../../services/mentor_service';

const CURATED_BOOKS = [
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    genre: "Science",
    summary: "Stephen Hawking's landmark popular science book about cosmology, black holes, space-time, the Big Bang, and quantum gravity.",
    cover: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/A_Brief_History_of_Time"
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    genre: "Science",
    summary: "Carl Sagan's masterpiece tracing the history of science and human civilization, cosmic evolution, and our place in the universe.",
    cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/Cosmos_(Sagan_book)"
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fiction",
    summary: "Follows the quest of home-loving hobbit Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon.",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/The_Hobbit"
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Fiction",
    summary: "A chilling dystopian novel about Oceania, a society ruled by the omnipresent Big Brother, exploring truth, surveillance, and freedom.",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/Nineteen_Eighty-Four"
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "Non-Fiction",
    summary: "Explores the history of humankind from the evolution of archaic human species in the Stone Age up to the twenty-first century.",
    cover: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/Sapiens:_A_Brief_History_of_Humankind"
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Non-Fiction",
    summary: "Detailing two systems that drive the way we think—System 1 (fast, emotional) and System 2 (slow, logical).",
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/Thinking,_Fast_and_Slow"
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    genre: "Biography",
    summary: "The authorized biography of Apple co-founder Steve Jobs, based on hundreds of interviews detailing his revolutionary career.",
    cover: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/Steve_Jobs_(book)"
  },
  {
    title: "Elon Musk",
    author: "Walter Isaacson",
    genre: "Biography",
    summary: "An intimate biography of the visionary builder of Tesla, SpaceX, and OpenAI, detailing his drive and chaotic personality.",
    cover: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/Elon_Musk_(book)"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-help",
    summary: "James Clear explains how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    cover: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/Atomic_Habits"
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Self-help",
    summary: "Cal Newport outlines the discipline of deep focus to produce high-value output and thrive in a distracted, hyper-connected economy.",
    cover: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/Deep_Work"
  },
  {
    title: "The Power of Now",
    author: "Eckhart Tolle",
    genre: "Spirituality",
    summary: "A guide to spiritual enlightenment, showing how letting go of the ego and embracing the present moment can transform your life.",
    cover: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/The_Power_of_Now"
  },
  {
    title: "The Untethered Soul",
    author: "Michael A. Singer",
    genre: "Spirituality",
    summary: "Explores the path of self-discovery, showing how to rise above limiting thoughts, habits, and energy patterns to find deep peace.",
    cover: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=250",
    wikiUrl: "https://en.wikipedia.org/wiki/The_Untethered_Soul"
  }
];

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

  const [currentUser, setCurrentUser] = useState(null);
  const [dbGenres, setDbGenres] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedOnboardingGenres, setSelectedOnboardingGenres] = useState([]);
  
  // Curated explorer states
  const [curatedSearch, setCuratedSearch] = useState('');
  const [selectedCuratedGenre, setSelectedCuratedGenre] = useState('for_you');

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        const user = await authService.getMe();
        setCurrentUser(user);
        
        const genresList = await bookService.getGenres();
        setDbGenres(genresList);

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

        // Show onboarding modal if preferred_genres is empty
        if (!user.preferences || !user.preferences.preferred_genres || user.preferences.preferred_genres.trim() === '') {
          setShowOnboarding(true);
        }
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

                  {/* Curated Books Explorer */}
                  <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-6 bg-gradient-to-br from-slate-900/60 to-slate-950/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" /> Curated Reading Catalog
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Explore classic textbooks and masterworks. Tap to study on Wikipedia or shelf to library.
                        </p>
                      </div>

                      {/* Search Bar inside Curated Explorer */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search curated books..."
                          className="w-full bg-slate-950 border border-white/5 focus:border-primary-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                          value={curatedSearch}
                          onChange={(e) => setCuratedSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Genre Tabs */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedCuratedGenre('for_you')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedCuratedGenre === 'for_you'
                            ? 'bg-violet-500/20 border border-violet-500 text-white shadow-sm'
                            : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                        }`}
                      >
                        ✨ For You ({
                          (() => {
                            const userPrefGenres = currentUser?.preferences?.preferred_genres
                              ? currentUser.preferences.preferred_genres.split(',').map(g => g.trim().toLowerCase())
                              : [];
                            return CURATED_BOOKS.filter(b => 
                              userPrefGenres.includes(b.genre.toLowerCase())
                            ).length;
                          })()
                        })
                      </button>
                      {['Science', 'Fiction', 'Non-Fiction', 'Biography', 'Self-help', 'Spirituality'].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setSelectedCuratedGenre(g)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                            selectedCuratedGenre === g
                              ? 'bg-primary-500/20 border border-primary-500 text-white shadow-sm'
                              : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                          }`}
                        >
                          {g === 'Self-help' ? '💡 Self Help' : g === 'Spirituality' ? '🧘 Spiritual' : g}
                        </button>
                      ))}
                    </div>

                    {/* Curated Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
                      {(() => {
                        const userPrefGenres = currentUser?.preferences?.preferred_genres
                          ? currentUser.preferences.preferred_genres.split(',').map(g => g.trim().toLowerCase())
                          : [];

                        // Filter by genre tab
                        let filtered = CURATED_BOOKS;
                        if (selectedCuratedGenre === 'for_you') {
                          if (userPrefGenres.length > 0) {
                            filtered = CURATED_BOOKS.filter(b => userPrefGenres.includes(b.genre.toLowerCase()));
                          } else {
                            // If no preferences, default to show all
                            filtered = CURATED_BOOKS;
                          }
                        } else {
                          filtered = CURATED_BOOKS.filter(b => b.genre.toLowerCase() === selectedCuratedGenre.toLowerCase());
                        }

                        // Filter by search query
                        if (curatedSearch.trim()) {
                          filtered = filtered.filter(b => 
                            b.title.toLowerCase().includes(curatedSearch.toLowerCase()) ||
                            b.author.toLowerCase().includes(curatedSearch.toLowerCase())
                          );
                        }

                        if (filtered.length === 0) {
                          return (
                            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-medium">
                              {selectedCuratedGenre === 'for_you' && userPrefGenres.length === 0 ? (
                                <div className="space-y-3">
                                  <p>Select your favorite genres in settings or onboarding to see personalized recommendations here!</p>
                                  <button
                                    type="button"
                                    onClick={() => setShowOnboarding(true)}
                                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all cursor-pointer"
                                  >
                                    Select Interests
                                  </button>
                                </div>
                              ) : (
                                "No curated books found matching your query."
                              )}
                            </div>
                          );
                        }

                        return filtered.map((curBook) => {
                          const isAlreadyAdded = books.some(b => b.title.toLowerCase().trim() === curBook.title.toLowerCase().trim());
                          return (
                            <div 
                              key={curBook.title}
                              className="bg-slate-950/50 border border-white/5 hover:border-white/10 p-4 rounded-2xl flex gap-4 transition-all duration-300 group shadow-sm relative overflow-hidden"
                            >
                              {/* Book Cover */}
                              <div className="w-16 h-24 rounded-lg overflow-hidden bg-slate-900 shadow shrink-0 relative">
                                <img 
                                  src={curBook.cover} 
                                  alt={curBook.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-slate-950/80 border border-white/10 text-[7px] text-slate-300 font-bold uppercase tracking-wider scale-90">
                                  {curBook.genre}
                                </span>
                              </div>

                              {/* Details */}
                              <div className="flex-1 flex flex-col justify-between overflow-hidden font-sans">
                                <div className="space-y-1">
                                  <h4 className="text-xs font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                                    {curBook.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-400 truncate font-semibold">by {curBook.author}</p>
                                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed mt-1 font-medium">
                                    {curBook.summary}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-white/5 mt-2">
                                  <a 
                                    href={curBook.wikiUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-bold text-slate-300 hover:text-white transition-all cursor-pointer shrink-0"
                                  >
                                    Wikipedia <ExternalLink className="w-2.5 h-2.5" />
                                  </a>

                                  <button
                                    type="button"
                                    disabled={isAlreadyAdded}
                                    onClick={async () => {
                                      try {
                                        // Find genre ID
                                        let genreObj = dbGenres.find(g => g.name.toLowerCase() === curBook.genre.toLowerCase());
                                        let matchedGenreId = genreObj ? genreObj.id : null;
                                        
                                        // If not matched directly, check if we can create or map
                                        if (!matchedGenreId) {
                                          try {
                                            const newGenre = await bookService.createGenre(curBook.genre);
                                            matchedGenreId = newGenre.id;
                                            setDbGenres(prev => [...prev, newGenre]);
                                          } catch (genreErr) {
                                            console.warn("Could not match or create genre", genreErr);
                                          }
                                        }

                                        const payload = {
                                          title: curBook.title,
                                          author: curBook.author,
                                          description: curBook.summary,
                                          page_count: 350,
                                          current_page: 0,
                                          status: 'want_to_read',
                                          genre_id: matchedGenreId,
                                          subcategory: null,
                                          cover_image_url: curBook.cover
                                        };

                                        const newBook = await bookService.createBook(payload);
                                        const updatedBooks = [newBook, ...books];
                                        setBooks(updatedBooks);
                                        
                                        // Update stats
                                        setStats(prev => ({
                                          ...prev,
                                          booksCount: updatedBooks.length
                                        }));

                                        alert(`"${curBook.title}" successfully added to your library bookshelf!`);
                                      } catch (err) {
                                        console.error("Failed to add book", err);
                                        alert("Failed to add book to library.");
                                      }
                                    }}
                                    className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer text-center ${
                                      isAlreadyAdded 
                                        ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400 cursor-default opacity-85'
                                        : 'bg-primary-500 hover:bg-primary-600 text-white font-bold'
                                    }`}
                                  >
                                    {isAlreadyAdded ? 'In Library ✓' : 'Add to Library'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

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

      {/* Onboarding Interest Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn select-none font-sans">
          {/* Modal Backdrop */}
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-slate-950/95 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl z-10 space-y-6">
            <div className="absolute inset-0 rounded-[2.5rem] bg-violet-600/5 blur-3xl pointer-events-none" />

            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-2">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                Personalize Your Study Room
              </h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Select your preferred reading domains to custom-tailor your AI insights, book matches, and daily reflections.
              </p>
            </div>

            {/* Grid of Interests */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/5">
              {[
                { name: 'Science', label: '🧪 Scientific', desc: 'Cosmology, Physics' },
                { name: 'Fiction', label: '🎭 Fiction', desc: 'Fantasy, Novels' },
                { name: 'Non-Fiction', label: '📚 Non-Fiction', desc: 'Sapiens, Truths' },
                { name: 'Biography', label: '👤 Biography', desc: 'Steve Jobs, Memoirs' },
                { name: 'Self-help', label: '💡 Self Help', desc: 'Habits, Productivity' },
                { name: 'Spirituality', label: '🧘 Spiritual', desc: 'Mindfulness, Zen' },
                { name: 'History', label: '🏛️ History', desc: 'Civilizations, War' },
                { name: 'Psychology', label: '🧠 Psychology', desc: 'Mind, Human Behavior' },
                { name: 'Business', label: '💼 Business', desc: 'Startups, Leadership' },
                { name: 'Tech', label: '💻 Tech & AI', desc: 'Algorithms, Coding' },
                { name: 'Philosophy', label: '📜 Philosophy', desc: 'Stoicism, Logic' },
                { name: 'Mystery/Thriller', label: '🔍 Mystery', desc: 'Suspense, Thrillers' },
                { name: 'Poetry/Drama', label: '✍️ Poetry', desc: 'Verses, Plays' },
                { name: 'Health/Wellness', label: '🍀 Health', desc: 'Fitness, Nutrition' },
              ].map((genre) => {
                const isSelected = selectedOnboardingGenres.includes(genre.name);
                return (
                  <button
                    key={genre.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedOnboardingGenres(selectedOnboardingGenres.filter(g => g !== genre.name));
                      } else {
                        setSelectedOnboardingGenres([...selectedOnboardingGenres, genre.name]);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'bg-violet-500/15 border-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-[1.02]'
                        : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span className="block text-sm font-bold">{genre.label}</span>
                    <span className="text-[10px] text-slate-500 mt-1">{genre.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowOnboarding(false)}
                className="flex-1 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-bold text-sm text-center cursor-pointer transition-all active:scale-98"
              >
                Skip / Set Later
              </button>
              <button
                type="button"
                disabled={selectedOnboardingGenres.length === 0}
                onClick={async () => {
                  try {
                    const updatedPrefs = await authService.updatePreferences({
                      preferred_genres: selectedOnboardingGenres.join(','),
                    });
                    if (currentUser) {
                      setCurrentUser({
                        ...currentUser,
                        preferences: updatedPrefs,
                      });
                    }
                    setShowOnboarding(false);
                    alert("Interests saved successfully! Recommendations updated.");
                  } catch (err) {
                    console.error("Failed to update preferences", err);
                    alert("Failed to save preferences.");
                  }
                }}
                className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-sm shadow-glass-glow disabled:opacity-50 transition-all cursor-pointer active:scale-98"
              >
                Confirm Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

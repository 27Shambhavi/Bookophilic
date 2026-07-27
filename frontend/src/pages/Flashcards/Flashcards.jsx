import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import FlashcardCard from '../../components/Flashcards/FlashcardCard';
import { Brain, Award, Loader2, Sparkles, Plus, BookOpen, Undo } from 'lucide-react';
import aiService from '../../services/aiService';
import bookService from '../../services/bookService';
import noteService from '../../services/noteService';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Flashcards() {
  const navigate = useNavigate();
  const [allCards, setAllCards] = useState([]);
  const [dueCards, setDueCards] = useState([]);
  const [cardsToReview, setCardsToReview] = useState([]);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seedCount, setSeedCount] = useState(3);
  const [stats, setStats] = useState({
    total_cards: 0,
    due_cards: 0,
    reviewed_today: 0,
    total_reviewed: 0
  });

  const loadFlashcards = async () => {
    try {
      const [allData, dueData, statsData] = await Promise.all([
        aiService.getFlashcards(),
        aiService.getDueFlashcards(),
        aiService.getFlashcardStats()
      ]);
      setAllCards(allData);
      setDueCards(dueData);
      setStats(statsData);
      
      if (isPracticeMode) {
        setCardsToReview(allData);
      } else {
        setCardsToReview(dueData);
      }
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to load flashcards", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }
    loadFlashcards();
  }, [navigate]);

  const handleScoreCard = async (cardId, rating) => {
    try {
      // Submit SM-2 rating review to backend
      await aiService.submitReview(cardId, rating);
      
      // Instantly update stats locally
      setStats(prev => ({
        ...prev,
        reviewed_today: prev.reviewed_today + 1,
        total_reviewed: prev.total_reviewed + (rating >= 3 ? 1 : 0),
        due_cards: Math.max(0, prev.due_cards - 1)
      }));
      
      if (currentIndex + 1 >= cardsToReview.length) {
        // Reload all data when finishing the session
        const [allData, dueData, statsData] = await Promise.all([
          aiService.getFlashcards(),
          aiService.getDueFlashcards(),
          aiService.getFlashcardStats()
        ]);
        setAllCards(allData);
        setDueCards(dueData);
        setStats(statsData);
      }
      
      // Advance to next card in the array
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error("Failed to log recall rating", err);
    }
  };

  const handleQuickSeed = async () => {
    setSeeding(true);
    try {
      // 1. Get user's books
      let books = [];
      try {
        books = await bookService.getBooks();
      } catch (err) {
        console.error("Failed to fetch books", err);
      }

      let bookId;
      let textContent = "";
      
      if (books && books.length > 0) {
        // Use the first available book
        const book = books[0];
        bookId = book.id;
        
        // Fetch notes for this book to make it relevant to notes
        try {
          const notesList = await noteService.getBookNotes(bookId);
          if (notesList && notesList.length > 0) {
            textContent = notesList.map(n => n.content).join("\n");
          }
        } catch (nErr) {
          console.error("Failed to fetch notes", nErr);
        }
        
        // Fallback to description if no notes
        if (!textContent.trim()) {
          textContent = book.description || `A book titled ${book.title} by ${book.author}.`;
        }
      } else {
        // No books found! Create default book first
        let genreId = null;
        try {
          const genres = await bookService.getGenres();
          if (genres && genres.length > 0) {
            genreId = genres[0].id;
          }
        } catch (gErr) {
          console.error("Failed to fetch genres", gErr);
        }

        const defaultBook = await bookService.createBook({
          title: "Learning How to Learn",
          author: "Barbara Oakley",
          description: "A guide on active recall, spaced repetition, and mental models to accelerate cognitive performance.",
          page_count: 250,
          current_page: 25,
          status: "reading",
          genre_id: genreId,
          subcategory: "mindset"
        });
        bookId = defaultBook.id;
        textContent = defaultBook.description;
      }

      // 2. Call AI generate endpoint using the text content
      await aiService.generateFlashcards(bookId, textContent, seedCount);

      alert("Successfully generated NLP/AI study flashcards based on your library context!");
      // Reload flashcards
      await loadFlashcards();
    } catch (err) {
      console.error("Seeding failed", err);
      alert("Failed to generate flashcards. Please check if the backend is running.");
    } finally {
      setSeeding(false);
    }
  };

  const startPracticeMode = () => {
    setIsPracticeMode(true);
    setCardsToReview(allCards);
    setCurrentIndex(0);
  };

  const startSM2Mode = () => {
    setIsPracticeMode(false);
    setCardsToReview(dueCards);
    setCurrentIndex(0);
  };

  const currentCard = cardsToReview[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Brain className="w-8 h-8 text-pink-500 animate-pulse" /> Spaced Repetition Study Room
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Revise key concepts, vocabulary, and formulas using the cognitive SM-2 memory optimizer.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
                <p className="text-slate-400 font-medium">Loading revision cards...</p>
              </div>
            ) : seeding ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-slate-400 font-medium">Seeding study cards and default textbook...</p>
              </div>
            ) : currentCard ? (
              <div className="space-y-6 max-w-lg mx-auto w-full">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-widest px-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    {isPracticeMode ? "Practice Mode (All Cards)" : "SM-2 Recall Mode"}
                  </span>
                  <span>{currentIndex + 1} of {cardsToReview.length}</span>
                </div>
                
                <FlashcardCard 
                  card={currentCard} 
                  onScore={handleScoreCard} 
                />

                {isPracticeMode && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={startSM2Mode}
                      className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/5 flex items-center gap-1.5 transition-all"
                    >
                      <Undo className="w-3.5 h-3.5" /> Return to SM-2 due list
                    </button>
                  </div>
                )}
              </div>
            ) : allCards.length > 0 ? (
              <div className="glass-panel border border-white/5 rounded-3xl p-12 text-center max-w-md mx-auto space-y-6 shadow-glass-glow animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center mx-auto text-white shadow-lg">
                  <Award className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">All caught up!</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    You have reviewed all flashcards currently due for active recall. Check back later as dates progress, or practice ahead with study mode!
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={startPracticeMode}
                    className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-glass-glow transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" /> Practice Mode (Study All Cards)
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={loadFlashcards}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 font-semibold text-sm transition-all"
                    >
                      Refresh Review List
                    </button>
                    <button 
                      onClick={() => navigate('/')}
                      className="flex-1 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-glass-glow transition-all"
                    >
                      Back to Library
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel border border-white/5 rounded-3xl p-12 text-center max-w-md mx-auto space-y-6 shadow-glass-glow animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center mx-auto text-white shadow-lg animate-bounce">
                  <Brain className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">No study cards found!</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Generate revision cards automatically from your textbook pages, or quick-seed a default study deck to start using the SM-2 optimizer.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <select
                      className="bg-slate-900 border border-white/5 focus:border-emerald-500 rounded-xl px-2.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                      value={seedCount}
                      onChange={(e) => setSeedCount(parseInt(e.target.value))}
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n} Cards</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleQuickSeed}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-glass-glow transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Quick Seed
                    </button>
                  </div>
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 font-semibold text-sm transition-all"
                  >
                    Go to Library
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Active stats bar */}
          {!loading && !seeding && (
            <div className="glass-panel rounded-2xl p-4 border border-white/5 flex justify-around text-center max-w-2xl mx-auto w-full text-sm shadow-glass-glow animate-fadeIn">
              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Library Cards</span>
                <span className="text-white font-extrabold text-sm">{stats.total_cards}</span>
              </div>
              <div className="border-l border-white/5"></div>
              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Due for Review</span>
                <span className="text-primary-400 font-extrabold text-sm">{stats.due_cards}</span>
              </div>
              <div className="border-l border-white/5"></div>
              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Reviewed Today</span>
                <span className="text-emerald-400 font-extrabold text-sm">{stats.reviewed_today}</span>
              </div>
              <div className="border-l border-white/5"></div>
              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Reviews</span>
                <span className="text-teal-400 font-extrabold text-sm">{stats.total_reviewed}</span>
              </div>
              <div className="border-l border-white/5"></div>
              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Mode</span>
                <span className="text-pink-400 font-extrabold text-xs flex items-center gap-1 justify-center mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" style={{ animationDuration: '3s' }} /> {isPracticeMode ? "Practice" : "SM-2"}
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

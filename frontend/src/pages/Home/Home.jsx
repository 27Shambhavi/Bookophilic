import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Search, Loader2, Star } from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import BookCard from '../../components/BookCard/BookCard';
import QuoteWidget from '../../components/Quotes/QuoteWidget';
import bookService from '../../services/bookService';
import authService from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLibraryTab, setActiveLibraryTab] = useState('all'); // all, professional, academic

  const handleToggleLifeChanging = (bookId, isLifeChanging) => {
    setBooks(prevBooks => 
      prevBooks.map(b => b.id === bookId ? { ...b, is_life_changing: isLifeChanging } : b)
    );
  };

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [desc, setDesc] = useState('');
  const [pages, setPages] = useState(300);
  const [genreId, setGenreId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [cover, setCover] = useState('');

  const GENRE_SUBCATEGORIES = {
    "Self-help": ["productivity", "mindset", "discipline"],
    "Psychology": ["behavior", "habits", "emotions"],
    "Finance": ["investing", "money mindset"],
    "Philosophy": ["stoicism", "existentialism"],
    "Fiction": ["fantasy", "thriller", "romance"],
    "Business": ["leadership", "startups"],
    "Spirituality": ["mindfulness", "meditation"],
    "Science": ["physics", "biology"],
    "Tech": ["AI", "programming"],
    "History": ["war", "civilization"]
  };

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const booksList = await bookService.getBooks();
        setBooks(booksList);
        const genresList = await bookService.getGenres();
        setGenres(genresList);
      } catch (err) {
        console.error("Failed to load catalog", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!title || !author) return;

    try {
      const payload = {
        title,
        author,
        description: desc,
        page_count: parseInt(pages),
        current_page: 0,
        status: 'want_to_read',
        genre_id: genreId ? parseInt(genreId) : null,
        subcategory: subcategory || null,
        cover_image_url: cover || null
      };

      const newBook = await bookService.createBook(payload);
      setBooks([newBook, ...books]);
      setTitle('');
      setAuthor('');
      setDesc('');
      setPages(300);
      setGenreId('');
      setSubcategory('');
      setCover('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeLibraryTab === 'professional') {
      return ["Self-help", "Finance", "Business", "Philosophy", "Spirituality"].includes(b.genre?.name);
    }
    if (activeLibraryTab === 'academic') {
      return ["Science", "Tech", "History", "Psychology", "Fiction"].includes(b.genre?.name);
    }
    return true;
  });

  const getImportantPoints = (book) => {
    if (book.description && book.description.trim().length > 10) {
      const sentences = book.description.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 8);
      if (sentences.length > 0) {
        return sentences.slice(0, 3).map(s => s + ".");
      }
    }
    const genre = book.genre?.name || '';
    if (["Self-help", "Business", "Finance", "Philosophy", "Spirituality"].includes(genre)) {
      return [
        "Develop high-leverage mental models for strategic decisions.",
        "Apply deliberate practice to build compounding habits daily.",
        "Focus on actions within your immediate locus of control."
      ];
    } else {
      return [
        "Analyze core empirical theories and system design patterns.",
        "Build clean structured equations or semantic definitions.",
        "Log study annotations to optimize retention and recall."
      ];
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <BookOpen className="w-8 h-8 text-primary-500" /> My Library
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage your collection and log reading sessions.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-glass-glow transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Book
            </button>
          </div>

          <QuoteWidget />

          {/* Life-Changing Spotlight Carousel */}
          {books.filter(b => b.is_life_changing).length > 0 && (
            <div className="glass-panel rounded-2xl p-6 border border-primary-500/20 bg-gradient-to-r from-slate-950 via-primary-950/20 to-slate-950 shadow-[0_0_25px_-5px_rgba(59,130,246,0.2)] animate-fadeIn">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">Life-Changing Spotlight</h2>
                  <p className="text-slate-400 text-xs">Masterworks that redefined my mental frameworks and paradigms.</p>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {books.filter(b => b.is_life_changing).map((book) => (
                  <Link 
                    key={book.id}
                    to={`/book/${book.id}`}
                    className="flex-shrink-0 w-40 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary-500/30 rounded-xl p-3 transition-all duration-300 group hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
                  >
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-slate-900 shadow-md relative">
                      <img 
                        src={book.cover_image_url || `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200`} 
                        alt={book.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 p-1 rounded-full bg-slate-950/80 border border-white/10 z-10">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                    <h3 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-primary-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      {book.author}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Add Book Form Drawer */}
          {showAddForm && (
            <form onSubmit={handleAddBook} className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4 animate-fadeIn">
              <h3 className="text-lg font-bold text-white mb-2">New Book Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Book Title *</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500"
                    placeholder="e.g. Clean Code" value={title} onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Author *</label>
                  <input
                    type="text" required
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500"
                    placeholder="e.g. Robert C. Martin" value={author} onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Genre</label>
                  <select
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500"
                    value={genreId} 
                    onChange={(e) => {
                      setGenreId(e.target.value);
                      setSubcategory('');
                    }}
                  >
                    <option value="">Select Genre</option>
                    {genres.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Subcategory</label>
                  <select
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-primary-500 capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                    value={subcategory} 
                    onChange={(e) => setSubcategory(e.target.value)}
                    disabled={!genreId}
                  >
                    <option value="">Select Subcategory</option>
                    {(genres.find(g => g.id === parseInt(genreId))?.name && 
                      GENRE_SUBCATEGORIES[genres.find(g => g.id === parseInt(genreId)).name] || []
                    ).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Page Count</label>
                  <input
                    type="number"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-primary-500"
                    value={pages} onChange={(e) => setPages(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Cover Image URL</label>
                  <input
                    type="url"
                    className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500"
                    placeholder="https://..." value={cover} onChange={(e) => setCover(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Synopsis / Description</label>
                  <textarea
                    className="w-full h-24 bg-slate-900 border border-white/5 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-primary-500"
                    placeholder="Summarize the premise..." value={desc} onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
                <button
                  type="button" onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5 font-semibold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-glass-glow transition-all"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          )}

          {/* Search bar & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="relative w-full max-w-md">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search bookshelf..."
                className="w-full bg-slate-900/50 border border-white/5 focus:border-primary-500 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-100 focus:outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setActiveLibraryTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLibraryTab === 'all'
                    ? 'bg-primary-500 text-white shadow-glass-glow'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                All ({books.length})
              </button>
              <button
                onClick={() => setActiveLibraryTab('professional')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLibraryTab === 'professional'
                    ? 'bg-primary-500 text-white shadow-glass-glow'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                Professional Shelf 💼 ({books.filter(b => ["Self-help", "Finance", "Business", "Philosophy", "Spirituality"].includes(b.genre?.name)).length})
              </button>
              <button
                onClick={() => setActiveLibraryTab('academic')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLibraryTab === 'academic'
                    ? 'bg-primary-500 text-white shadow-glass-glow'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/5'
                }`}
              >
                Academic Desk 🎓 ({books.filter(b => ["Science", "Tech", "History", "Psychology", "Fiction"].includes(b.genre?.name)).length})
              </button>
            </div>
          </div>

          {/* Catalog content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-slate-400 font-medium">Fetching catalog details...</p>
            </div>
          ) : filteredBooks.length > 0 ? (
            activeLibraryTab === 'all' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard key={book.id} book={book} onToggleLifeChanging={handleToggleLifeChanging} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBooks.map((book) => {
                  const points = getImportantPoints(book);
                  return (
                    <div key={book.id} className="glass-panel rounded-3xl p-5 border border-white/5 bg-gradient-to-br from-slate-900/40 to-slate-950/60 hover:border-primary-500/20 transition-all flex flex-col md:flex-row gap-5 items-start shadow-glass group">
                      <div className="flex gap-4 items-center shrink-0 w-full md:w-60">
                        <div className="w-14 h-18 rounded-lg overflow-hidden bg-slate-900 relative shadow shrink-0">
                          <img 
                            src={book.cover_image_url || `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200`} 
                            alt={book.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <h3 className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors truncate">
                            {book.title}
                          </h3>
                          <p className="text-slate-400 text-xs truncate">by {book.author}</p>
                          <div className="flex flex-wrap gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-slate-300 font-bold uppercase">
                              {book.genre?.name}
                            </span>
                            {book.subcategory && (
                              <span className="px-1.5 py-0.5 rounded bg-primary-500/10 border border-primary-500/20 text-[9px] text-primary-400 font-bold capitalize">
                                {book.subcategory}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5 border-t md:border-t-0 md:border-l border-white/5 pt-3 md:pt-0 md:pl-5 w-full">
                        <span className="text-[9px] font-extrabold text-teal-400 uppercase tracking-widest block">
                          Important Points & Study Focus:
                        </span>
                        <ul className="space-y-1">
                          {points.map((p, idx) => (
                            <li key={idx} className="text-xs text-slate-300 leading-relaxed flex items-start gap-1.5">
                              <span className="text-teal-400 shrink-0">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="shrink-0 w-full md:w-auto self-end md:self-center">
                        <Link 
                          to={`/book/${book.id}`}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-primary-500 hover:text-white border border-white/5 hover:border-primary-500 transition-all text-center text-xs font-bold text-slate-300 block"
                        >
                          Study Desk
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 max-w-md mx-auto">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">No books shelved here</h3>
              <p className="text-slate-400 text-sm mb-6">
                Start adding books or change search query to find your reads.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

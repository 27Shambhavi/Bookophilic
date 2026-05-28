import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import ThemeWidget from '../../components/AIWidgets/ThemeWidget';
import { 
  FileText, Loader2, BookOpen, Trash2, Sparkles, Search, Plus, 
  Download, LayoutList, Calendar, Trophy, Tag, ChevronDown, Brain, ExternalLink, Mic 
} from 'lucide-react';
import noteService from '../../services/noteService';
import bookService from '../../services/bookService';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const parseNoteContent = (content) => {
  const highlightRegex = /^💡 Highlight:\s*(.*)$/m;
  const thoughtRegex = /^📝 Thought:\s*(.*)$/m;
  const categoryRegex = /^🏷️ Category:\s*(.*)$/m;
  const colorRegex = /^🎨 Color:\s*(.*)$/m;

  const highlightMatch = content.match(highlightRegex);
  const thoughtMatch = content.match(thoughtRegex);
  const categoryMatch = content.match(categoryRegex);
  const colorMatch = content.match(colorRegex);

  if (highlightMatch || thoughtMatch) {
    return {
      isStructured: true,
      highlight: highlightMatch ? highlightMatch[1].replace(/^"|"$/g, '') : '',
      thought: thoughtMatch ? thoughtMatch[1] : '',
      category: categoryMatch ? categoryMatch[1] : 'Learnings',
      color: colorMatch ? colorMatch[1] : 'yellow'
    };
  }

  return {
    isStructured: false,
    highlight: '',
    thought: content,
    category: 'Learnings',
    color: 'yellow'
  };
};

const COLOR_MAP = {
  yellow: { border: 'border-l-4 border-l-amber-400', bg: 'bg-amber-500/5', text: 'text-amber-400', bgHover: 'hover:bg-amber-500/10' },
  blue: { border: 'border-l-4 border-l-cyan-400', bg: 'bg-cyan-500/5', text: 'text-cyan-400', bgHover: 'hover:bg-cyan-500/10' },
  green: { border: 'border-l-4 border-l-emerald-400', bg: 'bg-emerald-500/5', text: 'text-emerald-400', bgHover: 'hover:bg-emerald-500/10' },
  pink: { border: 'border-l-4 border-l-pink-400', bg: 'bg-pink-500/5', text: 'text-pink-400', bgHover: 'hover:bg-pink-500/10' }
};

const CATEGORIES = [
  'all', 'Quotes', 'Learnings', 'Ideas', 'Action Items', 'Vocabulary', 'Personal Reflections'
];

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);

  // Layout & Filtering states
  const [selectedView, setSelectedView] = useState('list'); // list or timeline
  const [searchQuery, setSearchQuery] = useState('');
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [semanticSearching, setSemanticSearching] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Quick Add states
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [qaHighlight, setQaHighlight] = useState('');
  const [qaThought, setQaThought] = useState('');
  const [qaBookId, setQaBookId] = useState('');
  const [qaCategory, setQaCategory] = useState('Learnings');
  const [qaColor, setQaColor] = useState('yellow');
  const [qaPage, setQaPage] = useState('');

  // Daily Wisdom / Flashback state
  const [dailyLearning, setDailyLearning] = useState(null);
  const [flashbackLearning, setFlashbackLearning] = useState(null);

  // AI tools state
  const [aiToolResults, setAiToolResults] = useState({});

  const loadNotesData = async () => {
    try {
      const notesList = await noteService.getNotes();
      const bList = await bookService.getBooks();
      setBooksList(bList);
      
      const bookMap = {};
      bList.forEach(b => {
        bookMap[b.id] = b.title;
      });
      setBooks(bookMap);
      setNotes(notesList);

      // Select Daily Learning & Flashback note
      if (notesList.length > 0) {
        // Daily note is a random note
        const randomIdx = Math.floor(Math.random() * notesList.length);
        setDailyLearning(notesList[randomIdx]);

        // Flashback note is the oldest note
        setFlashbackLearning(notesList[notesList.length - 1]);
      }
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
    loadNotesData();
  }, [navigate]);

  const handleDeleteNote = async (id) => {
    if (window.confirm("Are you sure you want to delete this annotation?")) {
      try {
        await noteService.deleteNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
        if (dailyLearning?.id === id) setDailyLearning(null);
        if (flashbackLearning?.id === id) setFlashbackLearning(null);
      } catch (err) {
        console.error(err);
        alert("Failed to delete annotation. Try again.");
      }
    }
  };

  const handleQuickAddNote = async (e) => {
    e.preventDefault();
    if (!qaBookId) {
      alert("Please select a book first!");
      return;
    }
    if (!qaThought.trim() && !qaHighlight.trim()) {
      alert("Please enter a quote or thought!");
      return;
    }

    try {
      let finalContent = "";
      if (qaHighlight.trim()) {
        finalContent += `💡 Highlight: "${qaHighlight.trim()}"\n`;
      }
      if (qaThought.trim()) {
        finalContent += `📝 Thought: ${qaThought.trim()}\n`;
      }
      finalContent += `🏷️ Category: ${qaCategory}\n🎨 Color: ${qaColor}`;

      const pageVal = qaPage ? parseInt(qaPage) : null;
      const created = await noteService.createNote(parseInt(qaBookId), finalContent, pageVal);
      
      setNotes(prev => [created, ...prev]);
      setQaHighlight('');
      setQaThought('');
      setQaBookId('');
      setQaCategory('Learnings');
      setQaColor('yellow');
      setQaPage('');
      setQuickAddOpen(false);
      alert("Insight captured successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to capture insight.");
    }
  };

  // AI Card Actions
  const handleTriggerAICardAction = async (noteId, content, actionType) => {
    setAiToolResults(prev => ({
      ...prev,
      [noteId]: { loading: true, type: actionType, content: '' }
    }));

    try {
      let res;
      if (actionType === 'summary') {
        res = await noteService.getSingleSummary(content);
        res = res.summary;
      } else if (actionType === 'mcq') {
        res = await noteService.getQuiz(content);
        res = res.quiz;
      } else {
        res = await noteService.getActionPoints(content);
        res = res.action_points;
      }

      setAiToolResults(prev => ({
        ...prev,
        [noteId]: { loading: false, type: actionType, content: res }
      }));
    } catch (err) {
      console.error(err);
      setAiToolResults(prev => ({
        ...prev,
        [noteId]: { loading: false, type: actionType, content: 'AI was unable to compute insights. Make sure backend is running.' }
      }));
    }
  };

  // Semantic Search Execution
  const executeSearch = async () => {
    if (isSemanticSearch) {
      if (!searchQuery.trim()) {
        loadNotesData();
        return;
      }
      setSemanticSearching(true);
      try {
        const matches = await noteService.semanticSearch(searchQuery);
        setNotes(matches);
      } catch (err) {
        console.error("Semantic search failed", err);
      } finally {
        setSemanticSearching(false);
      }
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      executeSearch();
    }, 600);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, isSemanticSearch]);

  // Export Markdowns
  const handleExportMarkdown = () => {
    if (notes.length === 0) {
      alert("No notes available to export!");
      return;
    }

    let mdText = "# Bookophilic Captured Study Insights\n\n";
    notes.forEach(note => {
      const bookTitle = books[note.book_id] || "Unknown Book";
      const parsed = parseNoteContent(note.content);
      mdText += `## ${bookTitle} (${note.page_number ? 'Page ' + note.page_number : 'General Log'})\n`;
      mdText += `*Date: ${new Date(note.created_at).toLocaleDateString()}*  \n`;
      mdText += `*Category: ${parsed.category}*  \n\n`;
      if (parsed.highlight) {
        mdText += `> "${parsed.highlight}"\n\n`;
      }
      mdText += `${parsed.thought}\n\n---\n\n`;
    });

    const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Bookophilic_Study_Insights.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Client-side local filtering for keyword search & categories
  const filteredNotes = notes.filter(note => {
    const parsed = parseNoteContent(note.content);
    
    // Category check
    if (activeCategoryFilter !== 'all' && parsed.category.toLowerCase() !== activeCategoryFilter.toLowerCase()) {
      return false;
    }

    // If semantic search is active, it handles sorting and querying on the backend!
    if (isSemanticSearch) {
      return true;
    }

    // Keyword search
    const bookTitle = (books[note.book_id] || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      note.content.toLowerCase().includes(query) ||
      bookTitle.includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh flex flex-col font-sans select-none">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full relative">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <FileText className="w-8 h-8 text-teal-400" /> Annotations Desk
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Read, sort, and execute AI actions on notes captured during your study room hours.
              </p>
            </div>

            {/* Export & View Controls */}
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                title="Export notes as Markdown"
              >
                <Download className="w-4 h-4 text-indigo-400" /> Export Markdown
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                title="Print annotations as PDF"
              >
                🖨️ Export PDF
              </button>

              <div className="flex rounded-xl bg-slate-900 border border-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedView('list')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedView === 'list' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" /> List
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedView('timeline')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedView === 'timeline' ? 'bg-primary-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Timeline
                </button>
              </div>
            </div>
          </div>

          {/* Flashback & Daily Learning Banner */}
          {!loading && notes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Daily Learning */}
              {dailyLearning && (
                <div className="glass-panel rounded-2xl p-5 border border-primary-500/20 bg-gradient-to-r from-slate-950 via-primary-950/10 to-slate-950 shadow-md flex gap-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0 h-10 w-10 flex items-center justify-center select-none">
                    ⭐
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Favorite Learning of the Day</span>
                    <h4 className="text-xs font-extrabold text-white mt-1">
                      From: {books[dailyLearning.book_id] || "Your Library"}
                    </h4>
                    {(() => {
                      const parsed = parseNoteContent(dailyLearning.content);
                      return (
                        <div className="mt-2 text-xs text-slate-300 leading-relaxed font-medium">
                          {parsed.highlight && <p className="italic text-slate-400 border-l border-white/5 pl-2 py-0.5 mb-1 text-[11px]">"{parsed.highlight}"</p>}
                          <p>{parsed.thought}</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Flashback */}
              {flashbackLearning && (
                <div className="glass-panel rounded-2xl p-5 border border-violet-500/20 bg-gradient-to-r from-slate-950 via-violet-950/10 to-slate-950 shadow-md flex gap-4">
                  <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 shrink-0 h-10 w-10 flex items-center justify-center select-none animate-pulse">
                    ⏳
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">Learning Flashback</span>
                    <h4 className="text-xs font-extrabold text-white mt-1">
                      From: {books[flashbackLearning.book_id] || "Your Library"}
                    </h4>
                    {(() => {
                      const parsed = parseNoteContent(flashbackLearning.content);
                      // Calculate days ago
                      const diffTime = Math.abs(new Date() - new Date(flashbackLearning.created_at));
                      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                      return (
                        <div className="mt-2 text-xs text-slate-300 leading-relaxed font-medium">
                          {parsed.highlight && <p className="italic text-slate-400 border-l border-white/5 pl-2 py-0.5 mb-1 text-[11px]">"{parsed.highlight}"</p>}
                          <p>{parsed.thought}</p>
                          <span className="text-[9px] text-violet-400 font-bold block mt-2">Saved {diffDays} days ago — Revisit this learning!</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notes List Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Search & Category Filter bar */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Search Bar */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
                    <input
                      type="text"
                      placeholder={isSemanticSearch ? "Ask AI e.g. 'notes about habits'..." : "Search key words or book titles..."}
                      className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSemanticSearch(!isSemanticSearch);
                      setSearchQuery('');
                      loadNotesData();
                    }}
                    className={`px-4 py-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isSemanticSearch 
                        ? 'bg-violet-500/20 border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.2)]'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                    title="Toggle vector-based smart search"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSemanticSearch ? 'text-violet-400' : 'text-slate-500'}`} />
                    <span>AI Semantic Search</span>
                  </button>
                </div>

                {/* Category filters */}
                <div className="flex flex-wrap gap-2 select-none">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                        activeCategoryFilter === cat
                          ? 'bg-teal-500/20 border border-teal-500 text-white shadow-sm'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'All categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes List Rendering */}
              {loading || semanticSearching ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                  <p className="text-slate-400 font-medium">
                    {semanticSearching ? "Consulting vector database..." : "Fetching annotation entries..."}
                  </p>
                </div>
              ) : filteredNotes.length > 0 ? (
                
                selectedView === 'list' ? (
                  // List Card View
                  <div className="space-y-4 font-sans">
                    {filteredNotes.map((note) => {
                      const parsed = parseNoteContent(note.content);
                      const col = COLOR_MAP[parsed.color] || COLOR_MAP.yellow;
                      const aiResult = aiToolResults[note.id];

                      return (
                        <div 
                          key={note.id} 
                          className={`glass-panel border border-white/5 ${col.border} ${col.bg} rounded-2xl p-5 hover:border-white/10 transition-all duration-300 relative group space-y-3`}
                        >
                          <div className="flex justify-between items-start text-xs font-semibold text-slate-500 pr-8 select-none">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider font-extrabold ${col.text}`}>
                                {parsed.category}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-400">
                                <BookOpen className="w-3.5 h-3.5" /> {books[note.book_id] || "Unknown Book"}
                              </span>
                            </div>
                            <span>
                              {note.page_number ? `Page ${note.page_number}` : 'General Annotation'} • {new Date(note.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Highlight / Quote Block */}
                          {parsed.highlight && (
                            <blockquote className="border-l border-white/10 pl-3.5 italic text-slate-400 text-xs my-1 bg-white/[0.01] py-1 rounded">
                              "{parsed.highlight}"
                            </blockquote>
                          )}

                          <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium pr-6">
                            {parsed.thought}
                          </p>

                          {/* AI Tool result box */}
                          {aiResult && (
                            <div className="bg-slate-955/60 border border-white/5 rounded-xl p-4 mt-3 space-y-2 animate-fadeIn relative">
                              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block select-none">
                                {aiResult.type === 'mcq' ? '🧠 Active Recall MCQs' : aiResult.type === 'summary' ? '💡 AI Condensed wisdom' : '🎯 AI Actionable Takeaways'}
                              </span>
                              {aiResult.loading ? (
                                <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                  AI thinking...
                                </div>
                              ) : (
                                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                                  {aiResult.content}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setAiToolResults(prev => {
                                    const c = { ...prev };
                                    delete c[note.id];
                                    return c;
                                  });
                                }}
                                className="absolute top-2 right-2 text-slate-500 hover:text-slate-300 text-xs font-bold cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* Footer Action Triggers */}
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 text-[9px] font-bold text-slate-400 select-none">
                            <button
                              type="button"
                              onClick={() => handleTriggerAICardAction(note.id, parsed.thought, 'summary')}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 hover:text-white transition-all cursor-pointer"
                            >
                              💡 AI Summary
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTriggerAICardAction(note.id, parsed.thought, 'mcq')}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/20 hover:text-white transition-all cursor-pointer"
                            >
                              🧠 AI MCQ Quiz
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTriggerAICardAction(note.id, parsed.thought, 'action_points')}
                              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/20 hover:text-white transition-all cursor-pointer"
                            >
                              🎯 Action Points
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-red-500/20"
                            title="Delete Annotation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Timeline Journey View
                  <div className="relative pl-6 border-l border-white/10 space-y-8 select-none">
                    {filteredNotes.map((note) => {
                      const parsed = parseNoteContent(note.content);
                      const col = COLOR_MAP[parsed.color] || COLOR_MAP.yellow;
                      const aiResult = aiToolResults[note.id];

                      return (
                        <div key={note.id} className="relative group animate-fadeIn">
                          {/* Timeline node dot */}
                          <div className={`absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700 group-hover:border-primary-400 transition-all shadow-[0_0_8px_rgba(0,0,0,0.8)]`} />
                          
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>

                          <div className={`glass-panel border border-white/5 ${col.border} ${col.bg} rounded-2xl p-5 hover:border-white/10 transition-all duration-300 relative space-y-3`}>
                            <div className="flex justify-between items-start text-xs font-semibold text-slate-500 pr-8">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider font-extrabold ${col.text}`}>
                                  {parsed.category}
                                </span>
                                <span className="flex items-center gap-1.5 text-slate-400">
                                  <BookOpen className="w-3.5 h-3.5" /> {books[note.book_id] || "Unknown Book"}
                                </span>
                              </div>
                              <span>{note.page_number ? `Page ${note.page_number}` : 'General Log'}</span>
                            </div>

                            {parsed.highlight && (
                              <blockquote className="border-l border-white/10 pl-3 italic text-slate-400 text-xs my-1 bg-white/[0.01] py-1 rounded">
                                "{parsed.highlight}"
                              </blockquote>
                            )}

                            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium pr-6">
                              {parsed.thought}
                            </p>

                            {/* AI Tool result box */}
                            {aiResult && (
                              <div className="bg-slate-950/60 border border-white/5 rounded-xl p-4 mt-3 space-y-2 animate-fadeIn relative">
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block">
                                  {aiResult.type === 'mcq' ? '🧠 Active Recall MCQs' : aiResult.type === 'summary' ? '💡 AI Condensed wisdom' : '🎯 AI Actionable Takeaways'}
                                </span>
                                {aiResult.loading ? (
                                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                                    AI thinking...
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                                    {aiResult.content}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/5 text-[9px] font-bold text-slate-400">
                              <button
                                type="button"
                                onClick={() => handleTriggerAICardAction(note.id, parsed.thought, 'summary')}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 hover:text-white transition-all cursor-pointer"
                              >
                                💡 AI Summary
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTriggerAICardAction(note.id, parsed.thought, 'mcq')}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-violet-500/10 border border-white/5 hover:border-violet-500/20 hover:text-white transition-all cursor-pointer"
                              >
                                🧠 AI MCQ Quiz
                              </button>
                              <button
                                type="button"
                                onClick={() => handleTriggerAICardAction(note.id, parsed.thought, 'action_points')}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-teal-500/10 border border-white/5 hover:border-teal-500/20 hover:text-white transition-all cursor-pointer"
                              >
                                🎯 Action Points
                              </button>
                            </div>

                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-red-500/20"
                              title="Delete Annotation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )

              ) : (
                /* Better Empty State */
                <div className="glass-panel rounded-3xl p-12 text-center border border-white/5 max-w-md mx-auto space-y-5 animate-fadeIn select-none font-sans">
                  <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mx-auto text-3xl shadow-sm">
                    💡
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">Your best ideas from books live here</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Start saving quotes, thoughts, and reflections to create your private library study logs and customized active recall flashcards.
                    </p>
                  </div>
                  <button
                    onClick={() => setQuickAddOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-glass-glow transition-all cursor-pointer"
                  >
                    Capture First Insight
                  </button>
                </div>
              )}
            </div>

            {/* AI Assistant Tools Sidebar */}
            <div className="space-y-6">
              <ThemeWidget />
            </div>
          </div>

          {/* Quick Add FAB Persistent Floating Action Button */}
          <button
            type="button"
            onClick={() => setQuickAddOpen(true)}
            className="fixed bottom-8 right-8 z-[80] w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center shadow-2xl hover:shadow-[0_0_20px_rgba(37,99,235,0.6)] cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Quick Capture Insight"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Quick Add Insight Modal Overlay */}
          {quickAddOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn select-none font-sans">
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setQuickAddOpen(false)} />
              
              <div className="relative w-full max-w-xl bg-slate-950/95 border border-white/10 p-7 rounded-[2rem] shadow-2xl z-10 space-y-5">
                <div className="absolute inset-0 rounded-[2rem] bg-violet-600/5 blur-2xl pointer-events-none" />

                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-400" /> Quick Capture Insight
                  </h3>
                  <button
                    onClick={() => setQuickAddOpen(false)}
                    className="text-slate-400 hover:text-white transition-all text-sm font-extrabold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleQuickAddNote} className="space-y-4">
                  {/* Select Book */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Book Shelf Link *</label>
                    <select
                      required
                      className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                      value={qaBookId}
                      onChange={(e) => setQaBookId(e.target.value)}
                    >
                      <option value="">Select Book</option>
                      {booksList.map(b => (
                        <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                      ))}
                    </select>
                  </div>

                  {/* Highlight */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Highlighted Quote / Passage</label>
                    <input
                      type="text"
                      className="w-full bg-slate-900/50 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none"
                      placeholder="e.g. 'Consistency matters more than intensity.'..."
                      value={qaHighlight}
                      onChange={(e) => setQaHighlight(e.target.value)}
                    />
                  </div>

                  {/* Thought */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">My Thought / Reflection</label>
                    <textarea
                      className="w-full h-16 bg-slate-900/50 border border-white/5 focus:border-primary-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all resize-none"
                      placeholder="e.g. 'Study DSA 1 hour daily instead of 10 hours once.'..."
                      value={qaThought}
                      onChange={(e) => setQaThought(e.target.value)}
                    />
                  </div>

                  {/* Metadata fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Category</label>
                      <select
                        className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                        value={qaCategory}
                        onChange={(e) => setQaCategory(e.target.value)}
                      >
                        <option value="Learnings">💡 Learning</option>
                        <option value="Quotes">💬 Quote</option>
                        <option value="Ideas">⚡ Idea</option>
                        <option value="Action Items">🎯 Action Item</option>
                        <option value="Vocabulary">📖 Vocabulary</option>
                        <option value="Personal Reflections">🧘 Reflection</option>
                      </select>
                    </div>

                    {/* Color */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Highlight Color</label>
                      <div className="flex items-center gap-2 h-[34px]">
                        {[
                          { name: 'yellow', color: 'bg-amber-400' },
                          { name: 'blue', color: 'bg-cyan-400' },
                          { name: 'green', color: 'bg-emerald-400' },
                          { name: 'pink', color: 'bg-pink-400' }
                        ].map(item => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setQaColor(item.name)}
                            className={`w-5 h-5 rounded-full ${item.color} transition-all relative cursor-pointer active:scale-90 ${
                              qaColor === item.name ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110' : 'opacity-70 hover:opacity-100'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Page */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Page Number</label>
                      <input
                        type="number"
                        placeholder="Page (Optional)"
                        className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                        value={qaPage}
                        onChange={(e) => setQaPage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setQuickAddOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 font-semibold text-xs transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!qaBookId || (!qaThought.trim() && !qaHighlight.trim())}
                      className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs shadow-glass-glow transition-all cursor-pointer"
                    >
                      Capture Insight
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

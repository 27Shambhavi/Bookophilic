import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, BookOpen, FileText, Brain, Edit2, Play, Square, Sparkles, 
  Plus, Loader2, Save, Trash2, HelpCircle, Mic, Volume2, Image, MessageSquare, Users, Pause, X, Trophy, ArrowRight
} from 'lucide-react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import bookService from '../../services/bookService';
import noteService from '../../services/noteService';
import aiService from '../../services/aiService';
import authService from '../../services/authService';
import mentorService from '../../services/mentor_service';

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
  yellow: { border: 'border-l-4 border-l-amber-400', bg: 'bg-amber-500/5', text: 'text-amber-400' },
  blue: { border: 'border-l-4 border-l-cyan-400', bg: 'bg-cyan-500/5', text: 'text-cyan-400' },
  green: { border: 'border-l-4 border-l-emerald-400', bg: 'bg-emerald-500/5', text: 'text-emerald-400' },
  pink: { border: 'border-l-4 border-l-pink-400', bg: 'bg-pink-500/5', text: 'text-pink-400' }
};

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookId = parseInt(id);

  const [book, setBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [editProgress, setEditProgress] = useState(false);
  const [progressPage, setProgressPage] = useState(0);
  const [newNote, setNewNote] = useState('');
  const [notePage, setNotePage] = useState('');
  
  // New structured note states
  const [noteHighlight, setNoteHighlight] = useState('');
  const [noteThought, setNoteThought] = useState('');
  const [noteColor, setNoteColor] = useState('yellow');
  const [noteCategory, setNoteCategory] = useState('Learnings');
  
  // AI triggers states
  const [summaryLoading, setSummaryLoading] = useState(false);
  
  const [aiReflections, setAiReflections] = useState('');
  const [reflectionsLoading, setReflectionsLoading] = useState(false);
  
  const [generateText, setGenerateText] = useState('');
  // PDF states
  const [pdfLoading, setPdfLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');

  // Book QA & Debate Chat states
  const [bookChatInput, setBookChatInput] = useState('');
  const [bookChatHistory, setBookChatHistory] = useState([
    { role: 'assistant', content: "Welcome to the Book Debate Room! You can ask specific questions about pages in this book, or debate any concepts you disagree with. I will verify references from your uploaded PDF text and notes!" }
  ]);
  const [bookChatLoading, setBookChatLoading] = useState(false);
  const [pdfGeneratingCards, setPdfGeneratingCards] = useState(false);

  // Reading Tracker state
  const [activeSession, setActiveSession] = useState(null);
  const [sessionPages, setSessionPages] = useState(0);
  const [sessionNotesCount, setSessionNotesCount] = useState(0);

  // Advanced features state
  const [activeMentor, setActiveMentor] = useState(mentorService.getMentor());
  const [activeTab, setActiveTab] = useState('notes'); // notes, debate, community
  
  // Audiobook state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(1);
  const [audioPitch, setAudioPitch] = useState(1);

  // Speech Recognition state
  const [isRecording, setIsRecording] = useState(false);

  // OCR state
  const [ocrScanning, setOcrScanning] = useState(false);

  // AI Debate Arena state
  const [debateText, setDebateText] = useState('');
  const [debateHistory, setDebateHistory] = useState([
    { role: 'opponent', content: "Welcome to the Debate Arena. State your thesis about this book, and I shall examine its logical structure." }
  ]);
  const [debateLoading, setDebateLoading] = useState(false);

  // Community discussions state
  const [communityText, setCommunityText] = useState('');
  const [communityComments, setCommunityComments] = useState([]);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Audio player SpeechSynthesis Speech functions
  const handlePlayAudio = () => {
    if (isPausedAudio) {
      window.speechSynthesis.resume();
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
      return;
    }
    
    window.speechSynthesis.cancel();
    const textToRead = book.description || `${book.title} by ${book.author}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    const mConfig = mentorService.getMentorConfig(activeMentor);
    utterance.rate = audioSpeed * mConfig.rate;
    utterance.pitch = audioPitch * mConfig.pitch;
    
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handlePauseAudio = () => {
    window.speechSynthesis.pause();
    setIsPlayingAudio(false);
    setIsPausedAudio(true);
  };

  const handleStopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };

  // Speech to Text microphone dictate function
  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition API is not supported in this browser. Try Chrome or Edge!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewNote(prev => prev + (prev ? " " : "") + transcript);
    };

    recognition.start();
  };

  // OCR scan simulation
  const handleOcrScan = () => {
    setOcrScanning(true);
    setTimeout(() => {
      let scanResult = "This is a simulated scanned section. Active recall is the cognitive science principle that memory retrieval strengthens neural connections, boosting long-term knowledge retention.";
      const titleLower = book.title.toLowerCase();
      if (titleLower.includes("habit")) {
        scanResult = "The Habit Loop is a neurological loop that governs any habit. It consists of three elements: a cue, a routine, and a reward. Understanding these elements is essential to behavior modification.";
      } else if (titleLower.includes("meditation")) {
        scanResult = "You have power over your mind - not outside events. Realize this, and you will find strength. The happiness of your life depends upon the quality of your thoughts.";
      } else if (titleLower.includes("superintelligence")) {
        scanResult = "Superintelligence is any intellect that greatly exceeds the cognitive performance of humans in virtually all domains of interest. The control problem asks how we can align such intellects with human survival.";
      }
      
      setGenerateText(scanResult);
      setOcrScanning(false);
      alert("OCR scanning complete! Scanned paragraph inserted into flashcard textbox.");
    }, 2000);
  };

  // AI debate challenge function
  const handleDebateSubmit = (e) => {
    e.preventDefault();
    if (!debateText.trim()) return;

    const userArg = debateText;
    setDebateHistory(prev => [...prev, { role: 'user', content: userArg }]);
    setDebateText('');
    setDebateLoading(true);

    setTimeout(() => {
      let reply = "";
      if (activeMentor === 'Socrates') {
        reply = `Interesting thesis. But consider: if we accept your premise, does it not imply a contradiction in our definition of the good? How do you reconcile your view with the concept of absolute justice?`;
      } else if (activeMentor === 'Marcus Aurelius') {
        reply = `Consider the nature of what you assert. Remember that the happiness of your life depends upon the quality of your thoughts. Is this argument aligned with virtue and reason, or is it a reaction to things you cannot control?`;
      } else if (activeMentor === 'Steve Jobs') {
        reply = `That statement is okay, but it lacks focus. It's too complex. Simple can be harder than complex: you have to work hard to get your thinking clean to make it simple. How does this disrupt the status quo?`;
      } else {
        reply = `A fascinating formulation! It reminds me of the space-time equivalence. However, physical experience shows that variables are not independent. Have you tested this hypothesis against empirical reality?`;
      }

      setDebateHistory(prev => [...prev, { role: 'opponent', content: reply }]);
      setDebateLoading(false);
    }, 1500);
  };

  useEffect(() => {
    const handleMentorChange = () => {
      setActiveMentor(mentorService.getMentor());
    };
    window.addEventListener('mentor_changed', handleMentorChange);
    return () => window.removeEventListener('mentor_changed', handleMentorChange);
  }, []);

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }

        const loadData = async () => {
      try {
        const b = await bookService.getBook(bookId);
        setBook(b);
        setProgressPage(b.current_page);
        
        const n = await noteService.getBookNotes(bookId);
        setNotes(n);
        
        const f = await aiService.getBookFlashcards(bookId);
        setFlashcards(f);

        const c = await bookService.getComments(bookId);
        setCommunityComments(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bookId, navigate]);

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    try {
      const page = parseInt(progressPage);
      const updated = await bookService.updateBook(bookId, { current_page: page });
      setBook(updated);
      setEditProgress(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!communityText.trim()) return;
    try {
      const created = await bookService.createComment(bookId, communityText);
      setCommunityComments(prev => [created, ...prev]);
      setCommunityText('');
    } catch (err) {
      console.error(err);
      alert("Failed to submit comment. Try again!");
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.pdf')) {
      alert("Please upload a PDF file only!");
      return;
    }

    setPdfLoading(true);
    try {
      const res = await aiService.uploadBookPdf(bookId, file);
      // Set PDF summary
      setAiSummary(res.summary);
      setBook(prev => prev ? { ...prev, has_pdf: true } : null);
      // Reload book notes to show new PDF summary note
      const updatedNotes = await noteService.getBookNotes(bookId);
      setNotes(updatedNotes);
      alert(`PDF successfully parsed! Summary Note created and indexed in your vector store RAG.`);
    } catch (err) {
      console.error("PDF upload failed", err);
      alert("Failed to process PDF. Make sure it's under 5MB.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleBookChatSubmit = async (e) => {
    e.preventDefault();
    if (!bookChatInput.trim()) return;

    const userMsg = bookChatInput.trim();
    setBookChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setBookChatInput('');
    setBookChatLoading(true);

    try {
      const res = await aiService.queryRag(userMsg, bookId);
      setBookChatHistory(prev => [...prev, { role: 'assistant', content: res.answer }]);
    } catch (err) {
      console.error("Book chat failed", err);
      setBookChatHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I could not query this book's index. Make sure the backend is active." }]);
    } finally {
      setBookChatLoading(false);
    }
  };

  const handleGenerateFromPdf = async () => {
    setPdfGeneratingCards(true);
    try {
      const cards = await aiService.generateFlashcardsFromPdf(bookId, flashcardCount);
      setFlashcards(prev => [...cards, ...prev]);
      alert(`Successfully generated ${cards.length} flashcards from this book's PDF chunks!`);
    } catch (err) {
      console.error("PDF flashcard generation failed", err);
      alert("Failed to generate cards from PDF. Ensure PDF is uploaded first.");
    } finally {
      setPdfGeneratingCards(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteThought.trim() && !noteHighlight.trim()) return;

    try {
      const page = notePage ? parseInt(notePage) : null;
      
      let finalContent = "";
      if (noteHighlight.trim()) {
        finalContent += `💡 Highlight: "${noteHighlight.trim()}"\n`;
      }
      if (noteThought.trim()) {
        finalContent += `📝 Thought: ${noteThought.trim()}\n`;
      }
      finalContent += `🏷️ Category: ${noteCategory}\n🎨 Color: ${noteColor}`;

      const created = await noteService.createNote(bookId, finalContent, page);
      setNotes([created, ...notes]);
      setNoteHighlight('');
      setNoteThought('');
      setNotePage('');
      setNoteColor('yellow');
      setNoteCategory('Learnings');
      if (activeSession) {
        setSessionNotesCount(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSummary = async () => {
    setSummaryLoading(true);
    setAiSummary('');
    try {
      const data = await noteService.summarizeNotes(bookId);
      setAiSummary(data.summary);
    } catch (err) {
      console.error(err);
      setAiSummary("Failed to generate AI summary from notes. Add notes first!");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleTriggerReflections = async () => {
    setReflectionsLoading(true);
    setAiReflections('');
    try {
      const data = await noteService.generateReflections(bookId);
      setAiReflections(data.reflections);
    } catch (err) {
      console.error(err);
      setAiReflections("Failed to trigger reflections. Save notes to get questions.");
    } finally {
      setReflectionsLoading(false);
    }
  };

  const handleGenerateCards = async (e) => {
    e.preventDefault();
    if (!generateText.trim()) return;

    setCardsLoading(true);
    try {
      const cards = await aiService.generateFlashcards(bookId, generateText, flashcardCount);
      setFlashcards([...cards, ...flashcards]);
      setGenerateText('');
      alert(`Successfully generated ${cards.length} AI study flashcards!`);
    } catch (err) {
      console.error(err);
    } finally {
      setCardsLoading(false);
    }
  };

  // Reading Tracker Controls
  const handleStartSession = async () => {
    try {
      const s = await aiService.startReadingSession(bookId);
      setActiveSession(s);
      setSessionPages(0);
      setSessionNotesCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    try {
      await aiService.endReadingSession(
        activeSession.session_id, 
        parseInt(sessionPages), 
        sessionNotesCount
      );
      // Reload book details to get updated progress
      const b = await bookService.getBook(bookId);
      setBook(b);
      setProgressPage(b.current_page);
      setActiveSession(null);
      alert("Reading session logged! Your progress has been updated.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBook = async () => {
    if (window.confirm("Are you sure you want to delete this book? This will erase all matching notes and flashcards.")) {
      try {
        await bookService.deleteBook(bookId);
        navigate('/');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this annotation?")) {
      try {
        await noteService.deleteNote(noteId);
        setNotes(prev => prev.filter(n => n.id !== noteId));
      } catch (err) {
        console.error(err);
        alert("Failed to delete annotation. Try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 text-center max-w-md mx-auto">
          <p className="text-slate-400 font-semibold mb-4">Book not found.</p>
          <Link to="/" className="text-primary-400 underline">Back to Library</Link>
        </div>
      </div>
    );
  }

  const getGenreClass = (genreName) => {
    if (!genreName) return 'genre-default';
    return `genre-${genreName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const genreName = book.genre?.name || '';
  const genreClass = getGenreClass(genreName);
  const progressPercent = book.page_count > 0 ? Math.round((book.current_page / book.page_count) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Back button & Delete */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to Library
            </Link>
            <button 
              onClick={handleDeleteBook}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Book
            </button>
          </div>

          {/* Book Header Profile */}
          <div className={`glass-panel rounded-3xl p-6 md:p-8 border genre-card ${genreClass} flex flex-col md:flex-row gap-8`}>
            <div className="w-full md:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-slate-900 shrink-0">
              <img 
                src={book.cover_image_url || `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200`} 
                alt={book.title} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{book.title}</h1>
                <p className="text-slate-400 text-base font-medium mt-1">by {book.author}</p>
                {genreName && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="genre-badge px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider uppercase">
                      {genreName}
                    </span>
                    {book.subcategory && (
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 capitalize">
                        {book.subcategory}
                      </span>
                    )}
                  </div>
                )}
                {book.description && (
                  <p className="text-slate-400 text-sm mt-4 leading-relaxed line-clamp-3">{book.description}</p>
                )}
              </div>

              {/* Progress and Timer section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                {/* Progress Tracking */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-300">
                    <span>Reading Progress</span>
                    <button 
                      onClick={() => setEditProgress(!editProgress)}
                      className="text-primary-400 hover:text-primary-300 flex items-center gap-1 text-xs"
                    >
                      <Edit2 className="w-3 h-3" /> Update Page
                    </button>
                  </div>

                  {editProgress ? (
                    <form onSubmit={handleUpdateProgress} className="flex gap-2 items-center">
                      <input
                        type="number"
                        className="w-24 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-sm text-slate-100 focus:outline-none"
                        value={progressPage}
                        onChange={(e) => setProgressPage(e.target.value)}
                      />
                      <span className="text-slate-500">/ {book.page_count}</span>
                      <button type="submit" className="p-1.5 bg-teal-500 hover:bg-teal-600 rounded-lg text-white">
                        <Save className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Page {book.current_page} of {book.page_count}</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${progressPercent}%`,
                            backgroundColor: 'var(--genre-color)',
                            boxShadow: `0 0 10px rgba(var(--genre-color-rgb), 0.6)`
                          }}
                        ></div>
                      </div>
                      {progressPercent === 100 && (
                        <div className="text-[11px] font-bold text-teal-400 animate-bounce mt-1 flex items-center gap-1">
                          🎉 Complete! Master of this text!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Session Tracker */}
                <div className="space-y-2">
                  <span className="text-sm font-bold text-slate-300 block">Session Tracker</span>
                  {activeSession ? (
                    <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-3.5 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-primary-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span> Active Reading Session
                        </span>
                        <span>Notes Taken: {sessionNotesCount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          placeholder="Pages read"
                          className="w-28 bg-slate-900 border border-white/5 focus:border-primary-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-100"
                          value={sessionPages}
                          onChange={(e) => setSessionPages(e.target.value)}
                        />
                        <button
                          onClick={handleEndSession}
                          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all"
                        >
                          <Square className="w-3.5 h-3.5" /> Stop Logging
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartSession}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-glass-glow transition-all"
                    >
                      <Play className="w-4 h-4 fill-current" /> Start Reading Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Tabs & Sidebar details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scan {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}} />

            {/* Left Column: Tabbed Panels */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <div className="flex flex-wrap border-b border-white/10 gap-x-6 gap-y-2">
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3.5 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                    activeTab === 'notes' ? 'text-teal-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Study Logs
                  {activeTab === 'notes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-400 rounded-full"></span>}
                </button>
                <button
                  onClick={() => setActiveTab('debate')}
                  className={`pb-3.5 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                    activeTab === 'debate' ? 'text-primary-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> AI Debate Arena
                  {activeTab === 'debate' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-400 rounded-full"></span>}
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`pb-3.5 text-sm font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
                    activeTab === 'community' ? 'text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" /> Community Hub
                  {activeTab === 'community' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full"></span>}
                </button>
              </div>

              {/* Render Active Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  {/* Progress Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/5 p-4 rounded-2xl select-none font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Insight Pioneer</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">You have captured {notes.length} key insights from this book!</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">{notes.length} total annotations</span>
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider select-none">Capture New Insight</h4>
                    
                    {/* Highlight input */}
                    <div className="space-y-1.5 relative">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide select-none">Highlighted Quote / Passage</label>
                      <input
                        type="text"
                        className="w-full bg-slate-900/50 border border-white/5 focus:border-primary-500 rounded-xl pl-4 pr-12 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                        placeholder="Paste or type book quote here (e.g. 'Discipline beats motivation.')..."
                        value={noteHighlight}
                        onChange={(e) => setNoteHighlight(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={startSpeechRecognition}
                        className={`absolute right-2.5 top-[21px] p-1.5 rounded-lg transition-all cursor-pointer ${
                          isRecording ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'bg-white/5 text-slate-500 hover:text-slate-200 border border-white/5 hover:bg-white/10'
                        }`}
                        title={isRecording ? "Recording... Speak!" : "Dictate (Speech-to-Text)"}
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thought input */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide select-none">My Thought / Reflection</label>
                      <textarea
                        className="w-full h-20 bg-slate-900/50 border border-white/5 focus:border-primary-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all resize-none"
                        placeholder="Add your own thought, task, or note (e.g. 'Need this for placements prep.')..."
                        value={noteThought}
                        onChange={(e) => setNoteThought(e.target.value)}
                      />
                    </div>

                    {/* Metadata: Category, Color, Page */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      {/* Category */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide select-none">Category</label>
                        <select
                          className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value)}
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
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide select-none">Highlight Color</label>
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
                              onClick={() => setNoteColor(item.name)}
                              className={`w-6 h-6 rounded-full ${item.color} transition-all relative cursor-pointer active:scale-90 ${
                                noteColor === item.name ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110' : 'opacity-70 hover:opacity-100'
                              }`}
                              title={item.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Page */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide select-none">Page Number</label>
                        <input
                          type="number"
                          placeholder="e.g. 42 (Optional)"
                          className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
                          value={notePage}
                          onChange={(e) => setNotePage(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-white/5">
                      <button
                        type="submit"
                        disabled={!noteThought.trim() && !noteHighlight.trim()}
                        className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-glass-glow transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Capture Insight
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
                    {notes.length > 0 ? (
                      notes.map((note) => {
                        const parsed = parseNoteContent(note.content);
                        const col = COLOR_MAP[parsed.color] || COLOR_MAP.yellow;
                        return (
                          <div key={note.id} className={`border border-white/5 ${col.border} ${col.bg} rounded-xl p-4 text-sm relative group hover:border-white/10 transition-all space-y-2`}>
                            <div className="flex justify-between items-start text-slate-400 font-semibold text-xs pr-8 select-none">
                              <div className="flex items-center gap-2">
                                <span className={`px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider font-extrabold ${col.text}`}>
                                  {parsed.category}
                                </span>
                                <span>{note.page_number ? `Page ${note.page_number}` : 'General Log'}</span>
                              </div>
                              <span>{new Date(note.created_at).toLocaleDateString()}</span>
                            </div>

                            {parsed.highlight && (
                              <blockquote className="border-l border-white/10 pl-3 italic text-slate-400 text-xs my-1 bg-white/[0.01] py-1 rounded">
                                "{parsed.highlight}"
                              </blockquote>
                            )}
                            
                            <p className="text-slate-200 leading-relaxed pr-8 whitespace-pre-line">
                              {parsed.thought}
                            </p>

                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-red-500/20"
                              title="Delete Annotation"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-500 text-sm text-center py-6">No annotations created yet. Type above or click mic to dictate one!</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'debate' && (
                <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">AI Debate Arena</h4>
                      <p className="text-slate-400 text-xs mt-0.5">Defend your thesis about this book. Opponent: <span className="text-primary-400 font-bold">{activeMentor}</span></p>
                    </div>
                  </div>

                  {/* Dialogue Window */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 p-3 bg-slate-900/40 rounded-xl border border-white/5 flex flex-col">
                    {debateHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col mb-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary-500/20 text-slate-200 border border-primary-500/20'
                            : 'bg-white/5 text-slate-300 border border-white/5'
                        }`}>
                          <div className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wide">
                            {msg.role === 'user' ? 'You' : `${activeMentor} (Opponent)`}
                          </div>
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {debateLoading && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 pl-1 font-semibold animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500" />
                        {activeMentor} is formulating a counterargument...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleDebateSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Submit thesis to ${activeMentor}...`}
                      className="flex-1 bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                      value={debateText}
                      onChange={(e) => setDebateText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={debateLoading || !debateText.trim()}
                      className="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-glass-glow transition-all cursor-pointer"
                    >
                      Refute
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'community' && (
                <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="pb-2 border-b border-white/5">
                    <h4 className="font-bold text-slate-200 text-sm">Community Hub</h4>
                    <p className="text-slate-400 text-xs mt-0.5">Read study reviews and exchange takeaways with other users.</p>
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {communityComments.length > 0 ? (
                      communityComments.map((comment) => (
                        <div key={comment.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-3 hover:border-white/10 transition-all animate-fadeIn">
                          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold select-none shrink-0 text-slate-300 uppercase">
                            {comment.user_name ? comment.user_name[0] : '👤'}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-200 text-xs">{comment.user_name || "Reader"}</span>
                              <span className="text-[9px] text-slate-500 font-semibold">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-300 text-xs leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs text-center py-6">No community logs recorded yet. Be the first to share your learning journey!</p>
                    )}
                  </div>

                  <form 
                    onSubmit={handleCommentSubmit}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Share a takeaway with the community..."
                      className="flex-1 bg-slate-900 border border-white/5 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                      value={communityText}
                      onChange={(e) => setCommunityText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!communityText.trim()}
                      className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Post Review
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* AI Assistant Column */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5.5 h-5.5 text-primary-400" /> AI Book Assistant
              </h3>

              {/* PDF RAG Upload Widget */}
              <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-3 bg-gradient-to-br from-slate-900/60 to-primary-950/20">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <FileText className="w-4.5 h-4.5 text-teal-400" />
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                    PDF Document RAG Indexer
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Upload a PDF version of this textbook to parse chapters, auto-generate recall notes, and expand your personalized RAG chatbot's retrieval scope.
                </p>

                {pdfLoading ? (
                  <div className="flex flex-col items-center justify-center py-4 gap-2 bg-slate-950/40 rounded-xl border border-white/5">
                    <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse text-center px-4">
                      Extracting Text & Generating Summary...
                    </span>
                  </div>
                ) : (
                  <div className="relative">
                    <input 
                      type="file"
                      id="pdf-upload-input"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <label 
                      htmlFor="pdf-upload-input"
                      className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all text-center text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-teal-400" /> Upload Book PDF (Max 5MB)
                    </label>
                  </div>
                )}
              </div>

              {/* Book QA & Debate Chat Room */}
              {book && (
                <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4 bg-gradient-to-br from-slate-900/60 to-primary-950/20">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                    <MessageSquare className="w-4.5 h-4.5 text-primary-400" />
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Book QA & Debate Room
                    </h4>
                  </div>
                  
                  {/* Chat logs */}
                  <div className="h-48 overflow-y-auto bg-slate-950/50 border border-white/5 rounded-xl p-3 space-y-3 text-xs scrollbar-thin scrollbar-thumb-white/5">
                    {bookChatHistory.map((msg, i) => (
                      <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${msg.role === 'user' ? 'text-primary-400' : 'text-teal-400'}`}>
                          {msg.role === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <div className={`max-w-[90%] rounded-xl px-3 py-2 text-slate-200 leading-relaxed ${
                          msg.role === 'user' ? 'bg-primary-500/20 border border-primary-500/35' : 'bg-white/5 border border-white/5'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {bookChatLoading && (
                      <div className="text-[10px] text-slate-500 animate-pulse flex items-center gap-1.5 pt-1 font-semibold">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-500" /> Embedding query & debating page content...
                      </div>
                    )}
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleBookChatSubmit} className="flex gap-2">
                    <input
                      type="text"
                      disabled={bookChatLoading}
                      className="flex-1 bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                      placeholder={book?.has_pdf ? "Ask or debate about this book..." : "Upload a PDF first to chat!"}
                      value={bookChatInput}
                      onChange={(e) => setBookChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={bookChatLoading || !bookChatInput.trim() || !book?.has_pdf}
                      className="px-3 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* AI Audiobook Player */}
              <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4 bg-gradient-to-br from-slate-900/60 to-primary-950/20">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Volume2 className="w-4.5 h-4.5 text-teal-400" />
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                    AI Audiobook Narration
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Listen to the description voiced with active mentor variables. Voice: <span className="text-teal-400 font-bold">{activeMentor}</span>
                </p>
                
                <div className="flex items-center justify-center gap-4 py-2 bg-slate-950/40 rounded-xl border border-white/5">
                  {isPlayingAudio ? (
                    <button
                      onClick={handlePauseAudio}
                      className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white cursor-pointer transition-all active:scale-95 shadow-sm"
                      title="Pause Narration"
                    >
                      <Pause className="w-4 h-4 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={handlePlayAudio}
                      className="p-2.5 rounded-full bg-teal-500 hover:bg-teal-600 text-white cursor-pointer transition-all active:scale-95 shadow-sm"
                      title="Play Narration"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  )}
                  <button
                    onClick={handleStopAudio}
                    className="p-2.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 cursor-pointer transition-all active:scale-95"
                    title="Stop Narration"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Rate (Speed)</span>
                      <span>{audioSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      className="w-full accent-teal-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      value={audioSpeed}
                      onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Pitch</span>
                      <span>{audioPitch}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.1"
                      className="w-full accent-teal-400 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      value={audioPitch}
                      onChange={(e) => setAudioPitch(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Generate Flashcards widget */}
              <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4.5 h-4.5 text-primary-400" />
                    <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Generate Flashcards
                    </h4>
                  </div>
                  <button
                    onClick={handleOcrScan}
                    disabled={ocrScanning}
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[10px] font-bold text-teal-400 hover:bg-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Image className="w-3 h-3" />
                    {ocrScanning ? "Scanning..." : "OCR Scan"}
                  </button>
                </div>
                
                {ocrScanning ? (
                  <div className="relative h-24 bg-slate-900 border border-teal-500/20 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-2">
                    <div className="absolute left-0 right-0 h-0.5 bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.8)]" style={{animation: 'scan 2s ease-in-out infinite'}}></div>
                    <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Running OCR Scan...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Paste key notes, or trigger the OCR Scan simulation above to extract textbook paragraphs automatically.
                    </p>
                    <form onSubmit={handleGenerateCards} className="space-y-3">
                      <textarea
                        className="w-full h-24 bg-slate-900/50 border border-white/5 focus:border-primary-500 rounded-xl p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all resize-none"
                        placeholder="Paste textbook chapter text here..."
                        value={generateText}
                        onChange={(e) => setGenerateText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <select
                          className="bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-2.5 py-2.5 text-xs text-slate-100 focus:outline-none"
                          value={flashcardCount}
                          onChange={(e) => setFlashcardCount(parseInt(e.target.value))}
                        >
                          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                            <option key={n} value={n}>{n} Cards</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={cardsLoading || !generateText.trim()}
                          className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glass-glow transition-all cursor-pointer"
                        >
                          {cardsLoading ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Structuring...
                            </>
                          ) : (
                            <>
                              <Brain className="w-3.5 h-3.5" /> Generate
                            </>
                          )}
                        </button>
                      </div>

                      {book?.has_pdf && (
                        <button
                          type="button"
                          onClick={handleGenerateFromPdf}
                          disabled={pdfGeneratingCards}
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glass-glow transition-all cursor-pointer mt-2"
                        >
                          {pdfGeneratingCards ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning Vector DB Chunks...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" /> Auto-Generate from PDF
                            </>
                          )}
                        </button>
                      )}
                    </form>
                  </>
                )}
              </div>

              {/* Summarize Notes widget */}
              <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                    AI Note Summarization
                  </h4>
                  <button 
                    onClick={handleTriggerSummary}
                    disabled={summaryLoading}
                    className="text-xs text-teal-400 font-bold hover:underline cursor-pointer"
                  >
                    {summaryLoading ? "Summarizing..." : "Generate Summary"}
                  </button>
                </div>

                {aiSummary ? (
                  <div className="text-xs text-slate-300 bg-white/5 border border-white/5 rounded-xl p-3 leading-relaxed whitespace-pre-line">
                    {aiSummary}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Compile all your reading notes into structured bullet points using the summarization agent.
                  </p>
                )}
              </div>

              {/* Reflective Questions widget */}
              <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                    Reflection Promoter
                  </h4>
                  <button 
                    onClick={handleTriggerReflections}
                    disabled={reflectionsLoading}
                    className="text-xs text-primary-400 font-bold hover:underline cursor-pointer"
                  >
                    {reflectionsLoading ? "Generating..." : "Get Questions"}
                  </button>
                </div>

                {aiReflections ? (
                  <div className="text-xs text-slate-300 bg-white/5 border border-white/5 rounded-xl p-3 leading-relaxed whitespace-pre-line">
                    {aiReflections}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Get custom deep-thinking questions customized exactly to the ideas written in your notes.
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

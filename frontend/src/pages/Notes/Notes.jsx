import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import ThemeWidget from '../../components/AIWidgets/ThemeWidget';
import { FileText, Loader2, BookOpen, Trash2 } from 'lucide-react';
import noteService from '../../services/noteService';
import bookService from '../../services/bookService';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }

    const loadNotesData = async () => {
      try {
        const notesList = await noteService.getNotes();
        const booksList = await bookService.getBooks();
        
        // Map book id -> title mapping
        const bookMap = {};
        booksList.forEach(b => {
          bookMap[b.id] = b.title;
        });
        
        setBooks(bookMap);
        setNotes(notesList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadNotesData();
  }, [navigate]);

  const handleDeleteNote = async (id) => {
    if (window.confirm("Are you sure you want to delete this annotation?")) {
      try {
        await noteService.deleteNote(id);
        setNotes(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        console.error(err);
        alert("Failed to delete annotation. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <FileText className="w-8 h-8 text-teal-400" /> Annotations Desk
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Read, sort, and analyze all highlights recorded during your reading sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Notes List Column */}
            <div className="lg:col-span-2 space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
                  <p className="text-slate-400 font-medium">Fetching annotation entries...</p>
                </div>
              ) : notes.length > 0 ? (
                notes.map((note) => (
                  <div key={note.id} className="glass-panel rounded-2xl p-5 border border-white/5 space-y-2 hover:border-teal-500/25 transition-all duration-300 relative group">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-500 pr-8">
                      <span className="flex items-center gap-1.5 text-teal-400">
                        <BookOpen className="w-3.5 h-3.5" /> {books[note.book_id] || "Unknown Book"}
                      </span>
                      <span>
                        {note.page_number ? `Page ${note.page_number}` : 'General Annotation'} • {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-medium">
                      "{note.content}"
                    </p>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="absolute top-4 right-4 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer border border-red-500/20"
                      title="Delete Annotation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="glass-panel rounded-2xl p-12 text-center border border-white/5 max-w-md mx-auto">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-1">No notes recorded yet</h3>
                  <p className="text-slate-400 text-sm">
                    Open a book details profile in your library, start a reading session, and log comments to write study logs.
                  </p>
                </div>
              )}
            </div>

            {/* AI Assistant Tools Sidebar */}
            <div className="space-y-6">
              <ThemeWidget />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

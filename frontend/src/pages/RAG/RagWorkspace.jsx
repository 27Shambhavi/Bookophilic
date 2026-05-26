import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Search, Loader2, Sparkles, MessageSquare, BookOpen, FileText, Brain, ArrowRight } from 'lucide-react';
import aiService from '../../services/aiService';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export default function RagWorkspace() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([
    {
      role: 'assistant',
      content: "Hello! Welcome to your Private RAG Workspace. Ask me questions about the books you've read, notes you've logged, or flashcards you've studied. I respond using ONLY your personal intellectual catalog.",
      sources: []
    }
  ]);

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setChats(prev => [...prev, { role: 'user', content: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await aiService.queryRag(userMsg);
      setChats(prev => [...prev, {
        role: 'assistant',
        content: res.answer,
        sources: res.sources || []
      }]);
    } catch (err) {
      console.error(err);
      setChats(prev => [...prev, {
        role: 'assistant',
        content: "I encountered an error querying your RAG database. Please make sure uvicorn backend is running.",
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (type) => {
    if (type.includes("Book")) return <BookOpen className="w-3.5 h-3.5 text-teal-400" />;
    if (type.includes("Note")) return <FileText className="w-3.5 h-3.5 text-amber-400" />;
    return <Brain className="w-3.5 h-3.5 text-pink-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-mesh flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chat Workspace */}
          <div className="lg:col-span-2 flex flex-col h-[calc(100vh-170px)] justify-between space-y-4">
            
            {/* Header */}
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Sparkles className="w-8 h-8 text-primary-500 animate-pulse-glow" /> Ask My Library (Personal RAG)
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Query details across your private catalog. Responses are synthesized from your books, notes, and study logs.
              </p>
            </div>

            {/* Chats Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-900/40 border border-white/5 rounded-3xl space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/5">
              {chats.map((chat, i) => (
                <div key={i} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'} space-y-2 animate-fadeIn`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                    chat.role === 'user'
                      ? 'bg-primary-500/20 text-slate-100 border border-primary-500/30'
                      : 'bg-white/5 text-slate-200 border border-white/5'
                  }`}>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      {chat.role === 'user' ? 'Your Query' : 'RAG Assistant'}
                    </div>
                    <p className="whitespace-pre-line">{chat.content}</p>
                  </div>

                  {/* Sources display */}
                  {chat.role === 'assistant' && chat.sources.length > 0 && (
                    <div className="pl-2 space-y-1.5 max-w-[85%] animate-fadeIn">
                      <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                        Retrieved Sources:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {chat.sources.map((src, sIdx) => (
                          <div 
                            key={sIdx} 
                            className="flex items-center gap-1.5 bg-slate-950/60 border border-white/5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-300"
                            title={src.content}
                          >
                            {getSourceIcon(src.type)}
                            <span>{src.title}</span>
                            <span className="text-teal-400/80 font-bold bg-teal-500/10 px-1 rounded">
                              {src.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pl-1 font-semibold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                  Embedding query & retrieving cognitive vectors...
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleQuerySubmit} className="flex gap-3 relative">
              <input
                type="text"
                disabled={loading}
                placeholder="Ask e.g. 'What books taught resilience?' or 'Show me stoicism concepts'..."
                className="flex-1 bg-slate-900 border border-white/5 focus:border-primary-500 rounded-2xl pl-5 pr-14 py-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-2 p-2 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white shadow-glass-glow transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* RAG Advantage Explainer */}
          <div className="space-y-6 lg:h-[calc(100vh-170px)] overflow-y-auto pr-2">
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" /> Personal RAG Engine
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlike generic chatbots, your RAG model operates on a **personalized vector space** built directly from your actual reflections and catalog database.
            </p>

            <div className="space-y-4">
              <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-1">
                <span className="text-xs font-bold text-teal-400 block">1. Ask My Library</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Query ideas across multiple texts at once. Try: *"What have I learned about behavior change?"*
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-1">
                <span className="text-xs font-bold text-primary-400 block">2. Theme Exploration</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Find notes across different categories. Try: *"Show me all my highlights related to identity."*
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-1">
                <span className="text-xs font-bold text-pink-400 block">3. AI Reading Mentor</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Find patterns in study goals. Try: *"Compare Stoicism concepts from different philosophy texts."*
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-1">
                <span className="text-xs font-bold text-amber-400 block">4. Spaced Revision Check</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Locate concepts that haven't been revised. Try: *"Which revision cards have I struggled with?"*
                </p>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

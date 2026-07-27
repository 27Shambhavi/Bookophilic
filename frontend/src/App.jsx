import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import BookDetails from './pages/BookDetails/BookDetails';
import Notes from './pages/Notes/Notes';
import Flashcards from './pages/Flashcards/Flashcards';
import Recommendations from './pages/Recommendations/Recommendations';
import Profile from './pages/Profile/Profile';
import RagWorkspace from './pages/RAG/RagWorkspace';
import { BookOpen } from 'lucide-react';

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500); // Start fade-out transition after 2.5s
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-[9999] bg-slate-950 flex flex-col justify-center items-center p-6 text-center select-none overflow-hidden transition-all duration-700 ease-out ${fadeOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}>
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-pink-500/10 blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="z-10 flex flex-col items-center space-y-6">
        {/* Pulsing logo icon */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-kinnectric-glow animate-float">
          <BookOpen className="w-12 h-12 text-pink-500 fill-pink-500/20" />
        </div>

        {/* Brand name */}
        <span className="text-sm font-bold uppercase tracking-widest text-violet-400">
          Bookophilic
        </span>

        {/* Tagline 1 */}
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight animate-fade-in-slow leading-tight">
          "Turn your reading into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-500 to-red-400">lasting wisdom</span>."
        </h1>

        {/* Tagline 2 */}
        <p className="text-slate-400 text-lg md:text-xl font-medium tracking-wide animate-fade-in-delayed-2 italic">
          “Read. Reflect. Remember.”
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Silent warm-up request to trigger Render spin-up immediately on app load
    const warmUpBackend = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 
          (typeof window !== 'undefined' && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
            ? 'http://localhost:8000/api' 
            : 'https://bookophilic.onrender.com/api');
        
        // Pinging the authentication endpoint to wake up Render server
        await fetch(`${API_URL}/auth/me`).catch(() => {});
      } catch (err) {
        // Silent catch
      }
    };
    warmUpBackend();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1000); // Unmount splash screen after 1.0s
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/library" element={<Home />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/rag" element={<RagWorkspace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}


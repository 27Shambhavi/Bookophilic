import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, LogOut, Moon, Sun } from 'lucide-react';
import authService from '../../services/authService';
import logo from '../../assets/logo.jpg';

export default function Navbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (authService.getToken()) {
          const user = await authService.getMe();
          setCurrentUser(user);
        }
      } catch (err) {
        console.error("Not authenticated", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-glass">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="p-0.5 rounded-xl shadow-glass-glow group-hover:scale-105 transition-all w-11 h-11 flex items-center justify-center overflow-hidden border border-white/10 bg-slate-900">
          <img src={logo} alt="Bookophilic Logo" className="w-full h-full object-cover rounded-lg" />
        </div>
        <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-primary-300 bg-clip-text text-transparent">
          Bookophilic
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-slate-300 hover:text-white cursor-pointer active:scale-95 flex items-center justify-center"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-500" />}
        </button>

        {currentUser ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400 hidden sm:inline">
              Welcome, <span className="text-white font-medium">{currentUser.full_name || currentUser.email}</span>
            </span>
            <Link 
              to="/profile" 
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all text-slate-300 hover:text-white"
            >
              <User className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium">Profile</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium border border-red-500/20 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium">
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 shadow-glass-glow text-white text-sm font-medium transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

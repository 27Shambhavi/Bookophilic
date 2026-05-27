import React, { useEffect, useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import { 
  BookOpen, User, LogOut, Moon, Sun, Menu, X, 
  LayoutDashboard, Library, FileText, Brain, Search, Sparkles, UserCircle 
} from 'lucide-react';
import authService from '../../services/authService';
import logo from '../../assets/logo.jpg';

export default function Navbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'My Notes', path: '/notes', icon: FileText },
    { name: 'Flashcards', path: '/flashcards', icon: Brain },
    { name: 'Ask My Library', path: '/rag', icon: Search },
    { name: 'AI Matches', path: '/recommendations', icon: Sparkles },
    { name: 'Settings', path: '/profile', icon: UserCircle },
  ];

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
    <>
      <nav className="glass-panel sticky top-0 z-50 w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/5 shadow-glass">
        <div className="flex items-center gap-3">
          {/* Hamburger button (visible on mobile only, when user is authenticated) */}
          {currentUser && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 md:hidden text-slate-300 hover:text-white cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
              aria-label="Open navigation drawer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="p-0.5 rounded-xl shadow-glass-glow group-hover:scale-105 transition-all w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center overflow-hidden border border-white/10 bg-slate-900 shrink-0">
              <img src={logo} alt="Bookophilic Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight brand-name-gradient bg-clip-text text-transparent">
              Bookophilic
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all text-slate-300 hover:text-white hidden md:flex"
              >
                <User className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium">Profile</span>
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-sm font-medium border border-red-500/20 cursor-pointer hidden md:flex"
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
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-primary-500 hover:bg-primary-600 shadow-glass-glow text-white text-sm font-medium transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Navigation Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden animate-fadeIn">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer container */}
          <div className="relative flex flex-col w-72 max-w-[80vw] h-full bg-slate-950/95 border-r border-white/10 p-6 shadow-2xl z-10 transition-transform duration-300 animate-scaleUp">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsDrawerOpen(false)}>
                <div className="p-0.5 rounded-lg w-8 h-8 flex items-center justify-center overflow-hidden border border-white/10 bg-slate-900">
                  <img src={logo} alt="" className="w-full h-full object-cover rounded" />
                </div>
                <span className="text-lg font-bold brand-name-gradient bg-clip-text text-transparent">Bookophilic</span>
              </Link>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center justify-center border border-white/5"
                title="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Navigation Items */}
            <div className="flex flex-col gap-2 py-6 flex-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive 
                          ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30 text-white shadow-glass-glow' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 animate-pulse-glow" style={{ animationDuration: '4s' }} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Drawer Footer / Account details */}
            {currentUser && (
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="px-2">
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">Logged in as</span>
                  <span className="block text-xs text-slate-300 font-bold truncate mt-0.5">{currentUser.full_name || currentUser.email}</span>
                </div>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


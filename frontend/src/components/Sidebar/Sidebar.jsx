import React from 'react';
import { NavLink } from 'react-router-dom';
import { Library, LayoutDashboard, FileText, Brain, Sparkles, UserCircle, Search } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Library', path: '/library', icon: Library },
    { name: 'My Notes', path: '/notes', icon: FileText },
    { name: 'Flashcards', path: '/flashcards', icon: Brain },
    { name: 'Ask My Library', path: '/rag', icon: Search },
    { name: 'AI Matches', path: '/recommendations', icon: Sparkles },
    { name: 'Settings', path: '/profile', icon: UserCircle },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-white/5 min-h-[calc(100vh-73px)] p-6 hidden md:block shrink-0">
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30 text-white shadow-glass-glow' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}

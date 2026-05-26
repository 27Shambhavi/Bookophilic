import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { User, Save, Settings, Loader2 } from 'lucide-react';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredGenres, setPreferredGenres] = useState('');
  const [theme, setTheme] = useState('dark');
  const [readingGoal, setReadingGoal] = useState(50);

  useEffect(() => {
    if (!authService.getToken()) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const user = await authService.getMe();
        setEmail(user.email);
        setFullName(user.full_name || '');
        
        if (user.preferences) {
          setPreferredGenres(user.preferences.preferred_genres || '');
          setTheme(user.preferences.theme || 'dark');
          setReadingGoal(user.preferences.reading_goal_pages || 50);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updatePreferences({
        preferred_genres: preferredGenres,
        theme: theme,
        reading_goal_pages: parseInt(readingGoal),
      });
      alert("Settings updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-2xl mx-auto w-full">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Settings className="w-8 h-8 text-primary-500" /> Account Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Customize your reading targets, preferred genres, and theme layouts.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-slate-400 font-medium">Loading user settings...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address (Read-only)</label>
                  <input
                    type="email" disabled
                    className="w-full bg-slate-900 border border-white/5 opacity-55 rounded-xl px-4 py-3 text-sm text-slate-400 focus:outline-none"
                    value={email}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text" disabled
                    className="w-full bg-slate-900 border border-white/5 opacity-55 rounded-xl px-4 py-3 text-sm text-slate-400 focus:outline-none"
                    value={fullName}
                  />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1 block">Name details are managed during authentication.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preferred Genres</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                    placeholder="e.g. Fiction, Philosophy, Technology, Sci-Fi"
                    value={preferredGenres}
                    onChange={(e) => setPreferredGenres(e.target.value)}
                  />
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1.5 block">Separate categories with commas to align the vector matchmaker.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Interface Theme</label>
                    <select
                      className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none transition-all"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="dark">Deep Cosmic Dark</option>
                      <option value="light">Classic Light</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Daily Goal (Pages)</label>
                    <input
                      type="number"
                      className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none transition-all"
                      value={readingGoal}
                      onChange={(e) => setReadingGoal(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-glass-glow transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Preferences
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

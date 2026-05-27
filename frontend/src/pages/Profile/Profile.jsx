import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import { User, Save, Settings, Loader2, AlertCircle, CheckCircle, Clock, BookOpen } from 'lucide-react';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const AVATAR_OPTIONS = [
  { emoji: '📚', label: 'Scholar' },
  { emoji: '🏛️', label: 'Sage' },
  { emoji: '☕', label: 'Zen Reader' },
  { emoji: '🚀', label: 'Explorer' },
  { emoji: '🎨', label: 'Creator' },
  { emoji: '⚡', label: 'Pioneer' },
  { emoji: '🧙', label: 'Wizard' },
  { emoji: '🌌', label: 'Cosmonaut' },
];

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile preferences states
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredGenres, setPreferredGenres] = useState('');
  const [theme, setTheme] = useState('dark');
  const [readingGoal, setReadingGoal] = useState(50);
  const [avatar, setAvatar] = useState('📚');

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Reading history states
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

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
          setAvatar(user.preferences.avatar || '📚');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const loadSessions = async () => {
      try {
        const data = await authService.getReadingSessions();
        setSessions(data);
      } catch (err) {
        console.error("Failed to load reading sessions", err);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadProfile();
    loadSessions();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updatePreferences({
        preferred_genres: preferredGenres,
        theme: theme,
        reading_goal_pages: parseInt(readingGoal),
        avatar: avatar,
      });
      alert("Settings updated successfully!");
      // Reload page to refresh navbar avatar
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordUpdating(true);
    setPasswordError('');
    setPasswordSuccess('');
    try {
      await authService.changePassword(oldPassword, newPassword);
      setPasswordSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPasswordError(err.response?.data?.detail || 'Failed to update password. Make sure current password is correct.');
    } finally {
      setPasswordUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-3xl mx-auto w-full">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <Settings className="w-8 h-8 text-primary-500 animate-spin-slow" /> Account Settings
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Customize your reading targets, preferred genres, choose your study avatar, and track study sessions.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
              <p className="text-slate-400 font-medium">Loading user settings...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Preferences Form */}
              <form onSubmit={handleSave} className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 space-y-6">
                
                {/* Avatar Selector Grid */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Select Study Avatar</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {AVATAR_OPTIONS.map((opt) => (
                      <button
                        key={opt.emoji}
                        type="button"
                        onClick={() => setAvatar(opt.emoji)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 relative group cursor-pointer ${
                          avatar === opt.emoji
                            ? 'bg-primary-500/20 border-primary-500 text-white shadow-glass-glow scale-[1.02]'
                            : 'bg-slate-900/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <span className="text-3xl mb-1 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] transition-transform group-hover:scale-110 select-none">{opt.emoji}</span>
                        <span className="text-[10px] font-extrabold tracking-wide truncate max-w-full">{opt.label}</span>
                        {avatar === opt.emoji && (
                          <span className="absolute top-1.5 right-2.5 text-primary-400 text-[10px] font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-1 block">Managed during authentication.</span>
                    </div>
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
                        className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none transition-all cursor-pointer"
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
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm shadow-glass-glow transition-all cursor-pointer active:scale-98"
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

              {/* Change Password Card */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 space-y-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 select-none">
                    🔒 Security & Password Update
                  </h2>
                  <span className="text-xs text-primary-400 group-hover:underline font-bold select-none">
                    {showPasswordSection ? 'Collapse' : 'Expand'}
                  </span>
                </button>

                {showPasswordSection && (
                  <form onSubmit={handlePasswordChange} className="space-y-4 pt-3 border-t border-white/5 animate-fadeIn">
                    {passwordError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{passwordError}</span>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold">
                        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{passwordSuccess}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
                        <input
                          type="password" required
                          className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none transition-all"
                          placeholder="••••••••"
                          value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                          <input
                            type="password" required minLength={6}
                            className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none transition-all"
                            placeholder="••••••••"
                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                          <input
                            type="password" required
                            className="w-full bg-slate-900 border border-white/5 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none transition-all"
                            placeholder="••••••••"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={passwordUpdating}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-750 text-white font-bold text-sm shadow-glass-glow transition-all cursor-pointer active:scale-98"
                      >
                        {passwordUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Reading Session History Card */}
              <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 space-y-4">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 border-b border-white/5 pb-3 select-none">
                  <Clock className="w-5 h-5 text-indigo-400" /> Reading Session History
                </h2>
                <p className="text-xs text-slate-400">
                  Track the books you've invested time in, along with pages read and notes taken.
                </p>

                {loadingSessions ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                    <p className="text-slate-400 text-xs">Loading history...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    📚 No reading sessions logged yet. Start reading a book from your Library to begin!
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                    {sessions.map((sess) => (
                      <div key={sess.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3.5 hover:border-white/10 transition-all">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-violet-400 shrink-0" />
                            <span className="text-sm font-bold text-white leading-tight">{sess.book_title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 block font-semibold">
                            Started: {new Date(sess.start_time).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center flex-wrap gap-3">
                          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-center shrink-0">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Duration</span>
                            <span className="text-xs font-bold text-teal-400">
                              {sess.duration_minutes !== null ? `${sess.duration_minutes} min` : 'Active Now ⚡'}
                            </span>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-center shrink-0">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Pages</span>
                            <span className="text-xs font-bold text-indigo-400">{sess.pages_read} read</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-center shrink-0">
                            <span className="text-[9px] text-slate-400 block uppercase font-bold">Notes</span>
                            <span className="text-xs font-bold text-pink-400">{sess.notes_taken} taken</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

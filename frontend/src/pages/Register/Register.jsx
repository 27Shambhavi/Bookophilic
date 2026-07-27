import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Key, Mail, User, Loader2, AlertCircle, Eye, EyeOff, 
  BookOpen, Brain, Sparkles, Trophy, CheckCircle, Quote 
} from 'lucide-react';
import authService from '../../services/authService';
import logo from '../../assets/logo.jpg';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    // Password validation constraints (alpha, numerical, special tag)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password)) {
      setError('Password must contain at least one letter.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[@$!%*?&#_+-]/.test(password)) {
      setError('Password must contain at least one special character (e.g. @$!%*?&#_+-).');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await authService.register(email, password, fullName);
      if (!data || !data.access_token) {
        await authService.login(email, password);
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(e => e.msg).join(', '));
      } else {
        setError(detail || 'Registration failed. Try checking your parameters.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 relative overflow-hidden font-sans select-none">
      {/* Glow Orbs in Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[30%] w-[450px] h-[450px] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none" />

      {/* LEFT COLUMN: Brand, taglines, and interactive device mockup (Desktop only) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 z-10 border-r border-white/5 bg-slate-950/40 relative">
        {/* Branding header */}
        <div className="flex items-center gap-3">
          <div className="p-0.5 rounded-2xl shadow-glass-glow w-11 h-11 flex items-center justify-center overflow-hidden border border-white/10 bg-slate-900">
            <img src={logo} alt="Bookophilic Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight brand-name-gradient bg-clip-text text-transparent">
            Bookophilic
          </span>
        </div>

        {/* Hero taglines & device mockup */}
        <div className="my-auto space-y-12 flex flex-col items-start max-w-2xl relative">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-400 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25">
              AI-Powered Reading Study Room
            </span>
            <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
              Turn your reading into <br />
              <span className="text-gradient-kinnectric drop-shadow-[0_2px_15px_rgba(236,72,153,0.3)]">
                lasting wisdom
              </span>.
            </h1>
            <p className="text-slate-400 text-xl font-medium tracking-wide">
              Your AI-powered space for thoughts, quotes, and learnings
            </p>
          </div>

          {/* Interactive CSS Phone Mockup */}
          <div className="phone-frame-container self-center pt-4 relative">
            {/* Violet radial glow behind the phone, matching the Kinnectric template */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/35 blur-3xl -z-10 animate-pulse" />
            
            <div className="phone-frame-3d w-[280px] h-[520px] bg-slate-900 border-[6px] border-slate-800 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col shrink-0">
              {/* Phone Speaker & Camera (Notch) */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-slate-950 rounded-full absolute right-4"></div>
              </div>

              {/* Mobile Viewport Content */}
              <div className="flex-1 p-4 pt-10 bg-slate-950 text-slate-100 flex flex-col justify-between">
                {/* Mobile Top Bar */}
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Bookophilic Mobile</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-semibold">9:41 AM</span>
                </div>

                {/* Dashboard Widgets inside Mockup */}
                <div className="space-y-3.5 flex-1 py-3.5 overflow-hidden">
                  {/* Mini Stats Card */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                      <span className="text-[8px] text-slate-400 font-semibold block uppercase">Books</span>
                      <span className="text-xs font-bold text-white">12 Shelved</span>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                      <span className="text-[8px] text-slate-400 font-semibold block uppercase">Recall</span>
                      <span className="text-xs font-bold text-teal-400">SM-2 Active</span>
                    </div>
                  </div>

                  {/* Mini Progress Card */}
                  <div className="bg-slate-900 border border-white/5 p-2 rounded-xl space-y-1.5 shadow-sm">
                    <div className="flex justify-between items-center text-[8px] font-bold text-violet-400">
                      <span>Currently Reading</span>
                      <span>72%</span>
                    </div>
                    <div className="text-[10px] font-bold text-white truncate">Atomic Habits</div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[72%] h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Spaced Repetition Flashcard Recall inside Mockup */}
                  <div className="bg-gradient-to-r from-violet-950/40 to-pink-950/20 border border-violet-500/20 p-2.5 rounded-xl space-y-1">
                    <span className="text-[7px] font-bold text-pink-400 uppercase tracking-widest block">Active Recall</span>
                    <p className="text-[9px] text-slate-300 leading-snug line-clamp-2 italic">
                      "What is the habit loop described by Charles Duhigg?"
                    </p>
                  </div>

                  {/* Mentors Widget */}
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">🏛️</div>
                    <div className="overflow-hidden">
                      <span className="text-[8px] font-bold text-slate-300 block">Marcus Aurelius</span>
                      <span className="text-[7px] text-slate-500 block truncate">You have power over your mind...</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation bar bottom */}
                <div className="border-t border-white/5 pt-2 flex justify-around text-slate-500 text-[8px] font-bold">
                  <span className="text-violet-400">● Home</span>
                  <span>● Notes</span>
                  <span>● Recall</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Academic Quote */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <Quote className="w-3.5 h-3.5 text-slate-600" />
          <span>"To read without reflecting is like eating without digesting." — Edmund Burke</span>
        </div>
      </div>

      {/* RIGHT COLUMN: The registration form card */}
      <div className="w-full lg:w-[480px] shrink-0 flex flex-col justify-center items-center p-6 sm:p-12 z-10 bg-slate-950/20 relative">
        
        {/* Mobile-only Branding Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8 lg:hidden">
          <div className="p-0.5 rounded-2xl shadow-glass-glow w-12 h-12 flex items-center justify-center overflow-hidden border border-white/10 bg-slate-900">
            <img src={logo} alt="Bookophilic Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-400">
            Bookophilic
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Turn your reading <br />
            into lasting wisdom
          </h1>
          <p className="text-slate-400 text-sm">
            Your AI-powered space for thoughts, quotes, and learnings
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md space-y-6">
          <div className="glass-panel p-8 rounded-[2rem] border border-white/10 space-y-6 shadow-2xl relative">
            {/* Glowing spot behind card */}
            <div className="absolute inset-0 rounded-[2rem] bg-violet-600/5 blur-2xl pointer-events-none" />

            <div className="space-y-1.5 relative z-10">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-slate-500 text-xs">
                Your AI-powered space for thoughts, quotes, and learnings
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold relative z-10">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                  <input
                    type="text" required
                    placeholder="John Doe"
                    className="w-full bg-slate-900/60 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                    value={fullName} onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                  <input
                    type="email" required
                    placeholder="you@example.com"
                    className="w-full bg-slate-900/60 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
                  <input
                    type={showPassword ? "text" : "password"} required
                    placeholder="••••••••"
                    className="w-full bg-slate-900/60 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 rounded-xl pl-12 pr-12 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 cursor-pointer flex items-center justify-center"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-kinnectric text-white font-bold text-sm shadow-kinnectric-glow hover:shadow-kinnectric-glow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-6 border border-white/10"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Registering...
                  </>
                ) : (
                  'Create Profile'
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-white/5 space-y-3 relative z-10">
              <span className="block text-center text-xs text-slate-500">Already have an account?</span>
              <Link 
                to="/login" 
                className="w-full py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white font-bold text-sm text-center block cursor-pointer active:scale-[0.98] transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


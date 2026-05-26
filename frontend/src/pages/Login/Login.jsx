import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Key, Mail, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';
import logo from '../../assets/logo.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid email or password combination.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-950 bg-mesh relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-primary-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10 animate-fadeIn flex flex-col">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-0.5 rounded-2xl shadow-glass-glow hover:scale-105 transition-all duration-300 w-14 h-14 flex items-center justify-center overflow-hidden border border-white/10 bg-slate-900">
            <img src={logo} alt="Bookophilic Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-primary-400">
              Bookophilic
            </span>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-slate-500 text-sm">
              Sign in to your account
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 flex items-start gap-2.5 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
              <input
                type="email" required
                placeholder="you@example.com"
                className="w-full bg-slate-900/40 border border-white/10 focus:border-primary-500 rounded-xl pl-12 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all focus:ring-1 focus:ring-primary-500/20"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-4 top-4" />
              <input
                type={showPassword ? "text" : "password"} required
                placeholder="••••••••"
                className="w-full bg-slate-900/40 border border-white/10 focus:border-primary-500 rounded-xl pl-12 pr-12 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-all focus:ring-1 focus:ring-primary-500/20"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-bold text-sm shadow-glass-glow hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Accessing...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="pt-2">
          <Link 
            to="/register" 
            className="w-full py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-sm transition-all text-center block cursor-pointer active:scale-[0.98]"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

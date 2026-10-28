import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { User, Lock, Mail, Loader2, X } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const { accent } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let res;
      if (isRegister) {
        res = await api.register(email, password, username);
      } else {
        res = await api.login(email, password);
      }

      if (res.success) {
        if (res.token) {
          localStorage.setItem('soundcraft_token', res.token);
        }
        onAuthSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message || 'Authentication failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none transition-colors">
      <div className="w-full max-w-sm bg-studio-card border border-studio-border rounded-2xl shadow-2xl p-6 relative flex flex-col transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-studio-textMuted hover:text-studio-text p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
            style={{ background: accent.gradient }}
          >
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-studio-text">
              {isRegister ? 'Create Producer Account' : 'Producer Sign In'}
            </h3>
            <p className="text-xs text-studio-textMuted">
              {isRegister ? 'Bcrypt secured with Supabase persistence' : 'Access saved sessions & AI lyrics'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2.5 bg-rose-950/20 border border-rose-500/40 rounded-xl text-rose-500 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Producer Handle</label>
              <div className="relative">
                <User className="w-4 h-4 text-studio-textMuted absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. BeatWave2026"
                  className="w-full bg-studio-darkest border border-studio-border rounded-xl pl-9 pr-3 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-studio-textMuted absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="producer@soundcraft.io"
                className="w-full bg-studio-darkest border border-studio-border rounded-xl pl-9 pr-3 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-studio-textMuted block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-studio-textMuted absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-studio-darkest border border-studio-border rounded-xl pl-9 pr-3 py-2 text-xs text-studio-text focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-transform hover:scale-102 active:scale-98 disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
            style={{ background: accent.gradient }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>{isRegister ? 'Register & Launch DAW' : 'Sign In to Studio'}</span>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-studio-border text-center text-xs text-studio-textMuted">
          {isRegister ? (
            <span>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg('');
                }}
                className="text-cyan-500 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New producer?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg('');
                }}
                className="text-cyan-500 font-bold hover:underline"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

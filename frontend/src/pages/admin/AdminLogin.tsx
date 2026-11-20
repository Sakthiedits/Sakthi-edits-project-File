import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin, checkAdminAuth } from '../../api/api';
import { Eye, ShieldCheck, Lock, User } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const usernameRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    const verifySession = async () => {
      try {
        const authenticated = await checkAdminAuth();
        if (authenticated) {
          navigate('/admin', { replace: true });
        }
      } catch {
        // Not authenticated
      } finally {
        setCheckingAuth(false);
      }
    };
    verifySession();
  }, [navigate]);

  useEffect(() => {
    if (!checkingAuth) {
      usernameRef.current?.focus();
    }
  }, [checkingAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      await adminLogin({ username: username.trim(), password });
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
        {/* Wordmark */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-widest text-slate-900 uppercase">
            SAKTHI<span className="text-purple-600">EDITS</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Admin Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
            >
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={usernameRef}
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="sakthi"
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl py-3.5 mt-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in…' : 'Log In to Dashboard'}
          </button>
        </form>

        {/* View Website Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Go to Live Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!isLogin && username.length < 2) {
      toast.error('Username must be at least 2 characters');
      return;
    }
    
    if (password.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(username, password);
        toast.success('Welcome back!');
      } else {
        await register(username, password);
        toast.success('Account created! Welcome to PaFos!');
      }
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg to-surface p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💬</div>
          <h1 className="text-3xl font-bold text-primary">PaFos</h1>
          <p className="text-text-secondary mt-2">Modern messaging for friends</p>
        </div>

        {/* Form Card */}
        <div className="bg-surface rounded-2xl shadow-xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                isLogin
                  ? 'bg-primary text-white'
                  : 'bg-surface-hover text-text-secondary hover:text-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                !isLogin
                  ? 'bg-primary text-white'
                  : 'bg-surface-hover text-text-secondary hover:text-text'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition"
                placeholder="cool_username"
                autoComplete="username"
                disabled={loading}
              />
              {!isLogin && (
                <p className="text-xs text-text-secondary mt-1">
                  Letters, numbers, and underscore only
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-surface-hover border border-border rounded-lg text-text focus:border-primary focus:outline-none transition"
                placeholder="••••••••"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                disabled={loading}
              />
              {!isLogin && (
                <p className="text-xs text-text-secondary mt-1">
                  At least 4 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="spinner w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-text-secondary">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary-hover transition"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="text-center mt-6 text-xs text-text-secondary">
          <p>PaFos Messenger • Private & Secure</p>
        </div>
      </div>
    </div>
  );
}
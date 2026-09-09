'use client';

import React, { useState } from 'react';
import {
  Shield,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  LogOut,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthCardProps {
  onAuthSuccess?: (email: string) => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onAuthSuccess }) => {
  const {
    user,
    session,
    isLoading,
    error,
    isAuthenticated,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    clearError
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setActionSuccessMsg(null);

    if (!email || (mode !== 'reset' && !password)) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signIn({ email, password });
        if (res.success && res.data?.user) {
          setActionSuccessMsg(`Welcome back, ${res.data.user.email}!`);
          onAuthSuccess?.(res.data.user.email || '');
          setPassword('');
        }
      } else if (mode === 'signup') {
        const res = await signUp({ email, password });
        if (res.success) {
          if (res.data?.session) {
            setActionSuccessMsg(`Account created and signed in as ${res.data.user?.email}!`);
            onAuthSuccess?.(res.data.user?.email || '');
          } else {
            setActionSuccessMsg(
              `Registration complete for ${res.data?.user?.email}. If email confirmation is required, please verify your inbox.`
            );
          }
          setPassword('');
        }
      } else if (mode === 'reset') {
        const res = await resetPassword(email);
        if (res.success) {
          setActionSuccessMsg(`Password reset instructions sent to ${email}.`);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = async (provider: 'github' | 'google') => {
    clearError();
    setActionSuccessMsg(null);
    await signInWithOAuth(provider);
  };

  const handleFillDemo = () => {
    setEmail('demo.operator@supabase.io');
    setPassword('MissionControl2026!');
  };

  return (
    <div className="card auth-card-container" id="auth-management-card">
      <div className="card-header">
        <div className="header-title">
          <Shield className="section-icon text-emerald" />
          <div>
            <h3>Authentication & Identity</h3>
            <p className="subtitle">
              {isAuthenticated
                ? 'Active authenticated session running under Supabase GoTrue'
                : 'Sign in, register, or manage user access privileges'}
            </p>
          </div>
        </div>
        <span className={`status-pill ${isAuthenticated ? 'pill-success' : 'pill-info'}`}>
          {isAuthenticated ? 'Authenticated' : 'Public Anon'}
        </span>
      </div>

      {/* Authenticated State */}
      {isAuthenticated && user ? (
        <div className="auth-profile-pane">
          <div className="profile-identity-box">
            <div className="avatar-ring">
              <div className="avatar-initial">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="online-beacon" title="Session Active" />
            </div>

            <div className="profile-details">
              <div className="flex items-center gap-2">
                <span className="profile-email">{user.email}</span>
                <span className="badge badge-verified">
                  <UserCheck size={12} /> {user.role || 'authenticated'}
                </span>
              </div>
              <div className="profile-meta-grid">
                <div className="meta-item">
                  <span className="meta-label">User UUID:</span>
                  <span className="meta-val font-mono">{user.id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Provider:</span>
                  <span className="meta-val">{user.app_metadata?.provider || 'Email / Password'}</span>
                </div>
                {session?.expires_at && (
                  <div className="meta-item">
                    <span className="meta-label">Token Expiry:</span>
                    <span className="meta-val">
                      {new Date(session.expires_at * 1000).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="auth-actions-bar">
            <button
              id="btn-auth-signout"
              className="btn btn-secondary btn-signout"
              onClick={() => signOut()}
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? (
                <Loader2 size={16} className="spin-icon" />
              ) : (
                <LogOut size={16} />
              )}
              Sign Out Session
            </button>
          </div>
        </div>
      ) : (
        /* Unauthenticated State: Forms */
        <div className="auth-form-pane">
          {/* Sub-tabs */}
          <div className="auth-mode-tabs">
            <button
              type="button"
              className={`mode-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setMode('signin');
                clearError();
                setActionSuccessMsg(null);
              }}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              type="button"
              className={`mode-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                clearError();
                setActionSuccessMsg(null);
              }}
            >
              <UserPlus size={14} /> Register
            </button>
            <button
              type="button"
              className={`mode-tab ${mode === 'reset' ? 'active' : ''}`}
              onClick={() => {
                setMode('reset');
                clearError();
                setActionSuccessMsg(null);
              }}
            >
              <KeyRound size={14} /> Reset
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="alert-banner alert-error mb-3">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {actionSuccessMsg && (
            <div className="alert-banner alert-success mb-3">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label htmlFor="auth-email-input" className="input-label">
                Email Address
              </label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  className="form-input with-icon"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="input-group">
                <div className="flex justify-between items-center">
                  <label htmlFor="auth-password-input" className="input-label">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => setMode('reset')}
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="input-icon-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="form-input with-icon with-end-icon"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="end-icon-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            <div className="form-actions-row">
              <button
                type="submit"
                id="btn-auth-submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    <span>Processing...</span>
                  </>
                ) : mode === 'signin' ? (
                  <>
                    <LogIn size={16} /> Sign In
                  </>
                ) : mode === 'signup' ? (
                  <>
                    <UserPlus size={16} /> Create Account
                  </>
                ) : (
                  <>
                    <KeyRound size={16} /> Send Reset Link
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Assist */}
          <div className="auth-quick-tools">
            <button
              type="button"
              className="quick-demo-btn"
              onClick={handleFillDemo}
              title="Insert sample test credentials"
            >
              <Sparkles size={13} /> Fill Demo Credentials
            </button>
          </div>

          {/* Social OAuth Providers */}
          <div className="oauth-divider">
            <span>Or continue with provider</span>
          </div>

          <div className="oauth-button-grid">
            <button
              type="button"
              className="oauth-btn"
              onClick={() => handleOAuthLogin('github')}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub
            </button>
            <button
              type="button"
              className="oauth-btn"
              onClick={() => handleOAuthLogin('google')}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

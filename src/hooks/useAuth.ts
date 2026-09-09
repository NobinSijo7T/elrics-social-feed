import { useState, useEffect, useCallback } from 'react';
import type { User, Session, Provider } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  authSignUp,
  authSignIn,
  authSignInWithOAuth,
  authSignOut,
  authResetPasswordForEmail,
  type SignUpCredentials,
  type SignInCredentials,
  type AuthActionResult
} from '../lib/auth';

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (credentials: SignUpCredentials) => Promise<AuthActionResult<{ user: User | null; session: Session | null }>>;
  signIn: (credentials: SignInCredentials) => Promise<AuthActionResult<{ user: User; session: Session }>>;
  signInWithOAuth: (provider: Provider, redirectTo?: string) => Promise<AuthActionResult<{ url: string | null }>>;
  signOut: () => Promise<AuthActionResult<void>>;
  resetPassword: (email: string, redirectTo?: string) => Promise<AuthActionResult<void>>;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize and listen to auth state changes
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError((err as Error)?.message || 'Failed to initialize session');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    // Subscribe to auth state updates (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (isMounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignUp = useCallback(async (credentials: SignUpCredentials) => {
    setIsLoading(true);
    setError(null);
    const result = await authSignUp(credentials);
    if (!result.success && result.error) {
      setError(result.error);
    }
    setIsLoading(false);
    return result;
  }, []);

  const handleSignIn = useCallback(async (credentials: SignInCredentials) => {
    setIsLoading(true);
    setError(null);
    const result = await authSignIn(credentials);
    if (!result.success && result.error) {
      setError(result.error);
    }
    setIsLoading(false);
    return result;
  }, []);

  const handleSignInWithOAuth = useCallback(async (provider: Provider, redirectTo?: string) => {
    setError(null);
    const result = await authSignInWithOAuth(provider, redirectTo);
    if (!result.success && result.error) {
      setError(result.error);
    }
    return result;
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await authSignOut();
    if (!result.success && result.error) {
      setError(result.error);
    } else {
      setUser(null);
      setSession(null);
    }
    setIsLoading(false);
    return result;
  }, []);

  const handleResetPassword = useCallback(async (email: string, redirectTo?: string) => {
    setIsLoading(true);
    setError(null);
    const result = await authResetPasswordForEmail(email, redirectTo);
    if (!result.success && result.error) {
      setError(result.error);
    }
    setIsLoading(false);
    return result;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithOAuth: handleSignInWithOAuth,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    clearError
  };
}

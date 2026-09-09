/**
 * Production-Ready Supabase Authentication Service
 * 
 * Provides typed auth helper functions with structured diagnostic logging
 * for sign-up, sign-in, OAuth, password reset, and session management.
 */

import { supabase, logEvent } from './supabase';
import type { User, Session, AuthError, Provider } from '@supabase/supabase-js';

export interface SignUpCredentials {
  email: string;
  password: string;
  data?: Record<string, unknown>;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  rawError?: AuthError | Error | null;
}

/**
 * Register a new user with email and password.
 */
export async function authSignUp({
  email,
  password,
  data
}: SignUpCredentials): Promise<AuthActionResult<{ user: User | null; session: Session | null }>> {
  const startTime = performance.now();
  logEvent('info', 'auth', `Initiating sign-up for ${email}...`);

  try {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data
      }
    });

    const duration = Math.round(performance.now() - startTime);

    if (response.error) {
      logEvent('error', 'auth', `Sign-up failed for ${email}: ${response.error.message}`, response.error, duration);
      return {
        success: false,
        error: response.error.message,
        rawError: response.error
      };
    }

    const isConfirmed = !!response.data.session;
    const msg = isConfirmed
      ? `User ${email} signed up and logged in successfully`
      : `User ${email} registered. Confirmation email sent (if required by project).`;

    logEvent('success', 'auth', msg, { userId: response.data.user?.id }, duration);

    return {
      success: true,
      data: {
        user: response.data.user,
        session: response.data.session
      }
    };
  } catch (err: unknown) {
    const duration = Math.round(performance.now() - startTime);
    const message = (err as Error)?.message || 'Unexpected sign-up error';
    logEvent('error', 'auth', `Unexpected error during sign-up: ${message}`, err, duration);
    return {
      success: false,
      error: message,
      rawError: err as Error
    };
  }
}

/**
 * Sign in existing user with email and password.
 */
export async function authSignIn({
  email,
  password
}: SignInCredentials): Promise<AuthActionResult<{ user: User; session: Session }>> {
  const startTime = performance.now();
  logEvent('info', 'auth', `Authenticating user: ${email}...`);

  try {
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    });

    const duration = Math.round(performance.now() - startTime);

    if (response.error) {
      logEvent('error', 'auth', `Sign-in failed for ${email}: ${response.error.message}`, response.error, duration);
      return {
        success: false,
        error: response.error.message,
        rawError: response.error
      };
    }

    logEvent('success', 'auth', `Successfully authenticated: ${response.data.user.email}`, {
      userId: response.data.user.id,
      role: response.data.user.role
    }, duration);

    return {
      success: true,
      data: {
        user: response.data.user,
        session: response.data.session
      }
    };
  } catch (err: unknown) {
    const duration = Math.round(performance.now() - startTime);
    const message = (err as Error)?.message || 'Unexpected sign-in error';
    logEvent('error', 'auth', `Sign-in exception: ${message}`, err, duration);
    return {
      success: false,
      error: message,
      rawError: err as Error
    };
  }
}

/**
 * Sign in using third-party OAuth provider (e.g. 'github' or 'google').
 */
export async function authSignInWithOAuth(
  provider: Provider,
  redirectTo?: string
): Promise<AuthActionResult<{ url: string | null }>> {
  logEvent('info', 'auth', `Initiating OAuth flow for provider: ${provider}`);

  try {
    const response = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined)
      }
    });

    if (response.error) {
      logEvent('error', 'auth', `OAuth authorization request failed for ${provider}: ${response.error.message}`, response.error);
      return {
        success: false,
        error: response.error.message,
        rawError: response.error
      };
    }

    logEvent('info', 'auth', `OAuth redirect URL generated for ${provider}`, { url: response.data.url });
    return {
      success: true,
      data: { url: response.data.url }
    };
  } catch (err: unknown) {
    const message = (err as Error)?.message || 'Unexpected OAuth error';
    logEvent('error', 'auth', `OAuth exception: ${message}`, err);
    return {
      success: false,
      error: message,
      rawError: err as Error
    };
  }
}

/**
 * Terminate current session and sign out.
 */
export async function authSignOut(): Promise<AuthActionResult<void>> {
  const startTime = performance.now();
  logEvent('info', 'auth', 'Signing out current user session...');

  try {
    const { error } = await supabase.auth.signOut();
    const duration = Math.round(performance.now() - startTime);

    if (error) {
      logEvent('error', 'auth', `Sign-out error: ${error.message}`, error, duration);
      return {
        success: false,
        error: error.message,
        rawError: error
      };
    }

    logEvent('success', 'auth', 'Session closed successfully. Active role reverted to Anonymous.', null, duration);
    return { success: true };
  } catch (err: unknown) {
    const duration = Math.round(performance.now() - startTime);
    const message = (err as Error)?.message || 'Unexpected sign-out error';
    logEvent('error', 'auth', `Sign-out exception: ${message}`, err, duration);
    return {
      success: false,
      error: message,
      rawError: err as Error
    };
  }
}

/**
 * Get the currently authenticated user from local memory/session.
 */
export async function authGetCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    logEvent('warn', 'auth', 'Failed to retrieve current user', err);
    return null;
  }
}

/**
 * Get active session.
 */
export async function authGetSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    logEvent('warn', 'auth', 'Failed to retrieve active session', err);
    return null;
  }
}

/**
 * Send password reset email.
 */
export async function authResetPasswordForEmail(
  email: string,
  redirectTo?: string
): Promise<AuthActionResult<void>> {
  logEvent('info', 'auth', `Sending password reset email to: ${email}`);

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || (typeof window !== 'undefined' ? window.location.origin : undefined)
    });

    if (error) {
      logEvent('error', 'auth', `Password reset failed for ${email}: ${error.message}`, error);
      return {
        success: false,
        error: error.message,
        rawError: error
      };
    }

    logEvent('success', 'auth', `Password reset email dispatched to ${email}`);
    return { success: true };
  } catch (err: unknown) {
    const message = (err as Error)?.message || 'Unexpected password reset error';
    logEvent('error', 'auth', `Password reset exception: ${message}`, err);
    return {
      success: false,
      error: message,
      rawError: err as Error
    };
  }
}

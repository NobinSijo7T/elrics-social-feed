/**
 * useProfile hook — fetches and updates the current user's row
 * in the public.users table (keyed by auth UID).
 *
 * The public.users table stores: id (UUID), name, email, created_at.
 * We sync id from supabase.auth user so the row always matches the auth user.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { User, UpdateUser } from '../lib/database';

export interface ProfileUpdatePayload {
  name: string;
  email: string;
}

export interface UseProfileReturn {
  profile: User | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  successMsg: string | null;
  fetchProfile: (authUser: SupabaseUser) => Promise<void>;
  updateProfile: (authUser: SupabaseUser, payload: ProfileUpdatePayload) => Promise<boolean>;
  clearMessages: () => void;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMsg(null);
  }, []);

  /**
   * Fetch the profile row from public.users for the given auth user.
   * If no row exists yet (e.g. OAuth user who never hit the sign-up flow),
   * we upsert a default row so the edit form always has something to work with.
   */
  const fetchProfile = useCallback(async (authUser: SupabaseUser) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (data) {
        setProfile(data as User);
      } else {
        // No row yet — insert a seed row so user can edit it immediately
        const seed = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'New User',
          email: authUser.email || '',
        };
        const { data: inserted, error: insertErr } = await supabase
          .from('users')
          .insert(seed)
          .select()
          .single();

        if (insertErr) throw insertErr;
        setProfile(inserted as User);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update the profile row in public.users.
   * Returns true on success, false on failure.
   */
  const updateProfile = useCallback(
    async (authUser: SupabaseUser, payload: ProfileUpdatePayload): Promise<boolean> => {
      setIsSaving(true);
      setError(null);
      setSuccessMsg(null);

      try {
        const update: UpdateUser = {
          name: payload.name.trim(),
          email: payload.email.trim(),
        };

        const { data, error: updateErr } = await supabase
          .from('users')
          .update(update)
          .eq('id', authUser.id)
          .select()
          .single();

        if (updateErr) throw updateErr;

        setProfile(data as User);
        setSuccessMsg('Profile updated successfully.');
        return true;
      } catch (err: unknown) {
        setError((err as Error)?.message || 'Failed to update profile');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return {
    profile,
    isLoading,
    isSaving,
    error,
    successMsg,
    fetchProfile,
    updateProfile,
    clearMessages,
  };
}

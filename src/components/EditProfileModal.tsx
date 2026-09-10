'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User2,
  Mail,
  Pencil,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useProfile } from '../hooks/useProfile';

interface EditProfileModalProps {
  authUser: SupabaseUser;
  onClose: () => void;
  onSaved?: (name: string) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  authUser,
  onClose,
  onSaved,
}) => {
  const { profile, isLoading, isSaving, error, successMsg, fetchProfile, updateProfile, clearMessages } =
    useProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const backdropRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile(authUser);
  }, [authUser, fetchProfile]);

  // Populate form once profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);

  // Auto-focus name field when loaded
  useEffect(() => {
    if (!isLoading && profile) {
      nameInputRef.current?.focus();
    }
  }, [isLoading, profile]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!name.trim()) return;

    const ok = await updateProfile(authUser, { name, email });
    if (ok) {
      onSaved?.(name.trim());
    }
  };

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <div className="modal-panel" id="edit-profile-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-wrap">
              <Pencil size={18} />
            </div>
            <div>
              <h2 id="edit-profile-title" className="modal-title">
                Edit Profile
              </h2>
              <p className="modal-subtitle">Update your public.users record in Supabase</p>
            </div>
          </div>
          <button
            id="btn-modal-close"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Loading skeleton */}
          {isLoading && (
            <div className="profile-loading">
              <Loader2 size={20} className="spin-icon text-primary" />
              <span className="text-muted">Loading profile from database…</span>
            </div>
          )}

          {/* Form */}
          {!isLoading && (
            <form onSubmit={handleSubmit} className="edit-profile-form" id="edit-profile-form">
              {/* Current DB row preview */}
              {profile && (
                <div className="db-row-preview">
                  <span className="db-row-label">DB Row</span>
                  <span className="db-row-id font-mono">id: {profile.id}</span>
                </div>
              )}

              {/* Name field */}
              <div className="input-group">
                <label htmlFor="profile-name-input" className="input-label">
                  Display Name
                </label>
                <div className="input-icon-wrapper">
                  <User2 size={16} className="input-icon" />
                  <input
                    ref={nameInputRef}
                    id="profile-name-input"
                    type="text"
                    required
                    className="form-input with-icon"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearMessages();
                    }}
                    maxLength={120}
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="input-group">
                <label htmlFor="profile-email-input" className="input-label">
                  Email Address
                  <span className="field-note">Stored in public.users — separate from auth email</span>
                </label>
                <div className="input-icon-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="profile-email-input"
                    type="email"
                    required
                    className="form-input with-icon"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearMessages();
                    }}
                  />
                </div>
              </div>

              {/* Feedback */}
              {error && (
                <div className="alert-banner alert-error">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="alert-banner alert-success">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  id="btn-profile-cancel"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-profile-save"
                  className="btn btn-primary"
                  disabled={isSaving || !name.trim()}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={15} className="spin-icon" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

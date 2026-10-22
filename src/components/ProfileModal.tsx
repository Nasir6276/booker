'use client';

import React, { useState } from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { X, User, Globe, Lock, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { getInitials } from '../utils/initials';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile } = useBookerStore();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isPublic, setIsPublic] = useState(user?.is_public || false);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: avatarUrl || undefined,
        is_public: isPublic
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-surface border border-border rounded-card shadow-xl overflow-hidden"
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
            <h3 className="font-serif text-lg font-semibold text-primary flex items-center gap-2">
              <User size={18} />
              <span>Edit Profile Settings</span>
            </h3>
            <button 
              type="button"
              onClick={onClose}
              className="p-1 text-muted hover:text-foreground rounded-full hover:bg-background transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col gap-4">
            {/* Live Avatar Preview */}
            <div className="flex items-center gap-3.5 p-3 rounded-card bg-background/50 border border-border/80">
              <div className="w-12 h-12 rounded-full border border-border bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent flex items-center justify-center font-serif text-base font-bold overflow-hidden shrink-0 shadow-xs">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(displayName)}</span>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate leading-tight">{displayName || 'Reader'}</span>
                <span className="text-[11px] text-muted truncate mt-0.5">
                  {avatarUrl ? 'Custom image avatar' : 'Initials-based avatar'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="px-3.5 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="px-3.5 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center justify-between border border-border p-3.5 rounded-card bg-background/30 mt-2">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  {isPublic ? <Globe size={14} className="text-primary" /> : <Lock size={14} className="text-muted" />}
                  <span>Bookshelf Visibility</span>
                </span>
                <span className="text-[11px] text-muted truncate mt-0.5">Let peers browse public collections</span>
              </div>
              
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                  isPublic ? 'bg-primary justify-end' : 'bg-border justify-start'
                }`}
              >
                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {success && (
              <span className="text-primary text-xs font-semibold text-center mt-2">✓ Settings updated successfully</span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-background/50">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-muted hover:text-foreground font-semibold px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white py-2 px-5 rounded-full text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

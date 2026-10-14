'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface GoogleAuthButtonProps {
  mode?: 'sign-in' | 'sign-up';
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.37 0 3.382 2.673 1.418 6.582l3.848 3.183z"
      />
      <path
        fill="#4285F4"
        d="M16.04 12c0-.5-.045-.982-.127-1.455H12v2.764h2.273c-.097.527-.4 1.023-.845 1.327l3.636 2.818c2.128-1.963 3.355-4.855 3.355-8.154 0-.4-.036-.79-.1-.182L16.04 12z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.955-1.073 7.936-2.918l-3.636-2.818c-1.009.673-2.3 1.073-4.3 1.073-3.3 0-6.1-2.227-7.1-5.218L1.05 17.29A11.976 11.976 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M4.9 14.127A7.086 7.086 0 0 1 4.545 12c0-.745.127-1.464.355-2.127L1.05 6.69A11.986 11.986 0 0 0 0 12c0 1.936.464 3.764 1.282 5.391l3.618-3.264z"
      />
    </svg>
  );
}

export default function GoogleAuthButton({ mode = 'sign-in' }: GoogleAuthButtonProps) {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const code = (err as { code?: string })?.code;

      if (code === 'auth/popup-closed-by-user') {
        // User voluntarily dismissed the popup window, don't show an error
        return;
      }

      if (code === 'auth/configuration-not-found') {
        setError('Google sign-in is not enabled in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable Google.');
        return;
      }

      if (code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Add localhost to Authorized Domains in Firebase Console > Authentication > Settings.');
        return;
      }

      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full border border-border bg-surface hover:bg-background dark:hover:bg-background/40 font-medium py-2.5 rounded-input text-sm flex items-center justify-center gap-2.5 transition-all text-foreground cursor-pointer shadow-sm disabled:opacity-50"
      >
        <GoogleIcon />
        {loading ? 'Connecting...' : mode === 'sign-up' ? 'Sign up with Google' : 'Continue with Google'}
      </button>
      {error && (
        <p className="text-xs text-secondary mt-1.5 text-center leading-relaxed font-medium">{error}</p>
      )}
    </div>
  );
}

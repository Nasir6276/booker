'use client';

import React, { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { isClerkConfigured } from '../../utils/clerk';
import { authService } from '../../services/auth';
import { useBookerStore } from '../../store/useBookerStore';

interface GoogleAuthButtonProps {
  mode: 'sign-in' | 'sign-up';
}

function ClerkGoogleButton({ mode }: GoogleAuthButtonProps) {
  const clerk = useClerk();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = `${origin}/sso-callback`;
      const redirectUrlComplete = `${origin}/dashboard`;

      // Use signIn.authenticateWithRedirect for Google OAuth.
      // In Clerk, OAuth sign-in automatically registers new users if they don't exist,
      // bypassing sign-up bot protection (Cloudflare Turnstile CAPTCHA) loops.
      await clerk.client.signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl,
        redirectUrlComplete,
        continueSignUp: true,
      });
    } catch (err) {
      console.error('Google auth error, trying fallback:', err);
      try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        await clerk.client.signUp.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: `${origin}/sso-callback`,
          redirectUrlComplete: `${origin}/dashboard`,
          continueSignUp: true,
        });
      } catch (fallbackErr) {
        console.error('Fallback Google auth error:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleAuth}
      disabled={loading}
      className="w-full border border-border bg-surface hover:bg-background dark:hover:bg-background/40 font-medium py-2.5 rounded-input text-sm flex items-center justify-center gap-2.5 transition-all text-foreground cursor-pointer shadow-sm disabled:opacity-50"
    >
      <GoogleIcon />
      {loading ? 'Connecting...' : 'Continue with Google'}
    </button>
  );
}

function LocalGoogleButton() {
  const router = useRouter();

  const handleLocalGoogleAuth = async () => {
    const inputEmail = window.prompt(
      'Local Auth Mode (No Clerk Keys Detected)\n\nEnter your email address to continue:',
      'user@gmail.com'
    );

    if (!inputEmail || !inputEmail.trim()) return;

    const user = await authService.signIn(inputEmail.trim());
    useBookerStore.setState({ user });
    document.cookie = `booker_session=${JSON.stringify(user)}; path=/`;
    router.push('/dashboard');
  };

  return (
    <button
      type="button"
      onClick={handleLocalGoogleAuth}
      className="w-full border border-border bg-surface hover:bg-background dark:hover:bg-background/40 font-medium py-2.5 rounded-input text-sm flex items-center justify-center gap-2.5 transition-all text-foreground cursor-pointer shadow-sm"
    >
      <GoogleIcon />
      Continue with Google
    </button>
  );
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

export default function GoogleAuthButton({ mode }: GoogleAuthButtonProps) {
  const [hasClerk] = useState(() => isClerkConfigured());

  if (hasClerk) {
    return <ClerkGoogleButton mode={mode} />;
  }

  return <LocalGoogleButton />;
}

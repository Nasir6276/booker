'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';

const signInSchema = z.object({
  identifier: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const router = useRouter();
  const { signInWithEmail, signInAsDemo } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInValues) => {
    setError(null);
    setLoading(true);

    try {
      await signInWithEmail(data.identifier, data.password);
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      console.error('Sign in error:', err);
      const code = (err as { code?: string })?.code;
      let msg = 'Failed to sign in. Please check your credentials.';

      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a few moments and try again.';
      } else if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
        msg = 'Firebase Authentication is not yet enabled in the Firebase Console (Authentication > Sign-in method). Enable Email/Password or click "Explore Demo Collection" below.';
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await signInAsDemo();
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Demo sign in error:', err);
      setError('Failed to launch demo mode.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans text-sm">
      <GoogleAuthButton mode="sign-in" />

      <div className="flex items-center gap-3 my-4">
        <div className="h-px bg-border flex-1" />
        <span className="text-[11px] uppercase tracking-wider text-muted font-medium">Or continue with email</span>
        <div className="h-px bg-border flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-input text-secondary flex items-start gap-2 text-xs font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="identifier" className="text-xs uppercase tracking-wider font-semibold text-muted">
            Email Address
          </label>
          <input
            id="identifier"
            type="email"
            placeholder="your.email@example.com"
            {...register('identifier')}
            aria-invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? 'identifier-error' : undefined}
            className="px-3.5 py-2.5 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/20"
          />
          {errors.identifier && (
            <span id="identifier-error" className="text-xs font-semibold text-secondary">
              {errors.identifier.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-muted">
              Password
            </label>
            <Link
              href="/reset-password"
              className="text-xs font-semibold text-primary hover:text-primary/80 dark:text-accent dark:hover:text-accent/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="px-3.5 py-2.5 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/20"
          />
          {errors.password && (
            <span id="password-error" className="text-xs font-semibold text-secondary">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || demoLoading}
          className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-white font-semibold py-2.5 rounded-input transition-colors mt-2 shadow-sm cursor-pointer"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="pt-2 border-t border-border/60">
        <button
          type="button"
          onClick={handleDemoMode}
          disabled={loading || demoLoading}
          className="w-full py-2.5 px-4 rounded-full border border-primary/25 hover:border-primary text-primary dark:text-accent dark:border-accent/30 dark:hover:border-accent bg-primary/5 hover:bg-primary/10 dark:bg-accent/5 dark:hover:bg-accent/10 transition-all text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Sparkles size={14} className="text-accent" />
          <span>{demoLoading ? 'Loading Demo Collection...' : 'Explore Demo Collection (Offline-Ready)'}</span>
        </button>
      </div>
    </div>
  );
}

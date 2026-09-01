'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSignIn, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { isClerkConfigured } from '../../utils/clerk';
import { authService } from '../../services/auth';
import { useBookerStore } from '../../store/useBookerStore';

const signInSchema = z.object({
  identifier: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type SignInValues = z.infer<typeof signInSchema>;

export default function SignInForm() {
  const router = useRouter();
  const [hasClerk] = useState(() => isClerkConfigured());
  const { signIn } = useSignIn();
  const { setActive } = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      if (hasClerk) {
        if (!signIn || !setActive) {
          setError('Authentication service is initializing. Please try again in a moment.');
          setLoading(false);
          return;
        }

        const result = await signIn.create({
          identifier: data.identifier,
          password: data.password,
        });

        if (result.error) {
          setError(result.error.message || 'Invalid email/username or password.');
          return;
        }

        if (signIn.createdSessionId) {
          await setActive({ session: signIn.createdSessionId });
          window.location.href = '/dashboard';
          return;
        }

        if (signIn.status === 'complete') {
          window.location.href = '/dashboard';
          return;
        }

        setError('Authentication requires further steps.');
        return;
      }

      await useBookerStore.getState().signIn(data.identifier);
      const user = useBookerStore.getState().user;
      if (user) {
        document.cookie = `booker_session=${JSON.stringify(user)}; path=/`;
      }
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Sign in error:', err);
      const firstErr = err?.errors?.[0] || err;
      const errMsg = firstErr?.longMessage || firstErr?.message || err?.message || '';
      setError(errMsg || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans text-sm">
      {error && (
        <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-input text-secondary flex items-start gap-2 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="identifier" className="text-xs uppercase tracking-wider font-semibold text-muted">
          Email or Username
        </label>
        <input
          id="identifier"
          type="text"
          placeholder="your.email@example.com or username"
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
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-white font-semibold py-2.5 rounded-input transition-colors mt-2 shadow-sm cursor-pointer"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}

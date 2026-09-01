'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSignUp, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordRequirementsChecklist from './PasswordRequirementsChecklist';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { isClerkConfigured } from '../../utils/clerk';
import { authService } from '../../services/auth';
import { useBookerStore } from '../../store/useBookerStore';

const signUpSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    username: z.string().min(2, 'Username must be at least 2 characters').optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const router = useRouter();
  const [hasClerk] = useState(() => isClerkConfigured());
  const { signUp } = useSignUp();
  const { setActive } = useClerk();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: SignUpValues) => {
    setError(null);
    setLoading(true);

    try {
      if (hasClerk) {
        if (!signUp || !setActive) {
          setError('Authentication service is initializing. Please try again in a moment.');
          setLoading(false);
          return;
        }

        const createRes = await signUp.create({
          emailAddress: data.email,
          username: data.username || undefined,
          password: data.password,
        });

        if (createRes.error) {
          const firstErr = createRes.error;
          const errCode = (firstErr as any)?.code || '';
          const errMsg = (firstErr as any)?.longMessage || firstErr?.message || '';

          if (errCode === 'form_identifier_exists') {
            setError('An account with this email or username already exists. Please sign in.');
            return;
          }

          if (errCode === 'form_password_length_too_short' || errMsg.toLowerCase().includes('characters')) {
            setError(`${errMsg} (To allow 8-character passwords, change the Minimum Length setting in your Clerk Dashboard under Configure > User & Authentication > Password Settings).`);
            return;
          }

          setError(errMsg || 'Sign up failed.');
          return;
        }

        if (signUp.createdSessionId) {
          await setActive({ session: signUp.createdSessionId });
          window.location.href = '/dashboard';
          return;
        }

        window.location.href = '/dashboard';
        return;
      }

      // Fallback for non-Clerk / local mode
      const displayName = data.username || data.email.split('@')[0];
      const user = await authService.signUp(data.email, displayName);
      useBookerStore.setState({ user });
      document.cookie = `booker_session=${JSON.stringify(user)}; path=/`;
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Sign up error:', err);
      const firstErr = err?.errors?.[0] || err;
      const errCode = firstErr?.code || '';
      const errMsg = firstErr?.longMessage || firstErr?.message || err?.message || '';

      if (errCode === 'form_identifier_exists') {
        setError('An account with this email or username already exists. Please sign in.');
        return;
      }

      if (errCode === 'form_password_length_too_short' || errMsg.toLowerCase().includes('characters')) {
        setError(`${errMsg} (To allow 8-character passwords, change the Minimum Length setting in your Clerk Dashboard under Configure > User & Authentication > Password Settings).`);
        return;
      }

      setError(errMsg || 'Sign up failed. Please check your details and try again.');
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
        <label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-muted">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className="px-3.5 py-2.5 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/20"
        />
        {errors.email && (
          <span id="email-error" className="text-xs font-semibold text-secondary">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className="text-xs uppercase tracking-wider font-semibold text-muted">
          Username <span className="text-[10px] lowercase text-muted/70">(optional)</span>
        </label>
        <input
          id="username"
          type="text"
          placeholder="johndoe"
          {...register('username')}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? 'username-error' : undefined}
          className="px-3.5 py-2.5 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/20"
        />
        {errors.username && (
          <span id="username-error" className="text-xs font-semibold text-secondary">
            {errors.username.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-muted">
          Password
        </label>
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

      <PasswordRequirementsChecklist password={passwordValue} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmPassword" className="text-xs uppercase tracking-wider font-semibold text-muted">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          className="px-3.5 py-2.5 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/20"
        />
        {errors.confirmPassword && (
          <span id="confirmPassword-error" className="text-xs font-semibold text-secondary">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-white font-semibold py-2.5 rounded-input transition-colors mt-2 shadow-sm cursor-pointer"
      >
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  );
}

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordRequirementsChecklist from './PasswordRequirementsChecklist';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { confirmPasswordReset } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../../lib/firebase';

const confirmSchema = z
  .object({
    code: z.string().min(1, 'Verification code or reset code is required'),
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

type ConfirmValues = z.infer<typeof confirmSchema>;

export default function ResetPasswordConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode') || searchParams.get('code') || '';

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      code: oobCode,
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: ConfirmValues) => {
    setError(null);
    setLoading(true);

    try {
      if (isFirebaseConfigured()) {
        await confirmPasswordReset(auth, data.code, data.password);
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (err: unknown) {
      console.error('Password reset confirmation error:', err);
      const code = (err as { code?: string })?.code;
      let msg = 'Failed to update password. The reset link or code may have expired.';

      if (code === 'auth/invalid-action-code') {
        msg = 'The reset code is invalid or has expired. Please request a new link.';
      } else if (code === 'auth/weak-password') {
        msg = 'The new password is too weak. Please use a stronger password.';
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 font-sans text-sm text-center">
        <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary dark:text-accent rounded-input flex items-start gap-2 text-xs font-semibold text-left">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Password Reset Successful</h4>
            <p className="font-normal text-[11px] opacity-90 mt-0.5">
              Your password has been updated. Redirecting you to sign in...
            </p>
          </div>
        </div>
        <Link
          href="/sign-in"
          className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 rounded-input text-center block shadow-sm"
        >
          Proceed to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans text-sm">
      {error && (
        <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-input text-secondary flex items-start gap-2 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-xs uppercase tracking-wider font-semibold text-muted">
          Reset Code
        </label>
        <input
          id="code"
          type="text"
          placeholder="Paste the reset code"
          {...register('code')}
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? 'code-error' : undefined}
          className="px-3.5 py-2.5 rounded-input border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors focus:ring-1 focus:ring-primary/20 text-center font-bold tracking-widest"
        />
        {errors.code && (
          <span id="code-error" className="text-xs font-semibold text-secondary">
            {errors.code.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-muted">
          New Password
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
          Confirm New Password
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
        {loading ? 'Updating Password...' : 'Reset Password'}
      </button>

      <div className="text-center pt-1">
        <Link
          href="/reset-password"
          className="text-xs font-semibold text-primary hover:text-primary/80 dark:text-accent dark:hover:text-accent/80 transition-colors"
        >
          Request a new link
        </Link>
      </div>
    </form>
  );
}

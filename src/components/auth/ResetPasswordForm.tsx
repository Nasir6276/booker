'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordForm() {
  const { sendPasswordReset } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ResetValues) => {
    setError(null);
    setLoading(true);

    try {
      await sendPasswordReset(data.email);
      setSubmittedEmail(data.email);
      setSuccess(true);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      const code = (err as { code?: string })?.code;
      let msg = 'Failed to send password reset email. Please try again.';

      if (code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Invalid email address.';
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
      <div className="space-y-6 font-sans text-sm text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary dark:text-accent">
          <Mail size={24} />
        </div>
        <div className="space-y-2">
          <h3 className="font-serif text-xl font-bold text-foreground">Check your inbox</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            We sent a password reset link to <span className="font-semibold text-foreground">{submittedEmail}</span>.
          </p>
        </div>

        <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary dark:text-accent rounded-input flex items-start gap-2 text-xs font-semibold text-left">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>Click the link in the email to set a new password. You can then sign in with your new credentials.</span>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/sign-in"
            className="w-full bg-primary hover:bg-primary/95 text-white font-semibold py-2.5 rounded-input text-center block shadow-sm"
          >
            Return to Sign In
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="text-xs text-muted hover:text-foreground font-semibold py-1.5 transition-colors cursor-pointer"
          >
            Resend Email
          </button>
        </div>
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-white font-semibold py-2.5 rounded-input transition-colors mt-2 shadow-sm cursor-pointer"
      >
        {loading ? 'Sending Link...' : 'Send Password Reset Link'}
      </button>

      <div className="pt-2 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

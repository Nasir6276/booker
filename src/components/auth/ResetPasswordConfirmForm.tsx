'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSignIn, useClerk } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import PasswordRequirementsChecklist from './PasswordRequirementsChecklist';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { isClerkConfigured } from '../../utils/clerk';

const confirmSchema = z
  .object({
    code: z.string().min(1, 'Verification code is required'),
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

function ClerkConfirmRunner({ values, email, onSuccess, onError }: {
  values: ConfirmValues;
  email: string;
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const { signIn } = useSignIn();
  const { setActive } = useClerk();

  useEffect(() => {
    const run = async () => {
      if (!signIn || !setActive) return;
      try {
        if (!signIn.identifier && email) {
          await signIn.create({ identifier: email });
        }

        const verifyRes = await signIn.resetPasswordEmailCode.verifyCode({
          code: values.code,
        });

        if (verifyRes.error) {
          const errMsg = verifyRes.error.message || 'Verification failed.';
          if (errMsg.toLowerCase().includes('already')) {
            // Attempt submitting password directly if code was already verified
            const submitRes = await signIn.resetPasswordEmailCode.submitPassword({
              password: values.password,
            });
            if (signIn.status === 'complete' && signIn.createdSessionId) {
              await setActive({ session: signIn.createdSessionId });
              onSuccess();
              return;
            }
          }
          onError(errMsg);
          return;
        }

        const submitRes = await signIn.resetPasswordEmailCode.submitPassword({
          password: values.password,
        });

        if (submitRes.error) {
          onError(submitRes.error.message || 'Failed to submit new password.');
          return;
        }

        if (signIn.status === 'complete' && signIn.createdSessionId) {
          await setActive({ session: signIn.createdSessionId });
          onSuccess();
        } else {
          onError('Failed to complete reset.');
        }
      } catch (err: any) {
        const errMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || '';
        onError(errMsg || 'Verification failed.');
      }
    };
    run();
  }, [values, email, signIn, setActive, onSuccess, onError]);

  return null;
}

function ClerkResendPasswordCodeRunner({ email, onSuccess, onError }: {
  email: string;
  onSuccess: () => void;
  onError: (err: string) => void;
}) {
  const { signIn } = useSignIn();

  useEffect(() => {
    const run = async () => {
      if (!signIn) return;
      try {
        if (!signIn.identifier && email) {
          await signIn.create({ identifier: email });
        }
        const sendRes = await signIn.resetPasswordEmailCode.sendCode();
        if (sendRes?.error) {
          onError(sendRes.error.message || 'Failed to resend code.');
          return;
        }
        onSuccess();
      } catch (err: any) {
        const errMsg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err?.message || '';
        onError(errMsg || 'Failed to resend code.');
      }
    };
    run();
  }, [email, signIn, onSuccess, onError]);

  return null;
}

export default function ResetPasswordConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasClerk] = useState(() => isClerkConfigured());
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pendingValues, setPendingValues] = useState<ConfirmValues | null>(null);
  const [pendingResend, setPendingResend] = useState(false);
  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: ConfirmValues) => {
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    if (hasClerk) {
      setPendingValues(data);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  const handleResendCode = () => {
    setError(null);
    setInfoMessage(null);
    setResendLoading(true);

    if (hasClerk) {
      setPendingResend(true);
    } else {
      setTimeout(() => {
        setResendLoading(false);
        setInfoMessage('A new verification code has been sent to your email.');
      }, 500);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 font-sans text-sm text-center">
        <div className="p-3.5 bg-primary/10 border border-primary/20 text-primary dark:text-accent rounded-input flex items-start gap-2 text-xs font-semibold text-left">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Password Reset Complete</h4>
            <p className="font-normal text-[11px] opacity-90 mt-0.5">
              Your password has been successfully updated. Logging you in...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans text-sm">
      {hasClerk && pendingValues && (
        <ClerkConfirmRunner
          values={pendingValues}
          email={email}
          onSuccess={() => {
            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
          }}
          onError={(msg) => {
            setError(msg);
            setLoading(false);
            setPendingValues(null);
          }}
        />
      )}

      {hasClerk && pendingResend && (
        <ClerkResendPasswordCodeRunner
          email={email}
          onSuccess={() => {
            setResendLoading(false);
            setPendingResend(false);
            setInfoMessage('A new verification code has been sent to your email.');
          }}
          onError={(msg) => {
            setResendLoading(false);
            setPendingResend(false);
            setError(msg);
          }}
        />
      )}

      {infoMessage && (
        <div className="p-3 bg-primary/10 border border-primary/20 text-primary dark:text-accent rounded-input flex items-start gap-2 text-xs font-semibold">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-input text-secondary flex items-start gap-2 text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="code" className="text-xs uppercase tracking-wider font-semibold text-muted">
          Verification Code
        </label>
        <input
          id="code"
          type="text"
          placeholder="Enter the 6-digit code"
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

      <button
        type="button"
        onClick={handleResendCode}
        disabled={resendLoading || loading}
        className="w-full text-center text-xs font-semibold text-primary hover:text-primary/80 dark:text-accent dark:hover:text-accent/80 disabled:opacity-50 transition-colors py-1 cursor-pointer"
      >
        {resendLoading ? 'Sending new code...' : 'Get another code'}
      </button>
    </form>
  );
}

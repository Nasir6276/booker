'use client';

import React from 'react';
import Link from 'next/link';
import SignInForm from '../../../components/auth/SignInForm';
import { BookOpen } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-background px-6 py-12 transition-colors duration-200">
      <div id="clerk-captcha" />
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 dark:bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand / Logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
              <BookOpen size={20} className="text-accent" />
            </div>
            <span className="font-serif text-3xl italic font-semibold text-primary dark:text-foreground">
              Booker
            </span>
          </Link>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="text-muted dark:text-muted/80 text-sm mt-1 font-sans">
            Access your personal library collection
          </p>
        </div>

        {/* Card containing authentication */}
        <div className="bg-surface dark:bg-surface border border-border rounded-card p-8 shadow-md">
          <SignInForm />
        </div>

        {/* Bottom switcher */}
        <p className="text-center text-sm text-muted font-sans font-medium">
          Don't have an account?{' '}
          <Link
            href="/sign-up"
            className="font-semibold text-primary hover:text-primary/80 dark:text-accent dark:hover:text-accent/80 transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

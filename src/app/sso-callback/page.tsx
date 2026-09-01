'use client';

import React, { useState, useEffect } from 'react';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { isClerkConfigured } from '../../utils/clerk';

function ClerkSSO() {
  return (
    <AuthenticateWithRedirectCallback 
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      continueSignUpUrl="/dashboard"
    />
  );
}

export default function SSOCallbackPage() {
  const router = useRouter();
  const [hasClerk] = useState(() => isClerkConfigured());

  useEffect(() => {
    if (!hasClerk) {
      router.push('/dashboard');
    }
  }, [hasClerk, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
      <div id="clerk-captcha" />
      <div className="flex flex-col items-center gap-4">
        {hasClerk ? <ClerkSSO /> : null}
        <h1 className="font-serif text-4xl italic text-primary animate-pulse tracking-wide">
          Booker
        </h1>
        <div className="h-1 w-24 bg-border overflow-hidden rounded-full">
          <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
        </div>
        <span className="text-xs text-muted tracking-wider uppercase font-sans mt-2">
          Completing authentication...
        </span>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

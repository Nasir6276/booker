'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-4">
        <h1 className="font-serif text-4xl italic text-primary animate-pulse tracking-wide">
          Booker
        </h1>
        <div className="h-1 w-24 bg-border overflow-hidden rounded-full">
          <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
        </div>
        <span className="text-xs text-muted tracking-wider uppercase font-sans mt-2">
          Redirecting to collection...
        </span>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

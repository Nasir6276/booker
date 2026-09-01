import React from 'react';
import { redirect } from 'next/navigation';

const checkClerkConfigured = () => {
  const secKey = process.env.CLERK_SECRET_KEY;
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!secKey || !pubKey) return false;
  if (secKey.includes('mock') || secKey.includes('development')) return false;
  if (pubKey.includes('mock') || pubKey.includes('d29ya2luZy13b2xmLTkz')) return false;
  return secKey.startsWith('sk_');
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (checkClerkConfigured()) {
    try {
      const { auth } = await import('@clerk/nextjs/server');
      const { userId } = await auth();

      if (!userId) {
        redirect('/sign-in?redirect=/dashboard');
      }
    } catch {
      // Fall through on Clerk errors in dev
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {children}
    </div>
  );
}

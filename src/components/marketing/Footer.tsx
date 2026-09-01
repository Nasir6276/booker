'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border/80 transition-colors duration-200 py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left branding */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white">
            <BookOpen size={14} className="text-accent" />
          </div>
          <span className="font-serif text-lg italic font-semibold text-primary dark:text-foreground">
            Booker
          </span>
          <span className="text-[10px] text-muted font-sans border-l border-border/60 pl-2">
            © {currentYear} Booker Inc. All rights reserved.
          </span>
        </div>

        {/* Right navigation links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted font-medium font-sans">
          <a
            href="/legal/terms.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Terms
            <ExternalLink size={10} className="opacity-60" />
          </a>
          <a
            href="/legal/privacy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Privacy
            <ExternalLink size={10} className="opacity-60" />
          </a>
          <Link
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            About Us
          </Link>
          <button
            onClick={() => alert("Cookie Preference:\nWe only store local configuration tokens for theme and mock authentication session parameters. No tracking cookies are used.")}
            className="hover:text-foreground transition-colors cursor-pointer text-left"
          >
            Cookies
          </button>
        </div>
      </div>
    </footer>
  );
}

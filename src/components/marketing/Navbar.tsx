'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Moon, Sun, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load theme from localStorage or system preference
    const savedTheme = localStorage.getItem('booker_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('booker_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/80 dark:bg-surface/80 backdrop-blur-md border-b border-border shadow-sm py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-200">
            <BookOpen size={18} className="text-accent" />
          </div>
          <div>
            <span className="font-serif text-2xl italic font-semibold text-primary dark:text-foreground tracking-wide">
              Booker
            </span>
            <span className="hidden sm:inline-block text-[10px] text-muted tracking-wider uppercase font-sans ml-2">
              Library Manager
            </span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            How it Works
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium text-muted hover:text-foreground transition-colors"
          >
            Reviews
          </Link>
          
          <div className="h-4 w-px bg-border my-auto" />

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-foreground rounded-full hover:bg-background/50 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* CTAs */}
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="text-sm font-semibold text-primary hover:text-primary/80 dark:text-foreground dark:hover:text-foreground/80 px-4 py-2 hover:bg-background/30 rounded-full transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-primary hover:bg-primary/95 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
            >
              Get Started
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-foreground rounded-full hover:bg-background/50 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-muted hover:text-foreground rounded-full hover:bg-background/50 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-surface dark:bg-surface border-b border-border overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link
                href="#features"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-muted hover:text-foreground py-2 border-b border-border/50"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-muted hover:text-foreground py-2 border-b border-border/50"
              >
                How it Works
              </Link>
              <Link
                href="#testimonials"
                onClick={() => setIsOpen(false)}
                className="text-base font-medium text-muted hover:text-foreground py-2 border-b border-border/50"
              >
                Reviews
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Show when="signed-out">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 font-semibold text-primary dark:text-foreground border border-border rounded-full hover:bg-background/30 transition-all block"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2.5 font-semibold bg-primary text-white rounded-full shadow hover:bg-primary/95 transition-all block"
                  >
                    Get Started
                  </Link>
                </Show>
                <Show when="signed-in">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted">Account</span>
                    <UserButton />
                  </div>
                </Show>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

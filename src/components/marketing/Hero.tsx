'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Library, Users, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-background transition-colors duration-200">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-48 -mt-24" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 dark:bg-secondary/5 rounded-full blur-3xl pointer-events-none -ml-48 -mb-24" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left text column */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 text-primary dark:text-accent text-xs font-semibold tracking-wide uppercase"
          >
            <Sparkles size={12} />
            Your Entire Library, Sorted
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
          >
            A minimalist space for the books you <span className="italic text-primary dark:text-accent font-semibold">love</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted dark:text-muted/80 text-lg md:text-xl font-sans max-w-xl mx-auto lg:mx-0"
          >
            Track ownership, manage lendings, and design reading lists inside a clean, offline-first dashboard designed for readers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
          >
            <Link
              href="/sign-up"
              className="group w-full sm:w-auto bg-primary hover:bg-primary/95 text-white font-semibold px-8 py-3.5 rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              Get Started for Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto text-center text-muted hover:text-foreground font-semibold px-6 py-3.5 hover:bg-surface/50 border border-transparent hover:border-border rounded-full transition-all"
            >
              See how it works
            </Link>
          </motion.div>
        </div>

        {/* Right dashboard mockup/illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="lg:col-span-6 flex justify-center w-full"
        >
          <div className="w-full max-w-lg bg-surface dark:bg-surface border border-border/80 rounded-card shadow-2xl p-6 relative overflow-hidden transition-colors duration-200">
            {/* Topbar of mock window */}
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary/80" />
                <span className="w-3 h-3 rounded-full bg-accent/80" />
                <span className="w-3 h-3 rounded-full bg-primary/30" />
              </div>
              <div className="text-xs text-muted font-sans font-medium flex items-center gap-1.5 px-3 py-1 bg-background rounded-full border border-border/40">
                <Library size={12} className="text-primary" />
                My Personal Library
              </div>
            </div>

            {/* Content Mock layout */}
            <div className="space-y-4 font-sans text-sm">
              {/* Header stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-background dark:bg-background/40 p-3 rounded-card border border-border/40 text-center">
                  <span className="text-muted text-[10px] uppercase font-semibold tracking-wider">Total</span>
                  <div className="text-xl font-bold text-foreground">148</div>
                </div>
                <div className="bg-background dark:bg-background/40 p-3 rounded-card border border-border/40 text-center">
                  <span className="text-muted text-[10px] uppercase font-semibold tracking-wider">Lent Out</span>
                  <div className="text-xl font-bold text-secondary">5</div>
                </div>
                <div className="bg-background dark:bg-background/40 p-3 rounded-card border border-border/40 text-center">
                  <span className="text-muted text-[10px] uppercase font-semibold tracking-wider">Wishlist</span>
                  <div className="text-xl font-bold text-accent">14</div>
                </div>
              </div>

              {/* Book List Mock */}
              <div className="space-y-2.5">
                <div className="p-3 bg-background dark:bg-background/20 rounded-card border border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-primary/20 dark:bg-primary/30 border border-primary/20 rounded flex items-center justify-center font-serif text-[10px] font-bold text-primary dark:text-accent">TS</div>
                    <div>
                      <div className="font-semibold text-foreground">The Stranger</div>
                      <div className="text-[11px] text-muted">Albert Camus • Fiction</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-accent font-semibold border border-primary/10">Bought</span>
                </div>

                <div className="p-3 bg-background dark:bg-background/20 rounded-card border border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-secondary/10 border border-secondary/20 rounded flex items-center justify-center font-serif text-[10px] font-bold text-secondary">LP</div>
                    <div>
                      <div className="font-semibold text-foreground">The Little Prince</div>
                      <div className="text-[11px] text-muted">A. de Saint-Exupéry • Children</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary font-semibold border border-secondary/10">Lent to Sophia</span>
                </div>

                <div className="p-3 bg-background dark:bg-background/20 rounded-card border border-border/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-10 bg-accent/15 border border-accent/25 rounded flex items-center justify-center font-serif text-[10px] font-bold text-accent">MB</div>
                    <div>
                      <div className="font-semibold text-foreground">Madame Bovary</div>
                      <div className="text-[11px] text-muted">Gustave Flaubert • Fiction</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-accent font-semibold border border-primary/10">Bought</span>
                </div>
              </div>
            </div>

            {/* Glowing Accent Ring decoration */}
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-accent/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

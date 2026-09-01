'use client';

import React from 'react';
import { Check, X, Shield, Cpu, RefreshCw, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Differentiators() {
  const comparison = {
    booker: [
      { text: 'Auto-categorization & suggestions', yes: true },
      { text: 'Lending status & return reminders', yes: true },
      { text: '100% Offline-first local storage', yes: true },
      { text: 'Custom colored shelves & progress bars', yes: true },
      { text: 'Invite-only social book exchange', yes: true },
    ],
    spreadsheet: [
      { text: 'Manual typing of everything', yes: false },
      { text: 'No dates tracking or reminder alarms', yes: false },
      { text: 'Breaks without an internet connection', yes: false },
      { text: 'Clunky grid cell coloring', yes: false },
      { text: 'Zero privacy control or sharing workflow', yes: false },
    ]
  };

  const differentiators = [
    {
      title: 'Offline-First Speed',
      description: 'Your library is stored in IndexedDB instantly. Access and manage your books anywhere—even without wifi.',
      icon: <RefreshCw className="text-primary dark:text-accent" size={20} />
    },
    {
      title: 'Invite-Only Circles',
      description: 'Booker is completely private by default. Share reading lists and lent statuses only with people you trust.',
      icon: <EyeOff className="text-secondary" size={20} />
    },
    {
      title: 'Auto Categorization',
      description: 'Enter a book title or author, and get suggestions. Categorize your catalog in seconds instead of hours.',
      icon: <Cpu className="text-primary dark:text-accent" size={20} />
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-background transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            What makes Booker different?
          </h2>
          <p className="text-muted dark:text-muted/80 font-sans">
            Built from the ground up for readers, not data scientists.
          </p>
        </div>

        {/* Booker vs Spreadsheet comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">
          {/* Booker card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 bg-surface dark:bg-surface border-2 border-primary/20 rounded-card p-8 shadow-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="font-serif text-2xl font-bold text-primary dark:text-accent mb-6 flex items-center gap-2">
              Booker
              <span className="text-[10px] uppercase bg-primary/10 text-primary dark:text-accent font-bold px-2 py-0.5 rounded-full border border-primary/10">Made for Books</span>
            </h3>
            
            <ul className="space-y-4">
              {comparison.booker.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-accent shrink-0">
                    <Check size={12} />
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Spreadsheet card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 bg-surface/50 dark:bg-surface/30 border border-border/80 rounded-card p-8 opacity-75"
          >
            <h3 className="font-serif text-2xl font-bold text-muted mb-6 flex items-center gap-2">
              A Spreadsheet
              <span className="text-[10px] uppercase bg-muted/10 text-muted font-bold px-2 py-0.5 rounded-full">General Purpose</span>
            </h3>
            
            <ul className="space-y-4">
              {comparison.spreadsheet.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm text-muted">
                  <div className="w-5 h-5 rounded-full bg-secondary/5 flex items-center justify-center text-secondary shrink-0 border border-secondary/10">
                    <X size={12} className="text-secondary/70" />
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Small benefit grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {differentiators.map((diff, idx) => (
            <div key={idx} className="space-y-3 font-sans">
              <div className="w-10 h-10 rounded-full bg-primary/5 dark:bg-primary/15 border border-primary/10 flex items-center justify-center">
                {diff.icon}
              </div>
              <h4 className="font-serif text-lg font-bold text-foreground">{diff.title}</h4>
              <p className="text-sm text-muted leading-relaxed">{diff.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

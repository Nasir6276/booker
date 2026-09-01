'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Shield, Star, BookOpen, Clock } from 'lucide-react';

interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  benefits: string[];
  ctaText: string;
  mockup: React.ReactNode;
}

export default function FeatureShowcase() {
  const features: FeatureItem[] = [
    {
      id: 'track',
      badge: 'Collection Management',
      title: 'Track your collection with absolute precision.',
      description: 'Enter a book in under a minute. Our database automatically helps you organize by genre, format, and ownership type. Store editions, publisher info, and cover details.',
      benefits: [
        'Instant search & robust filters',
        'Custom format & location tagging',
        'Offline-first: access your catalog anywhere'
      ],
      ctaText: 'Start cataloging',
      mockup: (
        <div className="w-full bg-surface dark:bg-surface border border-border rounded-card p-6 shadow-xl relative overflow-hidden font-sans">
          {/* Card Mock for Book detail */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:text-accent font-semibold">Fiction</span>
              <h3 className="font-serif text-2xl font-bold text-foreground mt-1.5">The Stranger</h3>
              <p className="text-sm text-muted">Albert Camus</p>
            </div>
            <div className="flex gap-1">
              <Star size={14} className="text-accent fill-accent" />
              <Star size={14} className="text-accent fill-accent" />
              <Star size={14} className="text-accent fill-accent" />
              <Star size={14} className="text-accent fill-accent" />
              <Star size={14} className="text-muted/40" />
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed mb-4">
            An existentialist masterpiece following Meursault, an indifferent French Algerian who apathy-driven commits a murder.
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs border-t border-border/50 pt-4">
            <div>
              <span className="text-[10px] uppercase text-muted font-semibold block">Publisher</span>
              <span className="font-medium text-foreground">Gallimard</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted font-semibold block">Year</span>
              <span className="font-medium text-foreground">1942</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted font-semibold block">Ownership</span>
              <span className="font-medium text-primary dark:text-accent">Bought (Paperback)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-muted font-semibold block">Pages</span>
              <span className="font-medium text-foreground">123 pages</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'borrow',
      badge: 'Lending Tracker',
      title: 'Never lose a borrowed book again.',
      description: "Keep tabs on who has what. Assign books to friends, log return dates, and get automated indicators when items are overdue. A simple timeline keeps everyone accountable.",
      benefits: [
        'Overdue status visual indicators',
        'Borrower name & date logger',
        'Return receipt notes'
      ],
      ctaText: 'Manage loans',
      mockup: (
        <div className="w-full bg-surface dark:bg-surface border border-border rounded-card p-6 shadow-xl relative overflow-hidden font-sans">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Clock size={16} className="text-secondary" />
              Lending Activity
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-semibold border border-secondary/10">Active Loan</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-foreground">The Little Prince</h4>
                <p className="text-xs text-muted">Lent to <span className="font-semibold text-foreground">Sophia</span></p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-muted block font-semibold">Due Date</span>
                <span className="text-xs text-secondary font-semibold">June 15, 2026</span>
              </div>
            </div>

            <div className="p-3 bg-secondary/5 border border-secondary/10 rounded-card text-xs text-secondary flex items-start gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 shrink-0" />
              <span>Overdue by 26 days. Sophia promised to return it after finishing the last chapter.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'lists',
      badge: 'Curated Playlists',
      title: 'Curate custom lists for your reading goals.',
      description: 'Group books into dynamic, beautiful collections with personalized color codes. Drag and drop books in your lists, track your reading progress, and build your perfect seasonal lineup.',
      benefits: [
        'Custom color coding per list',
        'Progress bar indicators',
        'Flexible custom sorting order'
      ],
      ctaText: 'Build lists',
      mockup: (
        <div className="w-full bg-surface dark:bg-surface border border-border rounded-card p-6 shadow-xl relative overflow-hidden font-sans">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-serif text-lg font-bold text-foreground">French Classics</h4>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-accent">2 / 4 Read</span>
          </div>

          <div className="w-full bg-border/40 dark:bg-border/20 h-1.5 rounded-full overflow-hidden mb-5">
            <div className="w-1/2 h-full bg-primary dark:bg-accent rounded-full" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs p-2.5 bg-background dark:bg-background/20 rounded-input border border-border/40">
              <span className="font-medium text-foreground">1. The Stranger</span>
              <span className="text-[10px] text-primary dark:text-accent font-semibold">Completed</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 bg-background dark:bg-background/20 rounded-input border border-border/40">
              <span className="font-medium text-foreground">2. Madame Bovary</span>
              <span className="text-[10px] text-primary dark:text-accent font-semibold">Completed</span>
            </div>
            <div className="flex items-center justify-between text-xs p-2.5 bg-background dark:bg-background/20 rounded-input border border-border/40 opacity-70">
              <span className="font-medium text-foreground">3. Les Misérables</span>
              <span className="text-[10px] text-muted">Reading</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-20 md:py-28 bg-background relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 space-y-20 md:space-y-28">
        {features.map((feature, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={feature.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center`}
            >
              {/* Text column */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className={`lg:col-span-6 space-y-6 ${!isEven ? 'lg:order-2' : ''}`}
              >
                <span className="inline-block text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-accent font-bold uppercase tracking-wider">
                  {feature.badge}
                </span>
                <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted dark:text-muted/80 text-base md:text-lg leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-2.5">
                  {feature.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-accent shrink-0">
                        <Check size={12} />
                      </div>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  <Link
                    href="/sign-up"
                    className="group inline-flex items-center gap-2 bg-primary hover:bg-primary/95 text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all"
                  >
                    {feature.ctaText}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>

              {/* Mockup Column */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
                className={`lg:col-span-6 flex justify-center ${!isEven ? 'lg:order-1' : ''}`}
              >
                <div className="w-full max-w-md bg-background dark:bg-background/20 p-2 border border-border/50 rounded-card flex items-center justify-center">
                  {feature.mockup}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Layers, Bell } from 'lucide-react';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      number: 'Step 1',
      title: 'Add your books',
      description: 'Enter a book in under a minute, with genre auto-categorization and publisher autocomplete support.',
      icon: <PlusCircle className="text-primary dark:text-accent" size={24} />
    },
    {
      number: 'Step 2',
      title: 'Track & organize',
      description: 'Manage ownership types, lending status, and custom color-coded reading lists in one clean dashboard.',
      icon: <Layers className="text-primary dark:text-accent" size={24} />
    },
    {
      number: 'Step 3',
      title: 'Never lose track',
      description: 'Get clear visual flags for overdue borrow dates and return reminders, so you always know where your copies are.',
      icon: <Bell className="text-secondary" size={24} />
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-surface dark:bg-background/20 border-y border-border/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            How does it work?
          </h2>
          <p className="text-muted dark:text-muted/80 font-sans">
            Getting your library under control is simple and takes just minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-background dark:bg-surface border border-border/60 rounded-card p-6 relative flex flex-col items-start gap-4 shadow-sm hover:shadow transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-primary/5 dark:bg-primary/15 border border-primary/10 flex items-center justify-center">
                {step.icon}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1">
                  {step.number}
                </span>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>

              {/* Step indicator arrow for large screens */}
              {idx < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-px bg-border/80 z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

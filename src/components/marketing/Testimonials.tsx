'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

interface Testimonial {
  tag: string;
  quote: string;
  name: string;
  role: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      tag: 'Stay organized',
      quote: '“I finally cleared out my double-buys. The search and filter tools work flawlessly, especially when I’m at local bookstores scanning my lists.”',
      name: '[Reader Name]',
      role: '[Avid Collector]'
    },
    {
      tag: 'Saves time',
      quote: '“Auto-categorization saves me from typing every publisher and year manually. It categorized 50 of my classics in just a single sitting.”',
      name: '[Cataloger Name]',
      role: '[Minimalist Reader]'
    },
    {
      tag: 'Easy to use',
      quote: '“Keeping track of books lent to friends was a nightmare of text messages. Booker handles dates and status visually in one simple timeline.”',
      name: '[Borrower Name]',
      role: '[Book club lead]'
    }
  ];

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-surface dark:bg-background/20 border-y border-border/50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            What early readers say
          </h2>
          <p className="text-muted dark:text-muted/80 font-sans">
            Read stories from catalogers who replaced spreadsheets and sticky notes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-background dark:bg-surface border border-border/60 rounded-card p-6 flex flex-col justify-between gap-6 shadow-sm relative group"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Quote size={20} className="text-primary/20 dark:text-accent/20 group-hover:text-primary/40 dark:group-hover:text-accent/40 transition-colors" />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-accent border border-primary/5">
                    {test.tag}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed italic font-sans">
                  {test.quote}
                </p>
              </div>

              <div className="border-t border-border/50 pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center font-serif text-xs font-bold text-primary dark:text-accent">
                  {test.name.charAt(1)}
                </div>
                <div>
                  <span className="text-xs font-bold text-foreground block font-sans">{test.name}</span>
                  <span className="text-[10px] text-muted block font-sans">{test.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

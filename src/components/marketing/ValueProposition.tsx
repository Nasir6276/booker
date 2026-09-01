'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ValueProposition() {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <p className="text-xl md:text-2xl text-muted/95 dark:text-muted/85 font-sans leading-relaxed">
            You have books everywhere: on shelves, under bedside tables, in boxes. 
            And no clear way to know what you actually own, what's currently lent out, or what you want to read next.
          </p>
          
          <div className="h-0.5 w-12 bg-border mx-auto my-6" />
          
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-primary dark:text-accent">
            This is where your library gets organized.
          </h2>
        </motion.div>
      </div>
    </section>
  );
}

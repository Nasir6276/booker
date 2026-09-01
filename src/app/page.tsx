'use client';

import React from 'react';
import Navbar from '../components/marketing/Navbar';
import Hero from '../components/marketing/Hero';
import ValueProposition from '../components/marketing/ValueProposition';
import FeatureShowcase from '../components/marketing/FeatureShowcase';
import HowItWorks from '../components/marketing/HowItWorks';
import Differentiators from '../components/marketing/Differentiators';
import Testimonials from '../components/marketing/Testimonials';
import Footer from '../components/marketing/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <ValueProposition />
        <FeatureShowcase />
        <HowItWorks />
        <Differentiators />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}

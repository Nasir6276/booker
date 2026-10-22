'use client';

import React from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { Book } from '../types';
import { 
  BookOpen, 
  Calendar, 
  UserCheck, 
  TrendingUp, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getInitials as getUserInitials } from '../utils/initials';

interface DashboardViewProps {
  onOpenAddModal: () => void;
}

export default function DashboardView({ onOpenAddModal }: DashboardViewProps) {
  const { user, books, setActiveTab, setSelectedBookId } = useBookerStore();
  
  const activeBooks = books.filter(b => !b.is_deleted);
  
  // Calculate Stats
  const totalCount = activeBooks.length;
  const boughtCount = activeBooks.filter(b => b.ownership_type === 'bought').length;
  const borrowedCount = activeBooks.filter(b => b.ownership_type === 'borrowed').length;
  const lentCount = activeBooks.filter(b => b.borrower_name).length;
  
  // Books that are currently lent out and not returned
  const pendingLentBooks = activeBooks.filter(
    b => b.borrower_name && b.borrow_status === 'not_returned'
  );

  // Sorting recent books
  const recentBooks = [...activeBooks]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Overdue calculation helper
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getInitials = (title: string, author: string) => {
    return (
      (title.charAt(0) || '') + (author.charAt(0) || '')
    ).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full border border-border bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent flex items-center justify-center font-serif text-base font-bold overflow-hidden shadow-xs shrink-0">
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
            ) : (
              <span>{getUserInitials(user?.display_name)}</span>
            )}
          </div>
          <div>
            <h2 className="font-serif text-2xl md:text-3xl italic font-semibold text-primary">
              Welcome back, {user?.display_name || 'Reader'}
            </h2>
            <p className="text-muted text-xs md:text-sm mt-0.5">Le Cabinet — A curated look at your library collection</p>
          </div>
        </div>
        
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white py-2.5 px-4 rounded-full text-sm font-semibold shadow-sm hover:shadow transition-all group duration-200 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
          <span>Add a Book</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Books', value: totalCount, icon: BookOpen, color: 'text-primary' },
          { label: 'Purchased', value: boughtCount, icon: TrendingUp, color: 'text-accent' },
          { label: 'Borrowed', value: borrowedCount, icon: Calendar, color: 'text-primary/70' },
          { label: 'Lent Out', value: lentCount, icon: UserCheck, color: 'text-secondary' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.label}
            className="bg-surface border border-border p-5 rounded-card flex flex-col justify-between h-28"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-muted">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <span className="font-serif text-4xl font-semibold leading-none">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Dashboard Main Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent & Reading Progress */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Reading Progress Card */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-surface border border-border p-6 rounded-card relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col gap-1 max-w-sm">
                <span className="text-xs uppercase tracking-wider font-semibold text-muted">Reading Curation</span>
                <h3 className="font-serif text-2xl font-bold">Your Reading Habit</h3>
                <p className="text-sm text-muted mt-1">
                  You own {boughtCount} books and currently have {borrowedCount} borrowed titles. Keep tracking to cultivate your literary cabinet.
                </p>
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className="flex items-center gap-1.5 text-primary text-xs font-semibold hover:underline mt-4 cursor-pointer"
                >
                  <span>View entire catalog</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Minimalist circular progress chart */}
              <div className="flex items-center justify-center shrink-0 w-28 h-28 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="stroke-border"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="44"
                    className="stroke-primary"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={276}
                    strokeDashoffset={totalCount > 0 ? 276 - (276 * Math.min(boughtCount, totalCount)) / Math.max(totalCount, 1) : 276}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-serif text-xl font-bold text-primary">
                    {totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0}%
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-muted mt-0.5">Owned</span>
                </div>
              </div>
            </div>
            
            {/* Background design accents */}
            <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          </motion.div>

          {/* Recent Additions */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-semibold">Recent Additions</h3>
              <button 
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-muted hover:text-foreground font-medium underline"
              >
                See All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentBooks.length > 0 ? (
                recentBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => { setSelectedBookId(book.id); setActiveTab('inventory'); }}
                    className="bg-surface border border-border p-4 rounded-card hover:border-primary/45 transition-colors cursor-pointer group flex flex-col gap-3"
                  >
                    {/* Book spine mockup */}
                    <div className="w-full h-32 bg-background border border-border rounded-md flex items-center justify-center relative overflow-hidden group-hover:shadow-sm transition-shadow">
                      {book.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                          <span className="font-serif text-lg font-bold text-primary/40">{getInitials(book.title, book.author)}</span>
                        </div>
                      )}
                      <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary/20 border-r border-black/5" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h4 className="font-serif text-sm font-semibold truncate group-hover:text-primary transition-colors leading-snug">{book.title}</h4>
                      <p className="text-xs text-muted truncate mt-0.5">{book.author}</p>
                      <span className="text-[10px] uppercase font-bold text-accent tracking-wider mt-1">{book.genre}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="md:col-span-3 border border-dashed border-border py-12 text-center rounded-card text-muted">
                  <BookOpen size={24} className="mx-auto mb-2 text-border" />
                  <p className="text-sm">Your library is currently empty.</p>
                  <button onClick={onOpenAddModal} className="text-xs text-primary underline mt-1 font-semibold">Add your first book</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Borrowing & Lending Alerts */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-xl font-semibold">Borrowing Reminders</h3>
            
            <div className="bg-surface border border-border rounded-card divide-y divide-border">
              {pendingLentBooks.length > 0 ? (
                pendingLentBooks.map((book) => {
                  const overdue = isOverdue(book.return_date);
                  return (
                    <div 
                      key={book.id} 
                      onClick={() => { setSelectedBookId(book.id); setActiveTab('inventory'); }}
                      className="p-4 hover:bg-background/40 transition-colors cursor-pointer flex items-start justify-between gap-3 group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-serif text-sm font-semibold group-hover:text-primary transition-colors truncate leading-snug">
                          {book.title}
                        </span>
                        <span className="text-xs text-muted mt-0.5">
                          Lent to <strong className="text-foreground/80 font-medium">{book.borrower_name}</strong>
                        </span>
                        {book.return_date && (
                          <div className={`flex items-center gap-1 text-[11px] mt-2 ${overdue ? 'text-secondary font-semibold animate-pulse' : 'text-muted'}`}>
                            <Calendar size={12} />
                            <span>Due: {formatDate(book.return_date)} {overdue && '(Overdue)'}</span>
                          </div>
                        )}
                      </div>
                      
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border uppercase tracking-wider ${
                        overdue 
                          ? 'bg-secondary/10 border-secondary/20 text-secondary' 
                          : 'bg-accent/10 border-accent/20 text-accent-hover text-amber-700 dark:text-accent'
                      }`}>
                        {overdue ? 'Lent Overdue' : 'Lent Out'}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-muted">
                  <UserCheck size={20} className="mx-auto mb-2 text-border" />
                  <p className="text-xs">No pending book return dates.</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">When you lend books, tracking them here prevents loss.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

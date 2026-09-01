'use client';

import React, { useState } from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { Trash2, RotateCcw, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

export default function TrashView() {
  const { books, restoreBook, permanentlyDeleteBook } = useBookerStore();
  const [bookToPurge, setBookToPurge] = useState<{ id: string; title: string } | null>(null);
  
  const deletedBooks = books.filter(b => b.is_deleted);

  const handleRestore = async (id: string, title: string) => {
    await restoreBook(id);
  };

  const handlePermanentDelete = (id: string, title: string) => {
    setBookToPurge({ id, title });
  };

  const getDaysRemaining = (deletedAtString?: string) => {
    if (!deletedAtString) return 30;
    const deletedDate = new Date(deletedAtString);
    const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getInitials = (title: string, author: string) => {
    return ((title.charAt(0) || '') + (author.charAt(0) || '')).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-semibold text-primary">Recycle Bin</h2>
        <p className="text-muted text-sm mt-0.5">Recover books deleted within the last 30 days</p>
      </div>

      {/* Info Warning Banner */}
      <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-card flex items-start gap-3">
        <AlertCircle className="text-secondary shrink-0 mt-0.5" size={16} />
        <div className="text-xs text-black dark:text-stone-300">
          <p className="font-semibold text-black dark:text-white mb-0.5">Automatic 30-Day Cleanup Window</p>
          <p>Any volume left in this cabinet for more than 30 days is permanently purged from IndexedDB files. Make sure to restore elements before their expiration dates.</p>
        </div>
      </div>

      {/* List of deleted books */}
      <AnimatePresence mode="popLayout">
        {deletedBooks.length > 0 ? (
          <motion.div 
            layout 
            className="bg-surface border border-border rounded-card divide-y divide-border overflow-hidden"
          >
            {deletedBooks.map((book) => {
              const daysLeft = getDaysRemaining(book.deleted_at);
              return (
                <motion.div
                  layout
                  key={book.id}
                  exit={{ opacity: 0, height: 0, padding: 0 }}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Cover spine mockup */}
                    <div className="w-8 h-12 bg-background border border-border rounded flex items-center justify-center shrink-0 overflow-hidden relative opacity-70">
                      {book.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-[10px] font-bold text-primary/45">{getInitials(book.title, book.author)}</span>
                      )}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 border-r border-black/5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-semibold truncate text-muted-foreground">{book.title}</h4>
                      <span className="text-xs text-muted truncate">{book.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                    <span className="text-[11px] text-secondary font-semibold bg-secondary/10 px-3 py-1 border border-secondary/20 rounded-full flex items-center gap-1.5">
                      <Info size={11} />
                      <span>{daysLeft} days remaining</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(book.id, book.title)}
                        className="flex items-center gap-1 border border-border hover:bg-background text-muted hover:text-foreground font-semibold px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer"
                        title="Restore Book"
                      >
                        <RotateCcw size={12} />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(book.id, book.title)}
                        className="flex items-center gap-1 text-white bg-secondary hover:bg-secondary/95 font-bold px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer shadow-sm hover:shadow"
                        title="Delete Permanently"
                      >
                        <Trash2 size={12} />
                        <span>Purge</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed border-border py-16 text-center rounded-card text-muted"
          >
            <Trash2 size={28} className="mx-auto mb-2 text-border" />
            <p className="text-sm">Recycle Bin is empty.</p>
            <p className="text-xs text-muted-foreground mt-0.5">Books you soft-delete will wait here for recovery options.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!bookToPurge}
        title="Permanently Purge Book"
        message={bookToPurge ? `Are you absolutely sure you want to PERMANENTLY delete "${bookToPurge.title}"? This action is irreversible and will remove all reading list references.` : ''}
        confirmLabel="Permanently Delete"
        isDangerous={true}
        onConfirm={async () => {
          if (bookToPurge) {
            await permanentlyDeleteBook(bookToPurge.id);
            setBookToPurge(null);
          }
        }}
        onCancel={() => setBookToPurge(null)}
      />
    </div>
  );
}

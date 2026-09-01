'use client';

import React, { useEffect, useState } from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { Book, ReadList } from '../types';
import { X, Edit2, Trash2, Calendar, ShoppingBag, BookOpen, Bookmark, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { dbService } from '../services/db';
import ConfirmModal from './ConfirmModal';
import { getCurrencySymbol } from '../utils/currencies';

interface BookDetailProps {
  bookId: string;
  onClose: () => void;
  onEdit: () => void;
}

export default function BookDetail({ bookId, onClose, onEdit }: BookDetailProps) {
  const { books, softDeleteBook, readLists, fetchBooks, updateBook } = useBookerStore();
  const [bookLists, setBookLists] = useState<ReadList[]>([]);
  const [showListSelector, setShowListSelector] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const book = books.find(b => b.id === bookId);

  useEffect(() => {
    async function loadBookLists() {
      if (bookId) {
        const lists = await dbService.getReadListsForBook(bookId);
        setBookLists(lists);
      }
    }
    loadBookLists();
  }, [bookId, books]);

  if (!book) return null;

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    await softDeleteBook(book.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleToggleList = async (listId: string) => {
    const belongs = bookLists.some(l => l.id === listId);
    if (belongs) {
      await dbService.removeBookFromReadList(book.id, listId);
      setBookLists(prev => prev.filter(l => l.id !== listId));
    } else {
      await dbService.addBookToReadList(book.id, listId);
      const targetList = readLists.find(l => l.id === listId);
      if (targetList) {
        setBookLists(prev => [...prev, targetList]);
      }
    }
    await fetchBooks();
  };

  const getInitials = (title: string, author: string) => {
    return ((title.charAt(0) || '') + (author.charAt(0) || '')).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-45 flex items-center justify-end bg-black/30 backdrop-blur-xs p-0">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-lg h-full bg-surface border-l border-border shadow-2xl flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
          <span className="text-xs uppercase tracking-wider font-semibold text-muted">Archival Card</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={onEdit}
              className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-colors"
              title="Edit Details"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 text-secondary hover:bg-secondary/10 rounded-full transition-colors"
              title="Soft Delete"
            >
              <Trash2 size={16} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-colors ml-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 select-text">
          {/* Main Info */}
          <div className="flex gap-6 items-start">
            {/* Book spine/cover mockup */}
            <div className="w-24 h-36 bg-background border border-border rounded-md flex items-center justify-center relative shrink-0 overflow-hidden shadow-sm">
              {book.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <span className="font-serif text-2xl font-bold text-primary/45">{getInitials(book.title, book.author)}</span>
              )}
              <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-primary/20 border-r border-black/5" />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] uppercase font-bold text-secondary tracking-widest">{book.genre}</span>
              <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight break-words">{book.title}</h2>
              <span className="text-base text-muted-foreground italic font-sans">{book.author}</span>
              
              {book.language && (
                <span className="text-xs text-muted mt-2">Written in {book.language}</span>
              )}
            </div>
          </div>

          <hr className="border-border/60" />

          {/* Description */}
          {book.description && (
            <div className="flex flex-col gap-2">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted">Synopsis</h4>
              <p className="text-sm text-foreground/90 leading-relaxed font-sans italic">
                “ {book.description} ”
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-border/80 p-4 rounded-card bg-background/30">
            {book.pages && (
              <div className="flex flex-col gap-1">
                <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Volume size</span>
                <span className="font-semibold text-sm">{book.pages} pages</span>
              </div>
            )}
            {book.publisher && (
              <div className="flex flex-col gap-1">
                <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Publisher</span>
                <span className="font-semibold text-sm">{book.publisher}</span>
              </div>
            )}
            {book.publication_year && (
              <div className="flex flex-col gap-1">
                <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Publication Year</span>
                <span className="font-semibold text-sm">{book.publication_year}</span>
              </div>
            )}
            {book.isbn && (
              <div className="flex flex-col gap-1">
                <span className="text-muted font-medium uppercase tracking-wider text-[10px]">ISBN</span>
                <span className="font-semibold text-sm tracking-wide">{book.isbn}</span>
              </div>
            )}
            {book.edition && (
              <div className="flex flex-col gap-1 col-span-2">
                <span className="text-muted font-medium uppercase tracking-wider text-[10px]">Edition copy</span>
                <span className="font-semibold text-sm">{book.edition}</span>
              </div>
            )}
          </div>

          {/* Provenance & Lending tracking */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-muted">Provenance & Tracking</h4>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2.5 text-xs">
                <ShoppingBag size={14} className="text-primary" />
                <span>
                  Ownership: <strong>{book.ownership_type === 'bought' ? 'Purchased & Owned' : 'Borrowed copy'}</strong>
                  {book.purchase_price && ` (${getCurrencySymbol(book.currency)}${book.purchase_price.toFixed(2)})`}
                </span>
              </div>
              
              <div className="flex items-center gap-2.5 text-xs text-muted">
                <Calendar size={14} />
                <span>Added on {new Date(book.date_added).toLocaleDateString()}</span>
              </div>
 
              {/* Lending flow */}
              {book.borrower_name && (
                <div className="mt-2 border border-secondary/20 p-3 rounded-card bg-secondary/5 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-secondary">
                      {book.ownership_type === 'bought' ? 'Lent Out' : 'Borrowed Source'}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const nextStatus = book.borrow_status === 'returned' ? 'not_returned' : 'returned';
                          await updateBook(book.id, { borrow_status: nextStatus });
                        }}
                        className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                          book.borrow_status === 'returned' 
                            ? 'bg-secondary/15 border-secondary/20 text-secondary hover:bg-secondary/25' 
                            : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                        }`}
                      >
                        {book.borrow_status === 'returned' ? 'Mark Active' : 'Mark Returned'}
                      </button>
                      <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${
                        book.borrow_status === 'returned' 
                          ? 'bg-primary/10 border-primary/20 text-primary' 
                          : 'bg-secondary/15 border-secondary/20 text-secondary font-semibold'
                      }`}>
                        {book.borrow_status === 'returned' ? 'Returned' : 'Not Returned'}
                      </span>
                    </div>
                  </div>
                  <p>
                    {book.ownership_type === 'bought' ? 'Currently lent to' : 'Borrowed from'}{' '}
                    <strong>{book.borrower_name}</strong>.
                  </p>
                  {book.return_date && (
                    <span className="text-[10px] text-muted">
                      Expected return date: {new Date(book.return_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Reading lists containing this book */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted">Reading Lists</h4>
              <button 
                onClick={() => setShowListSelector(!showListSelector)}
                className="text-[10px] text-primary hover:underline font-semibold flex items-center gap-1 uppercase"
              >
                <Bookmark size={10} /> Add/Remove List
              </button>
            </div>

            {showListSelector && (
              <div className="border border-border p-3 rounded-card bg-background/50 flex flex-col gap-2 text-xs">
                {readLists.length > 0 ? (
                  readLists.map(list => {
                    const belongs = bookLists.some(l => l.id === list.id);
                    return (
                      <button
                        key={list.id}
                        onClick={() => handleToggleList(list.id)}
                        className="flex items-center justify-between w-full p-1.5 hover:bg-background rounded-md text-left transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: list.color }} />
                          <span>{list.name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={belongs}
                          readOnly
                          className="accent-primary"
                        />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-muted text-[10px] text-center py-2">Create lists in the Reading Lists tab first.</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {bookLists.length > 0 ? (
                bookLists.map(list => (
                  <span
                    key={list.id}
                    className="flex items-center gap-1.5 text-xs py-1 px-3.5 border rounded-full font-medium"
                    style={{ 
                      borderColor: `${list.color}25`, 
                      backgroundColor: `${list.color}10`,
                      color: list.color
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: list.color }} />
                    {list.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted italic">This book is not in any reading list.</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-background/40 flex items-center justify-between text-xs text-muted">
          <span>Added {new Date(book.created_at).toLocaleDateString()}</span>
          <span>Last updated {new Date(book.updated_at).toLocaleDateString()}</span>
        </div>
      </motion.div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Move to Recycle Bin"
        message="Are you sure you want to soft-delete this book? It can be recovered from the Recycle Bin within 30 days."
        confirmLabel="Send to Trash"
        cancelLabel="Keep Book"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}

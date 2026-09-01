'use client';

import React, { useState, useEffect } from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { Book, ReadList } from '../types';
import { dbService } from '../services/db';
import { Plus, Folder, Trash2, X, BookOpen, ChevronRight, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

const PRESET_COLORS = [
  '#3B5659', // Primary (Deep Slate Blue)
  '#D95B72', // Secondary (Soft Crimson)
  '#D9BE36', // Accent (Ochre Gold)
  '#4E6E5D', // Olive Green
  '#7C6E5A', // Warm Taupe
  '#6E5A7C', // Muted Purple
  '#B87333', // Copper
  '#2C3E50'  // Dark Blue
];

export default function ListsView() {
  const { readLists, createReadList, deleteReadList, books, fetchBooks } = useBookerStore();
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [listBooks, setListBooks] = useState<Book[]>([]);
  const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null);

  // Create List Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [listName, setListName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadListBooks() {
      if (activeListId) {
        const matchingBooks = await dbService.getBooksInReadList(activeListId);
        setListBooks(matchingBooks);
      } else {
        setListBooks([]);
      }
    }
    loadListBooks();
  }, [activeListId, books]);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) {
      setError('List name is required');
      return;
    }
    try {
      await createReadList(listName, selectedColor);
      setListName('');
      setShowCreateModal(false);
      setError('');
    } catch (err) {
      console.error(err);
      setError('An error occurred');
    }
  };

  const handleDeleteList = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setListToDelete({ id, name });
  };

  const handleRemoveFromList = async (bookId: string) => {
    if (activeListId) {
      await dbService.removeBookFromReadList(bookId, activeListId);
      setListBooks(prev => prev.filter(b => b.id !== bookId));
      await fetchBooks();
    }
  };

  const getInitials = (title: string, author: string) => {
    return ((title.charAt(0) || '') + (author.charAt(0) || '')).toUpperCase();
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-primary">Reading Lists</h2>
          <p className="text-muted text-sm mt-0.5">Organize books into custom collections</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 border border-border hover:bg-surface text-muted hover:text-foreground py-2 px-4 rounded-full text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={14} />
          <span>New List</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Lists directories */}
        <div className="flex flex-col gap-3 lg:col-span-1">
          {readLists.length > 0 ? (
            readLists.map((list) => {
              const isActive = activeListId === list.id;
              return (
                <div
                  key={list.id}
                  onClick={() => setActiveListId(list.id)}
                  className={`flex items-center justify-between p-4 rounded-card border transition-all cursor-pointer select-none ${
                    isActive 
                      ? 'bg-surface border-primary shadow-sm' 
                      : 'border-border hover:border-primary/35 bg-surface/50 hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${list.color}15`, color: list.color }}
                    >
                      <Folder size={20} fill={list.color === '#FFFFFF' ? 'none' : `${list.color}25`} />
                    </div>
                    
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm font-semibold truncate leading-tight">{list.name}</h4>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-bold">List folder</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteList(list.id, list.name, e)}
                      className="p-1.5 text-muted hover:text-secondary hover:bg-secondary/10 rounded-full transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100 md:opacity-100"
                      title="Delete List"
                    >
                      <Trash2 size={13} />
                    </button>
                    <ChevronRight size={16} className={`text-muted transition-transform ${isActive ? 'rotate-90 text-primary' : ''}`} />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="border border-dashed border-border py-12 text-center rounded-card text-muted">
              <Bookmark size={24} className="mx-auto mb-2 text-border" />
              <p className="text-sm">No reading lists cataloged.</p>
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="text-xs text-primary underline mt-1 font-semibold cursor-pointer"
              >
                Create your first reading list
              </button>
            </div>
          )}
        </div>

        {/* Right Side: books inside active list */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeListId ? (
              <motion.div
                key={activeListId}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-surface border border-border rounded-card p-6 min-h-[300px] flex flex-col justify-between"
              >
                <div className="flex flex-col gap-6">
                  {/* Active list details */}
                  <div className="flex items-center justify-between border-b border-border/70 pb-4">
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3.5 h-3.5 rounded-full" 
                        style={{ backgroundColor: readLists.find(l => l.id === activeListId)?.color }}
                      />
                      <h3 className="font-serif text-xl font-bold">
                        {readLists.find(l => l.id === activeListId)?.name}
                      </h3>
                    </div>
                    
                    <span className="text-xs text-muted font-semibold uppercase tracking-wider">
                      {listBooks.length} Books
                    </span>
                  </div>

                  {/* Books inside list */}
                  <div className="divide-y divide-border">
                    {listBooks.length > 0 ? (
                      listBooks.map((book) => (
                        <div 
                          key={book.id}
                          className="py-3 flex items-center justify-between gap-4 group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Spine book mockup */}
                            <div className="w-8 h-12 bg-background border border-border rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                              {book.cover_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-serif text-[10px] font-bold text-primary/45">{getInitials(book.title, book.author)}</span>
                              )}
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 border-r border-black/5" />
                            </div>

                            <div className="min-w-0">
                              <h4 className="font-serif text-sm font-semibold truncate leading-tight">{book.title}</h4>
                              <span className="text-xs text-muted truncate">{book.author}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveFromList(book.id)}
                            className="text-xs font-semibold text-secondary hover:bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20 transition-colors shrink-0 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-muted">
                        <BookOpen size={24} className="mx-auto mb-2 text-border" />
                        <p className="text-sm">This list is empty.</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Attach books to this list from the My Library catalog cards.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="border border-dashed border-border py-20 text-center rounded-card text-muted">
                <Folder size={32} className="mx-auto mb-3 text-border" />
                <h4 className="font-serif text-lg text-foreground">Select a Reading List</h4>
                <p className="text-sm mt-1 max-w-xs mx-auto">Select a collection on the left to inspect, manage, and curate its included entries.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create List Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-border rounded-card shadow-xl overflow-hidden"
            >
              <form onSubmit={handleCreateList}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
                  <h3 className="font-serif text-lg font-semibold text-primary">New Reading List</h3>
                  <button 
                    type="button"
                    onClick={() => { setShowCreateModal(false); setError(''); }}
                    className="p-1 text-muted hover:text-foreground rounded-full hover:bg-background transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-4">
                  {error && <span className="text-secondary text-xs font-semibold">{error}</span>}
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">List Name</label>
                    <input
                      type="text"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="e.g. Summer Readings 2026"
                      className="px-3.5 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Color Palette Theme</label>
                    <div className="flex flex-wrap gap-2.5 mt-1">
                      {PRESET_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-6 h-6 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                            selectedColor === color ? 'scale-110 shadow-sm ring-1 ring-offset-2 ring-primary/45' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {selectedColor === color && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4 bg-background/50">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setError(''); }}
                    className="text-xs text-muted hover:text-foreground font-semibold px-4 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/95 text-white py-2 px-5 rounded-full text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    Create List
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!listToDelete}
        title="Delete Reading List"
        message={listToDelete ? `Are you sure you want to delete the list "${listToDelete.name}"? The books inside will not be deleted.` : ''}
        confirmLabel="Delete List"
        isDangerous={true}
        onConfirm={async () => {
          if (listToDelete) {
            await deleteReadList(listToDelete.id);
            if (activeListId === listToDelete.id) {
              setActiveListId(null);
            }
            setListToDelete(null);
          }
        }}
        onCancel={() => setListToDelete(null)}
      />
    </div>
  );
}

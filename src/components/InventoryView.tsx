'use client';

import React, { useState } from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { Book } from '../types';
import BookDetail from './BookDetail';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  BookOpen, 
  Calendar, 
  UserCheck, 
  ArrowUpDown,
  ShoppingBag,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dbService } from '../services/db';
import ConfirmModal from './ConfirmModal';

interface InventoryViewProps {
  onOpenEditModal: (id: string) => void;
}

const GENRES = [
  'All',
  "Mystery",
  "Thriller and Suspense",
  "Horror",
  "Science Fiction",
  "Fantasy",
  "High Fantasy",
  "Urban Fantasy",
  "Grimdark Fantasy",
  "Dystopian Fiction",
  "Romance",
  "Romantasy",
  "Historical Fiction",
  "Contemporary Fiction",
  "Literary Fiction",
  "Young Adult",
  "New Adult",
  "Xenofiction",
  "Children’s Fiction",
  "Graphic Novel",
  "Manga",
  "Short Story",
  "Novella",
  "Autobiography",
  "Memoir",
  "Biography",
  "Self-help",
  "Parenting",
  "Food and Drink",
  "Photography",
  "History",
  "Business",
  "Humor",
  "True Crime",
  "Religion and Spirituality",
  "Philosophy",
  "Health and Fitness",
  "Science",
  "Technology",
  "Crafts and DIY",
  "Learning and Education",
  "Essays",
  "Gardening and Homesteading",
  "Music",
  "Children’s (Non-Fiction)"
];

export default function InventoryView({ onOpenEditModal }: InventoryViewProps) {
  const { 
    books, 
    filters, 
    setFilters, 
    resetFilters,
    selectedBookId,
    setSelectedBookId,
    softDeleteBook
  } = useBookerStore();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'alpha' | 'newest'>('newest');
  
  // Bulk selection states
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const activeBooks = books.filter(b => !b.is_deleted);

  // Apply filters
  const filteredBooks = activeBooks.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      book.author.toLowerCase().includes(filters.search.toLowerCase()) ||
      (book.isbn && book.isbn.includes(filters.search));

    const matchesGenre = filters.genre === 'All' || book.genre === filters.genre;

    const matchesOwnership = 
      filters.ownershipType === 'All' || 
      book.ownership_type === filters.ownershipType;

    const matchesBorrow = 
      filters.borrowStatus === 'All' ||
      (filters.borrowStatus === 'lent' && book.borrower_name && book.borrow_status === 'not_returned') ||
      (filters.borrowStatus === 'returned' && book.borrower_name && book.borrow_status === 'returned') ||
      (filters.borrowStatus === 'available' && !book.borrower_name);

    return matchesSearch && matchesGenre && matchesOwnership && matchesBorrow;
  });

  // Apply sorting
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortOrder === 'alpha') {
      return a.title.localeCompare(b.title);
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getInitials = (title: string, author: string) => {
    return ((title.charAt(0) || '') + (author.charAt(0) || '')).toUpperCase();
  };

  const handleSelectBook = (id: string, e: React.MouseEvent) => {
    if (bulkMode) {
      e.stopPropagation();
      setSelectedBooks(prev => 
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
    } else {
      setSelectedBookId(id);
    }
  };

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedBooks([]);
  };

  const handleBulkSoftDelete = () => {
    if (selectedBooks.length === 0) return;
    setShowBulkDeleteConfirm(true);
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-semibold text-primary">Catalog</h2>
          <p className="text-muted text-sm mt-0.5">Showing {filteredBooks.length} of {activeBooks.length} items</p>
        </div>

        {/* View mode & Sort */}
        <div className="flex items-center gap-3">
          {activeBooks.length > 0 && (
            <button
              onClick={handleToggleBulkMode}
              className={`text-xs px-3.5 py-2 rounded-full border transition-all font-semibold cursor-pointer ${
                bulkMode 
                  ? 'bg-secondary/15 border-secondary text-secondary' 
                  : 'border-border hover:bg-surface text-muted hover:text-foreground'
              }`}
            >
              {bulkMode ? 'Cancel Selection' : 'Select Multiple'}
            </button>
          )}

          <div className="flex items-center border border-border rounded-full overflow-hidden bg-surface">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}
              title="Grid View"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-foreground'}`}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>

          <button
            onClick={() => setSortOrder(prev => prev === 'alpha' ? 'newest' : 'alpha')}
            className="flex items-center gap-1.5 py-2 px-3 border border-border bg-surface hover:bg-background/80 rounded-full text-xs font-semibold text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowUpDown size={13} />
            <span>{sortOrder === 'alpha' ? 'Alphabetical' : 'Date Added'}</span>
          </button>
        </div>
      </div>

      {/* Bulk actions banner */}
      {bulkMode && selectedBooks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-secondary/35 p-3 rounded-card flex items-center justify-between text-sm shadow-sm"
        >
          <span className="font-medium text-muted">
            <strong className="text-secondary font-semibold">{selectedBooks.length}</strong> items selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkSoftDelete}
              className="flex items-center gap-1.5 text-xs text-white bg-secondary hover:bg-secondary/95 px-4 py-2 rounded-full font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Send to Recycle Bin</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Filter panel */}
      <div className="bg-surface border border-border p-4 rounded-card flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search title, author, isbn..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-input border border-border bg-background text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted/65"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Genre */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-[120px] md:flex-initial">
            <select
              value={filters.genre}
              onChange={(e) => setFilters({ genre: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-input bg-background text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option disabled>Genre</option>
              {GENRES.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Genres' : g}</option>
              ))}
            </select>
          </div>

          {/* Ownership */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-[120px] md:flex-initial">
            <select
              value={filters.ownershipType}
              onChange={(e) => setFilters({ ownershipType: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-input bg-background text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="All">All Sources</option>
              <option value="bought">Bought</option>
              <option value="borrowed">Borrowed</option>
            </select>
          </div>

          {/* Lending Status */}
          <div className="flex flex-col gap-0.5 flex-1 min-w-[120px] md:flex-initial">
            <select
              value={filters.borrowStatus}
              onChange={(e) => setFilters({ borrowStatus: e.target.value })}
              className="px-3 py-1.5 border border-border rounded-input bg-background text-xs font-semibold focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="available">In Cabinet</option>
              <option value="lent">Lent Out</option>
              <option value="returned">Returned Lent</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(filters.search || filters.genre !== 'All' || filters.ownershipType !== 'All' || filters.borrowStatus !== 'All') && (
            <button
              onClick={resetFilters}
              className="text-xs text-secondary hover:underline font-bold px-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Book Catalog list/grid */}
      <AnimatePresence mode="popLayout">
        {sortedBooks.length > 0 ? (
          viewMode === 'grid' ? (
            <motion.div 
              layout 
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {sortedBooks.map((book) => {
                const isSelected = selectedBooks.includes(book.id);
                return (
                  <motion.div
                    layout
                    key={book.id}
                    onClick={(e) => handleSelectBook(book.id, e)}
                    className={`bg-surface border rounded-card p-4 flex flex-col gap-3 group relative cursor-pointer hover:border-primary/45 transition-colors ${
                      isSelected ? 'border-secondary bg-secondary/5 ring-1 ring-secondary' : 'border-border'
                    }`}
                  >
                    {/* Checkbox overlay for bulk selection */}
                    {bulkMode && (
                      <div className="absolute right-3 top-3 z-10 w-4.5 h-4.5 rounded-md border border-border bg-surface flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="accent-secondary w-full h-full cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Book spine spine mockup */}
                    <div className="w-full h-44 bg-background border border-border rounded-md flex items-center justify-center relative overflow-hidden group-hover:shadow-sm transition-shadow">
                      {book.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                          <span className="font-serif text-xl font-bold text-primary/40">{getInitials(book.title, book.author)}</span>
                        </div>
                      )}
                      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-primary/20 border-r border-black/5" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h4 className="font-serif text-sm font-semibold truncate group-hover:text-primary transition-colors leading-snug">{book.title}</h4>
                      <p className="text-xs text-muted truncate mt-0.5">{book.author}</p>
                      
                      {/* Sub-icons indicators */}
                      <div className="flex items-center gap-2 mt-2">
                        {book.ownership_type === 'borrowed' ? (
                          <span className="text-[10px] bg-background/70 border border-border py-0.5 px-2 rounded-full text-muted flex items-center gap-1">
                            <Calendar size={10} /> Borrowed
                          </span>
                        ) : book.borrower_name ? (
                          <span className={`text-[10px] border py-0.5 px-2 rounded-full flex items-center gap-1 ${
                            book.borrow_status === 'returned'
                              ? 'bg-primary/10 border-primary/20 text-primary'
                              : 'bg-secondary/15 border-secondary/20 text-secondary font-semibold'
                          }`}>
                            <UserCheck size={10} /> Lent
                          </span>
                        ) : (
                          <span className="text-[10px] bg-primary/5 text-primary py-0.5 px-2 rounded-full">Available</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* List View */
            <motion.div 
              layout 
              className="bg-surface border border-border rounded-card divide-y divide-border overflow-hidden"
            >
              {sortedBooks.map((book) => {
                const isSelected = selectedBooks.includes(book.id);
                return (
                  <motion.div
                    layout
                    key={book.id}
                    onClick={(e) => handleSelectBook(book.id, e)}
                    className={`p-4 hover:bg-background/30 transition-colors flex items-center justify-between gap-4 cursor-pointer ${
                      isSelected ? 'bg-secondary/5' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {bulkMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="accent-secondary shrink-0 cursor-pointer w-4 h-4"
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => {}}
                        />
                      )}
                      
                      {/* Spine mockup icon */}
                      <div className="w-10 h-14 bg-background border border-border rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                        {book.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif text-xs font-bold text-primary/45">{getInitials(book.title, book.author)}</span>
                        )}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 border-r border-black/5" />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-serif text-sm font-semibold truncate leading-snug hover:text-primary transition-colors">{book.title}</h4>
                        <p className="text-xs text-muted truncate mt-0.5">{book.author}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs shrink-0">
                      <span className="hidden sm:inline-block text-[10px] font-bold uppercase text-accent tracking-wider bg-background px-2.5 py-1 border border-border rounded-full">
                        {book.genre}
                      </span>
                      
                      <div className="w-24 text-right">
                        {book.ownership_type === 'borrowed' ? (
                          <span className="text-muted flex items-center justify-end gap-1">
                            <Calendar size={12} /> Borrowed
                          </span>
                        ) : book.borrower_name ? (
                          <span className={`flex items-center justify-end gap-1 ${
                            book.borrow_status === 'returned'
                              ? 'text-primary'
                              : 'text-secondary font-semibold'
                          }`}>
                            <UserCheck size={12} /> {book.borrow_status === 'returned' ? 'Returned' : `Lent: ${book.borrower_name}`}
                          </span>
                        ) : (
                          <span className="text-primary/70">In Cabinet</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-dashed border-border py-20 text-center rounded-card text-muted"
          >
            <FolderOpen size={32} className="mx-auto mb-3 text-border" />
            <h4 className="font-serif text-lg text-foreground">No Books Found</h4>
            <p className="text-sm mt-1 max-w-sm mx-auto">There are no books in your cabinet matching the active filters or search terms.</p>
            <button onClick={resetFilters} className="text-xs text-primary underline mt-2 font-semibold cursor-pointer">Clear filters</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side-Sheet Book details view overlay */}
      <AnimatePresence>
        {selectedBookId && (
          <BookDetail
            bookId={selectedBookId}
            onClose={() => setSelectedBookId(null)}
            onEdit={() => onOpenEditModal(selectedBookId)}
          />
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showBulkDeleteConfirm}
        title="Send Selection to Trash"
        message={`Are you sure you want to soft-delete the ${selectedBooks.length} selected books?`}
        confirmLabel="Send to Recycle Bin"
        isDangerous={true}
        onConfirm={async () => {
          for (const id of selectedBooks) {
            await softDeleteBook(id);
          }
          setSelectedBooks([]);
          setBulkMode(false);
          setShowBulkDeleteConfirm(false);
        }}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />
    </div>
  );
}

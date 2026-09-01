'use client';

import React, { useState, useEffect } from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { Book, OwnershipType, BorrowStatus } from '../types';
import { X, ChevronLeft, ChevronRight, Save, Info, Tag, Search, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRENCIES } from '../utils/currencies';

interface BookFormProps {
  bookId?: string | null;
  onClose: () => void;
}

const GENRES = [
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

export default function BookForm({ bookId, onClose }: BookFormProps) {
  const { addBook, updateBook, books } = useBookerStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [pages, setPages] = useState<string>('');
  const [language, setLanguage] = useState('English');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const [ownershipType, setOwnershipType] = useState<OwnershipType>('bought');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [currency, setCurrency] = useState('EUR');
  const [dateAdded, setDateAdded] = useState(new Date().toISOString().split('T')[0]);
  const [borrowerName, setBorrowerName] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [borrowStatus, setBorrowStatus] = useState<BorrowStatus>('not_returned');

  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState<string>('');
  const [edition, setEdition] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (bookId) {
      const book = books.find(b => b.id === bookId);
      if (book) {
        setTitle(book.title);
        setAuthor(book.author);
        setGenre(book.genre);
        setPages(book.pages?.toString() || '');
        setLanguage(book.language || '');
        setDescription(book.description || '');
        setCoverUrl(book.cover_url || '');

        setOwnershipType(book.ownership_type);
        setPurchasePrice(book.purchase_price?.toString() || '');
        setCurrency(book.currency || 'EUR');
        setDateAdded(book.date_added);
        setBorrowerName(book.borrower_name || '');
        setReturnDate(book.return_date || '');
        setBorrowStatus(book.borrow_status || 'not_returned');

        setIsbn(book.isbn || '');
        setPublisher(book.publisher || '');
        setPublicationYear(book.publication_year?.toString() || '');
        setEdition(book.edition || '');
      }
    }
  }, [bookId, books]);

  // Basic Details validation
  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!author.trim()) errs.author = 'Author is required';
    if (!genre) errs.genre = 'Genre is required';
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Ownership validation
  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (!dateAdded) errs.dateAdded = 'Date added is required';
    if (ownershipType === 'borrowed') {
      if (!borrowerName.trim()) errs.borrowerName = 'Source name is required';
      if (!returnDate) errs.returnDate = 'Lend return date is required';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;

    setLoading(true);
    try {
      const payload = {
        title,
        author,
        genre,
        pages: pages ? parseInt(pages) : undefined,
        language: language || undefined,
        description: description || undefined,
        cover_url: coverUrl || undefined,
        
        ownership_type: ownershipType,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
        currency: purchasePrice ? currency : undefined,
        date_added: dateAdded,
        borrower_name: borrowerName || undefined,
        return_date: returnDate || undefined,
        borrow_status: borrowerName ? borrowStatus : undefined,

        isbn: isbn || undefined,
        publisher: publisher || undefined,
        publication_year: publicationYear ? parseInt(publicationYear) : undefined,
        edition: edition || undefined
      };

      if (bookId) {
        await updateBook(bookId, payload);
      } else {
        await addBook(payload);
      }
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ form: 'An error occurred while saving the book.' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch details via mock ISBN lookup for French aesthetic touch!
  const handleIsbnLookup = () => {
    if (!isbn.trim()) return;
    // Mocking a successful look-up
    setPublisher('Editions Gallimard');
    setPublicationYear('1945');
    setLanguage('French');
    if (!coverUrl) {
      // Unsplash placeholder cover
      setCoverUrl('https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=256&h=384');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-surface border border-border rounded-card shadow-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-background/50">
          <div>
            <h3 className="font-serif text-lg font-semibold text-primary">
              {bookId ? 'Edit Collection Item' : 'Catalog a New Book'}
            </h3>
            <p className="text-xs text-muted">Step {step} of 3 — {step === 1 ? 'Core Details' : step === 2 ? 'Provenance & Status' : 'Metadata & Identification'}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-muted hover:text-foreground rounded-full hover:bg-background transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errors.form && (
            <div className="bg-secondary/10 border border-secondary/20 text-secondary text-xs p-3 rounded-md mb-4 font-medium">
              {errors.form}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ x: 15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -15, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-4 min-h-[340px]"
            >
              {/* STEP 1: BASIC DETAILS */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted flex items-center gap-1">
                      <Info size={12} /> Book Title <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. L'Étranger"
                      className={`px-3 py-2 border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors ${errors.title ? 'border-secondary' : 'border-border'}`}
                    />
                    {errors.title && <span className="text-secondary text-[10px]">{errors.title}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted flex items-center gap-1">
                      <UserCheck size={12} /> Author <span className="text-secondary">*</span>
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Albert Camus"
                      className={`px-3 py-2 border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors ${errors.author ? 'border-secondary' : 'border-border'}`}
                    />
                    {errors.author && <span className="text-secondary text-[10px]">{errors.author}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted flex items-center gap-1">
                      <Tag size={12} /> Genre <span className="text-secondary">*</span>
                    </label>
                    <select
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    >
                      {GENRES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Pages</label>
                    <input
                      type="number"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="e.g. 123"
                      className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Language</label>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      placeholder="e.g. French"
                      className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Description / Summary</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="A short write-up on the theme, subject, or memory associated..."
                      rows={3}
                      className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Cover Image URL</label>
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... or blank for auto spine"
                      className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: OWNERSHIP & STATUS */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Ownership Mode</label>
                    <div className="flex gap-4 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                        <input
                          type="radio"
                          name="ownershipType"
                          checked={ownershipType === 'bought'}
                          onChange={() => setOwnershipType('bought')}
                          className="accent-primary"
                        />
                        <span>Bought & Owned</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                        <input
                          type="radio"
                          name="ownershipType"
                          checked={ownershipType === 'borrowed'}
                          onChange={() => setOwnershipType('borrowed')}
                          className="accent-primary"
                        />
                        <span>Borrowed from Library/Friend</span>
                      </label>
                    </div>
                  </div>

                  {ownershipType === 'bought' ? (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Purchase Price</label>
                      <div className="flex gap-2">
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer w-28 shrink-0 font-medium"
                        >
                          {CURRENCIES.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.code} ({c.symbol})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(e.target.value)}
                          placeholder="e.g. 14.50"
                          className="flex-1 px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Lent By / Source Name <span className="text-secondary">*</span></label>
                      <input
                        type="text"
                        value={borrowerName}
                        onChange={(e) => setBorrowerName(e.target.value)}
                        placeholder="e.g. City Library"
                        className={`px-3 py-2 border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors ${errors.borrowerName ? 'border-secondary' : 'border-border'}`}
                      />
                      {errors.borrowerName && <span className="text-secondary text-[10px]">{errors.borrowerName}</span>}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Date Added <span className="text-secondary">*</span></label>
                    <input
                      type="date"
                      value={dateAdded}
                      onChange={(e) => setDateAdded(e.target.value)}
                      className={`px-3 py-2 border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors ${errors.dateAdded ? 'border-secondary' : 'border-border'}`}
                    />
                    {errors.dateAdded && <span className="text-secondary text-[10px]">{errors.dateAdded}</span>}
                  </div>

                  <div className="border-t border-border/70 my-2 md:col-span-2" />

                  {/* Lending Track workflow */}
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <h4 className="font-serif text-sm font-semibold text-primary">Lending Workflows (Optional)</h4>
                    <p className="text-muted text-[11px]">Track if you have lent this book out to someone, or need to return it.</p>
                  </div>

                  {ownershipType === 'bought' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Lent Out To (Borrower's Name)</label>
                        <input
                          type="text"
                          value={borrowerName}
                          onChange={(e) => setBorrowerName(e.target.value)}
                          placeholder="e.g. Sophia"
                          className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Due Return Date</label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Lend Return Deadline <span className="text-secondary">*</span></label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className={`px-3 py-2 border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors ${errors.returnDate ? 'border-secondary' : 'border-border'}`}
                        />
                        {errors.returnDate && <span className="text-secondary text-[10px]">{errors.returnDate}</span>}
                      </div>
                    </>
                  )}

                  {borrowerName && (
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Lend / Return Status</label>
                      <div className="flex gap-4 mt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                          <input
                            type="radio"
                            name="borrowStatus"
                            checked={borrowStatus === 'not_returned'}
                            onChange={() => setBorrowStatus('not_returned')}
                            className="accent-secondary"
                          />
                          <span className="text-secondary font-semibold">Active (Not Returned)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                          <input
                            type="radio"
                            name="borrowStatus"
                            checked={borrowStatus === 'returned'}
                            onChange={() => setBorrowStatus('returned')}
                            className="accent-primary"
                          />
                          <span className="text-primary font-semibold">Returned</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: IDENTIFICATION DETAILS */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted flex items-center justify-between">
                      <span>ISBN Code (10 or 13 Digits)</span>
                      {isbn && (
                        <button 
                          type="button" 
                          onClick={handleIsbnLookup}
                          className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold uppercase"
                        >
                          <Search size={10} /> Fetch Details
                        </button>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={isbn}
                        onChange={(e) => setIsbn(e.target.value)}
                        placeholder="e.g. 9780679720201"
                        className="flex-1 px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Publisher</label>
                    <input
                      type="text"
                      value={publisher}
                      onChange={(e) => setPublisher(e.target.value)}
                      placeholder="e.g. Gallimard"
                      className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Publication Year</label>
                    <input
                      type="number"
                      value={publicationYear}
                      onChange={(e) => setPublicationYear(e.target.value)}
                      placeholder="e.g. 1942"
                      className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Edition / Copy Info</label>
                    <input
                      type="text"
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      placeholder="e.g. 50th Anniversary Special Hardcover"
                      className="px-3 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-6 py-4 bg-background/50">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 border border-border hover:bg-background text-muted hover:text-foreground py-2 px-4 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-muted hover:text-foreground font-semibold px-4 cursor-pointer"
            >
              Cancel
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white py-2 px-5 rounded-full text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1.5 bg-accent hover:bg-accent/95 text-primary-dark text-amber-950 bg-amber-400 py-2 px-5 rounded-full text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Save size={14} />
                <span>{loading ? 'Saving...' : bookId ? 'Save Changes' : 'Catalog Book'}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

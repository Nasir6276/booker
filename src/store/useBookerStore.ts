import { create } from 'zustand';
import { Book, ReadList, User, OwnershipType, BorrowStatus } from '../types';
import { dbService } from '../services/db';
import { authService } from '../services/auth';

interface BookerState {
  // Auth
  user: User | null;
  loading: boolean;
  
  // Data
  books: Book[];
  readLists: ReadList[];
  selectedBookId: string | null;
  activeTab: 'dashboard' | 'inventory' | 'lists' | 'social' | 'trash';
  
  // App state
  isOffline: boolean;
  filters: {
    search: string;
    genre: string;
    ownershipType: string;
    borrowStatus: string;
  };

  // Actions
  init: () => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signUp: (email: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string; is_public?: boolean }) => Promise<void>;
  
  // Book Actions
  fetchBooks: () => Promise<void>;
  addBook: (bookData: Omit<Book, 'id' | 'user_id' | 'is_deleted' | 'created_at' | 'updated_at'>) => Promise<Book>;
  updateBook: (id: string, updates: Partial<Omit<Book, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>;
  softDeleteBook: (id: string) => Promise<void>;
  restoreBook: (id: string) => Promise<void>;
  permanentlyDeleteBook: (id: string) => Promise<void>;
  
  // Reading List Actions
  fetchReadLists: () => Promise<void>;
  createReadList: (name: string, color: string) => Promise<ReadList>;
  deleteReadList: (id: string) => Promise<void>;
  addBookToReadList: (bookId: string, listId: string) => Promise<void>;
  removeBookFromReadList: (bookId: string, listId: string) => Promise<void>;
  
  // UI Actions
  setSelectedBookId: (id: string | null) => void;
  setActiveTab: (tab: 'dashboard' | 'inventory' | 'lists' | 'social' | 'trash') => void;
  setFilters: (updates: Partial<BookerState['filters']>) => void;
  resetFilters: () => void;
}

export const useBookerStore = create<BookerState>((set, get) => ({
  user: null,
  loading: true,
  books: [],
  readLists: [],
  selectedBookId: null,
  activeTab: 'dashboard',
  isOffline: false,
  filters: {
    search: '',
    genre: 'All',
    ownershipType: 'All',
    borrowStatus: 'All',
  },

  init: async () => {
    if (typeof window === 'undefined') return;
    
    set({ loading: true });
    
    // Set offline state initial
    set({ isOffline: !navigator.onLine });
    
    // Setup listeners
    window.addEventListener('online', () => set({ isOffline: false }));
    window.addEventListener('offline', () => set({ isOffline: true }));

    try {
      const user = await authService.getCurrentUser();
      set({ user });
      
      if (user) {
        await get().fetchBooks();
        await get().fetchReadLists();
      }
    } catch (error) {
      console.error('Failed to initialize Booker store:', error);
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email: string) => {
    set({ loading: true });
    try {
      const user = await authService.signIn(email);
      set({ user });
      await get().fetchBooks();
      await get().fetchReadLists();
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, displayName: string) => {
    set({ loading: true });
    try {
      const user = await authService.signUp(email, displayName);
      set({ user });
      await get().fetchBooks();
      await get().fetchReadLists();
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, books: [], readLists: [], selectedBookId: null, activeTab: 'dashboard' });
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    
    const updatedUser = await authService.updateProfile(user.id, updates);
    set({ user: updatedUser });
  },

  fetchBooks: async () => {
    const { user } = get();
    if (!user) return;
    const books = await dbService.getBooks(user.id, true); // Get all, filter soft-deleted inside UI or in selector
    set({ books });
  },

  addBook: async (bookData) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    
    const newBook = await dbService.addBook({
      ...bookData,
      user_id: user.id
    });
    
    await get().fetchBooks();
    return newBook;
  },

  updateBook: async (id, updates) => {
    await dbService.updateBook(id, updates);
    await get().fetchBooks();
  },

  softDeleteBook: async (id) => {
    await dbService.softDeleteBook(id);
    await get().fetchBooks();
  },

  restoreBook: async (id) => {
    await dbService.restoreBook(id);
    await get().fetchBooks();
  },

  permanentlyDeleteBook: async (id) => {
    await dbService.permanentlyDeleteBook(id);
    await get().fetchBooks();
  },

  fetchReadLists: async () => {
    const { user } = get();
    if (!user) return;
    const readLists = await dbService.getReadLists(user.id);
    set({ readLists });
  },

  createReadList: async (name, color) => {
    const { user } = get();
    if (!user) throw new Error('User not authenticated');
    
    const newList = await dbService.createReadList(user.id, name, color);
    await get().fetchReadLists();
    return newList;
  },

  deleteReadList: async (id) => {
    await dbService.deleteReadList(id);
    await get().fetchReadLists();
  },

  addBookToReadList: async (bookId, listId) => {
    await dbService.addBookToReadList(bookId, listId);
    // Refresh lists and books lists
    await get().fetchBooks();
  },

  removeBookFromReadList: async (bookId, listId) => {
    await dbService.removeBookFromReadList(bookId, listId);
    await get().fetchBooks();
  },

  setSelectedBookId: (id) => set({ selectedBookId: id }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilters: (updates) => set((state) => ({ filters: { ...state.filters, ...updates } })),
  resetFilters: () => set({
    filters: {
      search: '',
      genre: 'All',
      ownershipType: 'All',
      borrowStatus: 'All',
    }
  })
}));

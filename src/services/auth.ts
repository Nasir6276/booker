import { User } from '../types';
import { dbService } from './db';

const SESSION_KEY = 'booker_session';

const DEMO_USER: User = {
  id: 'demo-user-id-1234',
  email: 'jean.luc@minimalist.fr',
  display_name: 'Jean-Luc',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256',
  invite_code: 'JL-MIN-2026',
  is_public: true,
  created_at: new Date().toISOString()
};

const DEMO_BOOKS = [
  {
    title: 'The Stranger',
    author: 'Albert Camus',
    genre: 'Fiction',
    pages: 123,
    language: 'French',
    description: 'An existentialist masterpiece following Meursault, an indifferent French Algerian who, after attending his mother’s funeral, apathy-driven commits a murder.',
    ownership_type: 'bought' as const,
    purchase_price: 12.99,
    date_added: '2026-05-15',
    isbn: '9780679720201',
    publisher: 'Gallimard',
    publication_year: 1942,
    edition: 'First Vintage Book Edition'
  },
  {
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupéry',
    genre: 'Children',
    pages: 96,
    language: 'French',
    description: 'A poetic tale of a young prince who visits various planets in space, addressing themes of loneliness, friendship, love, and loss.',
    ownership_type: 'borrowed' as const,
    date_added: '2026-06-01',
    borrower_name: 'Sophia',
    return_date: '2026-06-15',
    borrow_status: 'not_returned' as const,
    isbn: '9780156012195',
    publisher: 'Reynal & Hitchcock',
    publication_year: 1943,
    edition: 'Classic Softcover'
  },
  {
    title: 'Madame Bovary',
    author: 'Gustave Flaubert',
    genre: 'Fiction',
    pages: 328,
    language: 'French',
    description: 'The story focuses on Emma Bovary, who lives beyond her means in order to escape the banalities and emptiness of provincial life.',
    ownership_type: 'bought' as const,
    purchase_price: 14.50,
    date_added: '2026-04-10',
    isbn: '9780140449129',
    publisher: 'Revue de Paris',
    publication_year: 1856,
    edition: 'Penguin Classics'
  },
  {
    title: 'Wind, Sand and Stars',
    author: 'Antoine de Saint-Exupéry',
    genre: 'Memoir',
    pages: 224,
    language: 'English',
    description: 'A deeply philosophical memoir by the legendary pilot detailing his adventures, mail runs, and near-fatal crash in the Sahara desert.',
    ownership_type: 'bought' as const,
    purchase_price: 18.00,
    date_added: '2026-06-08',
    isbn: '9780156027496',
    publisher: 'Harcourt Brace',
    publication_year: 1939,
    edition: 'Harvest Book'
  }
];

export const authService = {
  async initDemoData(userId: string) {
    // Check if user already has books to avoid duplicating on every load
    const existingBooks = await dbService.getBooks(userId);
    if (existingBooks.length > 0) return;

    // Seed demo books
    for (const b of DEMO_BOOKS) {
      await dbService.addBook({
        ...b,
        user_id: userId
      });
    }

    // Seed demo read lists
    const list1 = await dbService.createReadList(userId, 'French Classics', '#3B5659');
    const list2 = await dbService.createReadList(userId, 'Must Read Summer', '#D95B72');

    // Link books to lists
    const books = await dbService.getBooks(userId);
    const stranger = books.find(b => b.title === 'The Stranger');
    const bovary = books.find(b => b.title === 'Madame Bovary');
    const prince = books.find(b => b.title === 'The Little Prince');

    if (stranger && list1) {
      await dbService.addBookToReadList(stranger.id, list1.id);
    }
    if (bovary && list1) {
      await dbService.addBookToReadList(bovary.id, list1.id);
    }
    if (prince && list2) {
      await dbService.addBookToReadList(prince.id, list2.id);
    }
    if (stranger && list2) {
      await dbService.addBookToReadList(stranger.id, list2.id);
    }
  },

  async signUp(email: string, displayName: string): Promise<User> {
    if (typeof window === 'undefined') return DEMO_USER;

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await dbService.getUserByEmail(normalizedEmail);
    if (existing) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(existing));
      return existing;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      display_name: displayName,
      invite_code: displayName.toUpperCase().substring(0, 3) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + new Date().getFullYear(),
      is_public: false,
      created_at: new Date().toISOString()
    };

    await dbService.saveUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
  },

  async signIn(email: string): Promise<User> {
    if (typeof window === 'undefined') return DEMO_USER;
    
    const normalizedEmail = email.toLowerCase().trim();
    
    if (normalizedEmail === DEMO_USER.email.toLowerCase()) {
      await dbService.saveUser(DEMO_USER);
      await this.initDemoData(DEMO_USER.id);
      localStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
      return DEMO_USER;
    }

    // Look up user in DB by email
    const dbUser = await dbService.getUserByEmail(normalizedEmail);
    if (dbUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(dbUser));
      return dbUser;
    }

    // Create user if signing in for the first time in local mode
    return this.signUp(normalizedEmail, normalizedEmail.split('@')[0]);
  },

  async signOut(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_KEY);
    document.cookie = 'booker_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  },

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      return null;
    }
    
    try {
      const parsed = JSON.parse(session) as User;
      // Fetch fresh version from DB
      const fresh = await dbService.getUser(parsed.id);
      return fresh || parsed;
    } catch {
      return null;
    }
  },

  async updateProfile(id: string, updates: Partial<Omit<User, 'id' | 'email' | 'created_at'>>): Promise<User> {
    const fresh = await dbService.getUser(id);
    if (!fresh) throw new Error('User not found');

    const updatedUser: User = {
      ...fresh,
      ...updates
    };

    await dbService.saveUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    }
    return updatedUser;
  }
};

import { openDB, IDBPDatabase } from 'idb';
import { Book, ReadList, ReadListBook, Invitation, User } from '../types';

const DB_NAME = 'booker_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('books')) {
          const bookStore = db.createObjectStore('books', { keyPath: 'id' });
          bookStore.createIndex('user_id', 'user_id', { unique: false });
          bookStore.createIndex('genre', 'genre', { unique: false });
        }
        if (!db.objectStoreNames.contains('read_lists')) {
          const listStore = db.createObjectStore('read_lists', { keyPath: 'id' });
          listStore.createIndex('user_id', 'user_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('read_list_books')) {
          const joinStore = db.createObjectStore('read_list_books', { keyPath: 'id' });
          joinStore.createIndex('list_id', 'list_id', { unique: false });
          joinStore.createIndex('book_id', 'book_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('invitations')) {
          const invStore = db.createObjectStore('invitations', { keyPath: 'id' });
          invStore.createIndex('token', 'token', { unique: true });
          invStore.createIndex('inviter_id', 'inviter_id', { unique: false });
        }
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('invite_code', 'invite_code', { unique: true });
        }
      },
    });
  }
  return dbPromise;
}

// Helper to check and cleanup expired soft-deleted books (older than 30 days)
async function cleanExpiredSoftDeletes(db: IDBPDatabase) {
  const tx = db.transaction('books', 'readwrite');
  const store = tx.objectStore('books');
  const books = await store.getAll();
  const now = new Date();
  
  for (const book of books) {
    if (book.is_deleted && book.deleted_at) {
      const deletedDate = new Date(book.deleted_at);
      const diffTime = Math.abs(now.getTime() - deletedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 30) {
        await store.delete(book.id);
      }
    }
  }
  await tx.done;
}

export const dbService = {
  // --- USER OPERATIONS ---
  async saveUser(user: User): Promise<User> {
    const db = await getDB();
    if (!db) return user;
    await db.put('users', user);
    return user;
  },

  async getUser(id: string): Promise<User | null> {
    const db = await getDB();
    if (!db) return null;
    return (await db.get('users', id)) || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDB();
    if (!db) return null;
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const index = store.index('email');
    const user = await index.get(email.toLowerCase());
    await tx.done;
    return user || null;
  },

  async getUserByInviteCode(inviteCode: string): Promise<User | null> {
    const db = await getDB();
    if (!db) return null;
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const index = store.index('invite_code');
    const user = await index.get(inviteCode);
    await tx.done;
    return user || null;
  },

  // --- BOOK OPERATIONS ---
  async getBooks(userId: string, includeDeleted = false): Promise<Book[]> {
    const db = await getDB();
    if (!db) return [];
    
    // Automatically trigger soft-delete cleanup when listing books
    await cleanExpiredSoftDeletes(db);
    
    const tx = db.transaction('books', 'readonly');
    const store = tx.objectStore('books');
    const index = store.index('user_id');
    const books = await index.getAll(userId);
    await tx.done;
    
    if (includeDeleted) {
      return books;
    }
    return books.filter(b => !b.is_deleted);
  },

  async getBook(id: string): Promise<Book | null> {
    const db = await getDB();
    if (!db) return null;
    return (await db.get('books', id)) || null;
  },

  async addBook(bookData: Omit<Book, 'id' | 'is_deleted' | 'created_at' | 'updated_at'>): Promise<Book> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const newBook: Book = {
      ...bookData,
      id: crypto.randomUUID(),
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await db.put('books', newBook);
    return newBook;
  },

  async updateBook(id: string, updates: Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>): Promise<Book> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const book = await this.getBook(id);
    if (!book) throw new Error('Book not found');
    
    const updatedBook: Book = {
      ...book,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await db.put('books', updatedBook);
    return updatedBook;
  },

  async softDeleteBook(id: string): Promise<void> {
    await this.updateBook(id, {
      is_deleted: true,
      deleted_at: new Date().toISOString()
    });
  },

  async restoreBook(id: string): Promise<void> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const book = await this.getBook(id);
    if (!book) throw new Error('Book not found');
    
    const updatedBook: Book = {
      ...book,
      is_deleted: false,
      deleted_at: undefined,
      updated_at: new Date().toISOString()
    };
    
    await db.put('books', updatedBook);
  },

  async permanentlyDeleteBook(id: string): Promise<void> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    // Remove from join table first
    const tx = db.transaction(['books', 'read_list_books'], 'readwrite');
    await tx.objectStore('books').delete(id);
    
    // Scan and delete read list links
    const joinStore = tx.objectStore('read_list_books');
    const links = await joinStore.getAll();
    for (const link of links) {
      if (link.book_id === id) {
        await joinStore.delete(link.id);
      }
    }
    await tx.done;
  },

  // --- READING LIST OPERATIONS ---
  async getReadLists(userId: string): Promise<ReadList[]> {
    const db = await getDB();
    if (!db) return [];
    
    const tx = db.transaction('read_lists', 'readonly');
    const store = tx.objectStore('read_lists');
    const index = store.index('user_id');
    const lists = await index.getAll(userId);
    await tx.done;
    return lists;
  },

  async createReadList(userId: string, name: string, color: string): Promise<ReadList> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const newList: ReadList = {
      id: crypto.randomUUID(),
      user_id: userId,
      name,
      color,
      created_at: new Date().toISOString()
    };
    
    await db.put('read_lists', newList);
    return newList;
  },

  async deleteReadList(id: string): Promise<void> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const tx = db.transaction(['read_lists', 'read_list_books'], 'readwrite');
    await tx.objectStore('read_lists').delete(id);
    
    const joinStore = tx.objectStore('read_list_books');
    const links = await joinStore.getAll();
    for (const link of links) {
      if (link.list_id === id) {
        await joinStore.delete(link.id);
      }
    }
    await tx.done;
  },

  async addBookToReadList(bookId: string, listId: string): Promise<void> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const id = `${listId}_${bookId}`;
    const newLink = {
      id,
      list_id: listId,
      book_id: bookId,
      added_at: new Date().toISOString()
    };
    
    await db.put('read_list_books', newLink);
  },

  async removeBookFromReadList(bookId: string, listId: string): Promise<void> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const id = `${listId}_${bookId}`;
    await db.delete('read_list_books', id);
  },

  async getBooksInReadList(listId: string): Promise<Book[]> {
    const db = await getDB();
    if (!db) return [];
    
    const tx = db.transaction(['read_list_books', 'books'], 'readonly');
    const joinStore = tx.objectStore('read_list_books');
    const bookStore = tx.objectStore('books');
    
    const index = joinStore.index('list_id');
    const links = await index.getAll(listId);
    
    const books: Book[] = [];
    for (const link of links) {
      const book = await bookStore.get(link.book_id);
      if (book && !book.is_deleted) {
        books.push(book);
      }
    }
    await tx.done;
    return books;
  },

  async getReadListsForBook(bookId: string): Promise<ReadList[]> {
    const db = await getDB();
    if (!db) return [];
    
    const tx = db.transaction(['read_list_books', 'read_lists'], 'readonly');
    const joinStore = tx.objectStore('read_list_books');
    const listStore = tx.objectStore('read_lists');
    
    const index = joinStore.index('book_id');
    const links = await index.getAll(bookId);
    
    const lists: ReadList[] = [];
    for (const link of links) {
      const list = await listStore.get(link.list_id);
      if (list) {
        lists.push(list);
      }
    }
    await tx.done;
    return lists;
  },

  // --- INVITATION OPERATIONS ---
  async getInvitations(userId: string): Promise<Invitation[]> {
    const db = await getDB();
    if (!db) return [];
    
    const tx = db.transaction('invitations', 'readonly');
    const store = tx.objectStore('invitations');
    const index = store.index('inviter_id');
    const invs = await index.getAll(userId);
    await tx.done;
    return invs;
  },

  async createInvitation(inviterId: string, inviteeEmail: string): Promise<Invitation> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const newInv: Invitation = {
      id: crypto.randomUUID(),
      inviter_id: inviterId,
      invitee_email: inviteeEmail,
      status: 'pending',
      token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiration
      created_at: new Date().toISOString()
    };
    
    await db.put('invitations', newInv);
    return newInv;
  },

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    const db = await getDB();
    if (!db) return null;
    
    const tx = db.transaction('invitations', 'readonly');
    const store = tx.objectStore('invitations');
    const index = store.index('token');
    const inv = await index.get(token);
    await tx.done;
    
    return inv || null;
  },

  async acceptInvitation(token: string): Promise<Invitation> {
    const db = await getDB();
    if (!db) throw new Error('DB not initialized');
    
    const inv = await this.getInvitationByToken(token);
    if (!inv) throw new Error('Invitation not found');
    if (inv.status !== 'pending') throw new Error('Invitation already processed');
    if (new Date(inv.expires_at) < new Date()) {
      inv.status = 'expired';
      await db.put('invitations', inv);
      throw new Error('Invitation expired');
    }
    
    inv.status = 'accepted';
    await db.put('invitations', inv);
    return inv;
  }
};

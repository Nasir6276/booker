import { openDB, IDBPDatabase } from 'idb';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  deleteField,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db as firestoreDb, isFirebaseConfigured } from '../lib/firebase';
import { Book, ReadList, ReadListBook, Invitation, User } from '../types';

const DB_NAME = 'booker_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getLocalDB(): Promise<IDBPDatabase> | null {
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

// Helper to check and cleanup expired soft-deleted books (older than 30 days) in local IndexedDB
async function cleanExpiredSoftDeletesLocal(db: IDBPDatabase) {
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
    if (isFirebaseConfigured()) {
      const userRef = doc(firestoreDb, 'users', user.id);
      await setDoc(userRef, user, { merge: true });
      return user;
    }

    const localDb = await getLocalDB();
    if (!localDb) return user;
    await localDb.put('users', user);
    return user;
  },

  async getUser(id: string): Promise<User | null> {
    if (isFirebaseConfigured()) {
      const userRef = doc(firestoreDb, 'users', id);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        return snap.data() as User;
      }
      return null;
    }

    const localDb = await getLocalDB();
    if (!localDb) return null;
    return (await localDb.get('users', id)) || null;
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const normalized = email.toLowerCase().trim();
    if (isFirebaseConfigured()) {
      const q = query(collection(firestoreDb, 'users'), where('email', '==', normalized));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return querySnap.docs[0].data() as User;
      }
      return null;
    }

    const localDb = await getLocalDB();
    if (!localDb) return null;
    const tx = localDb.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const index = store.index('email');
    const user = await index.get(normalized);
    await tx.done;
    return user || null;
  },

  async getUserByInviteCode(inviteCode: string): Promise<User | null> {
    const cleanCode = inviteCode.trim().toUpperCase();
    if (isFirebaseConfigured()) {
      const q = query(collection(firestoreDb, 'users'), where('invite_code', '==', cleanCode));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        return querySnap.docs[0].data() as User;
      }
      return null;
    }

    const localDb = await getLocalDB();
    if (!localDb) return null;
    const tx = localDb.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    const index = store.index('invite_code');
    const user = await index.get(cleanCode);
    await tx.done;
    return user || null;
  },

  // --- BOOK OPERATIONS ---
  async getBooks(userId: string, includeDeleted = false): Promise<Book[]> {
    if (isFirebaseConfigured()) {
      const q = query(collection(firestoreDb, 'books'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      const now = new Date();
      const books: Book[] = [];

      for (const d of snap.docs) {
        const book = d.data() as Book;
        if (book.is_deleted && book.deleted_at) {
          const deletedDate = new Date(book.deleted_at);
          const diffDays = Math.ceil(Math.abs(now.getTime() - deletedDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays > 30) {
            // Clean up expired soft-deleted book in background
            deleteDoc(doc(firestoreDb, 'books', book.id)).catch(() => {});
            continue;
          }
        }

        if (includeDeleted || !book.is_deleted) {
          books.push(book);
        }
      }
      return books;
    }

    const localDb = await getLocalDB();
    if (!localDb) return [];
    await cleanExpiredSoftDeletesLocal(localDb);
    
    const tx = localDb.transaction('books', 'readonly');
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
    if (isFirebaseConfigured()) {
      const snap = await getDoc(doc(firestoreDb, 'books', id));
      return snap.exists() ? (snap.data() as Book) : null;
    }

    const localDb = await getLocalDB();
    if (!localDb) return null;
    return (await localDb.get('books', id)) || null;
  },

  async addBook(bookData: Omit<Book, 'id' | 'is_deleted' | 'created_at' | 'updated_at'>): Promise<Book> {
    const id = crypto.randomUUID();
    const newBook: Book = {
      ...bookData,
      id,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isFirebaseConfigured()) {
      await setDoc(doc(firestoreDb, 'books', id), newBook);
      return newBook;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    await localDb.put('books', newBook);
    return newBook;
  },

  async updateBook(id: string, updates: Partial<Omit<Book, 'id' | 'created_at' | 'updated_at'>>): Promise<Book> {
    const existing = await this.getBook(id);
    if (!existing) throw new Error('Book not found');

    const updatedBook: Book = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (isFirebaseConfigured()) {
      await setDoc(doc(firestoreDb, 'books', id), updatedBook, { merge: true });
      return updatedBook;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    await localDb.put('books', updatedBook);
    return updatedBook;
  },

  async softDeleteBook(id: string): Promise<void> {
    await this.updateBook(id, {
      is_deleted: true,
      deleted_at: new Date().toISOString()
    });
  },

  async restoreBook(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      await updateDoc(doc(firestoreDb, 'books', id), {
        is_deleted: false,
        deleted_at: deleteField(),
        updated_at: new Date().toISOString()
      });
      return;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    const book = await this.getBook(id);
    if (!book) throw new Error('Book not found');
    
    const updatedBook: Book = {
      ...book,
      is_deleted: false,
      deleted_at: undefined,
      updated_at: new Date().toISOString()
    };
    await localDb.put('books', updatedBook);
  },

  async permanentlyDeleteBook(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      await deleteDoc(doc(firestoreDb, 'books', id));
      const q = query(collection(firestoreDb, 'read_list_books'), where('book_id', '==', id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
      return;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    
    const tx = localDb.transaction(['books', 'read_list_books'], 'readwrite');
    await tx.objectStore('books').delete(id);
    
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
    if (isFirebaseConfigured()) {
      const q = query(collection(firestoreDb, 'read_lists'), where('user_id', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as ReadList);
    }

    const localDb = await getLocalDB();
    if (!localDb) return [];
    
    const tx = localDb.transaction('read_lists', 'readonly');
    const store = tx.objectStore('read_lists');
    const index = store.index('user_id');
    const lists = await index.getAll(userId);
    await tx.done;
    return lists;
  },

  async createReadList(userId: string, name: string, color: string): Promise<ReadList> {
    const id = crypto.randomUUID();
    const newList: ReadList = {
      id,
      user_id: userId,
      name,
      color,
      created_at: new Date().toISOString()
    };

    if (isFirebaseConfigured()) {
      await setDoc(doc(firestoreDb, 'read_lists', id), newList);
      return newList;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    await localDb.put('read_lists', newList);
    return newList;
  },

  async deleteReadList(id: string): Promise<void> {
    if (isFirebaseConfigured()) {
      await deleteDoc(doc(firestoreDb, 'read_lists', id));
      const q = query(collection(firestoreDb, 'read_list_books'), where('list_id', '==', id));
      const snap = await getDocs(q);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
      return;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    
    const tx = localDb.transaction(['read_lists', 'read_list_books'], 'readwrite');
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
    const id = `${listId}_${bookId}`;
    const newLink: ReadListBook = {
      list_id: listId,
      book_id: bookId,
      added_at: new Date().toISOString()
    };

    if (isFirebaseConfigured()) {
      await setDoc(doc(firestoreDb, 'read_list_books', id), newLink);
      return;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    await localDb.put('read_list_books', { id, ...newLink });
  },

  async removeBookFromReadList(bookId: string, listId: string): Promise<void> {
    const id = `${listId}_${bookId}`;
    if (isFirebaseConfigured()) {
      await deleteDoc(doc(firestoreDb, 'read_list_books', id));
      return;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    await localDb.delete('read_list_books', id);
  },

  async getBooksInReadList(listId: string): Promise<Book[]> {
    if (isFirebaseConfigured()) {
      const q = query(collection(firestoreDb, 'read_list_books'), where('list_id', '==', listId));
      const snap = await getDocs(q);
      const books: Book[] = [];

      for (const d of snap.docs) {
        const link = d.data() as ReadListBook;
        const bookSnap = await getDoc(doc(firestoreDb, 'books', link.book_id));
        if (bookSnap.exists()) {
          const book = bookSnap.data() as Book;
          if (!book.is_deleted) {
            books.push(book);
          }
        }
      }
      return books;
    }

    const localDb = await getLocalDB();
    if (!localDb) return [];
    
    const tx = localDb.transaction(['read_list_books', 'books'], 'readonly');
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
    if (isFirebaseConfigured()) {
      const q = query(collection(firestoreDb, 'read_list_books'), where('book_id', '==', bookId));
      const snap = await getDocs(q);
      const lists: ReadList[] = [];

      for (const d of snap.docs) {
        const link = d.data() as ReadListBook;
        const listSnap = await getDoc(doc(firestoreDb, 'read_lists', link.list_id));
        if (listSnap.exists()) {
          lists.push(listSnap.data() as ReadList);
        }
      }
      return lists;
    }

    const localDb = await getLocalDB();
    if (!localDb) return [];
    
    const tx = localDb.transaction(['read_list_books', 'read_lists'], 'readonly');
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
    if (isFirebaseConfigured()) {
      const q = query(collection(firestoreDb, 'invitations'), where('inviter_id', '==', userId));
      const snap = await getDocs(q);
      return snap.docs.map((d: QueryDocumentSnapshot) => d.data() as Invitation);
    }

    const localDb = await getLocalDB();
    if (!localDb) return [];
    
    const tx = localDb.transaction('invitations', 'readonly');
    const store = tx.objectStore('invitations');
    const index = store.index('inviter_id');
    const invs = await index.getAll(userId);
    await tx.done;
    return invs;
  },

  async createInvitation(inviterId: string, inviteeEmail: string): Promise<Invitation> {
    const id = crypto.randomUUID();
    const newInv: Invitation = {
      id,
      inviter_id: inviterId,
      invitee_email: inviteeEmail,
      status: 'pending',
      token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };

    if (isFirebaseConfigured()) {
      await setDoc(doc(firestoreDb, 'invitations', id), newInv);
      return newInv;
    }

    const localDb = await getLocalDB();
    if (!localDb) throw new Error('DB not initialized');
    await localDb.put('invitations', newInv);
    return newInv;
  },

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    if (isFirebaseConfigured()) {
      const q = query(collection(firestoreDb, 'invitations'), where('token', '==', token));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs[0].data() as Invitation;
      }
      return null;
    }

    const localDb = await getLocalDB();
    if (!localDb) return null;
    
    const tx = localDb.transaction('invitations', 'readonly');
    const store = tx.objectStore('invitations');
    const index = store.index('token');
    const inv = await index.get(token);
    await tx.done;
    return inv || null;
  },

  async acceptInvitation(token: string): Promise<Invitation> {
    const inv = await this.getInvitationByToken(token);
    if (!inv) throw new Error('Invitation not found');
    if (inv.status !== 'pending') throw new Error('Invitation already processed');
    if (new Date(inv.expires_at) < new Date()) {
      if (isFirebaseConfigured()) {
        await updateDoc(doc(firestoreDb, 'invitations', inv.id), { status: 'expired' });
      } else {
        const localDb = await getLocalDB();
        if (localDb) await localDb.put('invitations', { ...inv, status: 'expired' });
      }
      throw new Error('Invitation expired');
    }
    
    const updatedInv: Invitation = { ...inv, status: 'accepted' };
    if (isFirebaseConfigured()) {
      await updateDoc(doc(firestoreDb, 'invitations', inv.id), { status: 'accepted' });
    } else {
      const localDb = await getLocalDB();
      if (localDb) await localDb.put('invitations', updatedInv);
    }
    return updatedInv;
  }
};

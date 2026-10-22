'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { User } from '../types';
import { useBookerStore } from '../store/useBookerStore';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isFirebaseConfigured();

  useEffect(() => {
    if (!isConfigured) {
      // Graceful local mode fallback if Firebase keys aren't set yet
      const initLocal = async () => {
        try {
          const localUser = await authService.getCurrentUser();
          setUser(localUser);
          useBookerStore.setState({ user: localUser, loading: false });
        } catch {
          setUser(null);
          useBookerStore.setState({ user: null, loading: false });
        } finally {
          setLoading(false);
        }
      };
      initLocal();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        let appUser: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          display_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Reader',
          avatar_url: fbUser.photoURL || undefined,
          invite_code: `${(fbUser.displayName || fbUser.email || 'BKR').slice(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`,
          is_public: false,
          created_at: new Date().toISOString(),
        };

        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            appUser = snap.data() as User;
          } else {
            await setDoc(userRef, appUser);
            // Initialize sample demo collection for new users
            await authService.initDemoData(fbUser.uid);
          }
        } catch (err) {
          console.warn('Firestore user doc sync error (continuing with auth session):', err);
        }

        setUser(appUser);
        useBookerStore.setState({ user: appUser, loading: false });
        document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(appUser))}; path=/; max-age=2592000; SameSite=Lax`;

        // Load books and lists for the user in background
        try {
          const store = useBookerStore.getState();
          await store.fetchBooks();
          await store.fetchReadLists();
        } catch (e) {
          console.warn('Initial books fetch error:', e);
        }
      } else {
        // If Firebase auth has no active user, check if a local demo session exists
        const localUser = await authService.getCurrentUser();
        if (localUser) {
          setUser(localUser);
          useBookerStore.setState({ user: localUser, loading: false });
          document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(localUser))}; path=/; max-age=2592000; SameSite=Lax`;
          const store = useBookerStore.getState();
          await store.fetchBooks();
          await store.fetchReadLists();
        } else {
          setUser(null);
          useBookerStore.setState({ user: null, loading: false });
          document.cookie = 'booker_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      const local = await authService.signIn(email);
      setUser(local);
      useBookerStore.setState({ user: local, loading: false });
      document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
      await authService.initDemoData(local.id);
      const store = useBookerStore.getState();
      await store.fetchBooks();
      await store.fetchReadLists();
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = cred.user;
      const rawName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Reader';
      const cleanPrefix = rawName.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase() || 'BKR';
      const inviteCode = `${cleanPrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;

      const appUser: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        display_name: rawName,
        avatar_url: fbUser.photoURL || undefined,
        invite_code: inviteCode,
        is_public: false,
        created_at: new Date().toISOString(),
      };

      document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(appUser))}; path=/; max-age=2592000; SameSite=Lax`;
      setUser(appUser);
      useBookerStore.setState({ user: appUser, loading: false });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      // If Firebase Auth is not configured/enabled in the Firebase console, seamlessly fall back to local account
      if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
        console.warn('Firebase Auth provider not enabled in console, using local session:', code);
        const local = await authService.signIn(email);
        setUser(local);
        useBookerStore.setState({ user: local, loading: false });
        document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
        await authService.initDemoData(local.id);
        const store = useBookerStore.getState();
        await store.fetchBooks();
        await store.fetchReadLists();
        return;
      }
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    if (!isConfigured) {
      const local = await authService.signUp(email, displayName || email.split('@')[0]);
      setUser(local);
      useBookerStore.setState({ user: local, loading: false });
      document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
      await authService.initDemoData(local.id);
      const store = useBookerStore.getState();
      await store.fetchBooks();
      await store.fetchReadLists();
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = cred.user;
      if (displayName) {
        await updateProfile(fbUser, { displayName }).catch(() => {});
      }
      const rawName = displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Reader';
      const cleanPrefix = rawName.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase() || 'BKR';
      const inviteCode = `${cleanPrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;

      const appUser: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        display_name: rawName,
        avatar_url: fbUser.photoURL || undefined,
        invite_code: inviteCode,
        is_public: false,
        created_at: new Date().toISOString(),
      };

      document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(appUser))}; path=/; max-age=2592000; SameSite=Lax`;
      setUser(appUser);
      useBookerStore.setState({ user: appUser, loading: false });

      // Save user doc to Firestore in background
      try {
        await setDoc(doc(db, 'users', fbUser.uid), appUser, { merge: true });
        await authService.initDemoData(fbUser.uid);
      } catch (e) {
        console.warn('Firestore doc save error in background:', e);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
        console.warn('Firebase Auth provider not enabled in console, using local account:', code);
        const local = await authService.signUp(email, displayName || email.split('@')[0]);
        setUser(local);
        useBookerStore.setState({ user: local, loading: false });
        document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
        await authService.initDemoData(local.id);
        const store = useBookerStore.getState();
        await store.fetchBooks();
        await store.fetchReadLists();
        return;
      }
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      const inputEmail = window.prompt('Local mode: Enter your email to simulate Google sign-in:', 'user@gmail.com');
      if (inputEmail) {
        const local = await authService.signIn(inputEmail.trim());
        setUser(local);
        useBookerStore.setState({ user: local, loading: false });
        document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
        await authService.initDemoData(local.id);
        const store = useBookerStore.getState();
        await store.fetchBooks();
        await store.fetchReadLists();
      }
      return;
    }

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const fbUser = cred.user;
      const rawName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Reader';
      const cleanPrefix = rawName.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase() || 'BKR';
      const inviteCode = `${cleanPrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;

      const appUser: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        display_name: rawName,
        avatar_url: fbUser.photoURL || undefined,
        invite_code: inviteCode,
        is_public: false,
        created_at: new Date().toISOString(),
      };

      document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(appUser))}; path=/; max-age=2592000; SameSite=Lax`;
      setUser(appUser);
      useBookerStore.setState({ user: appUser, loading: false });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/configuration-not-found' || code === 'auth/operation-not-allowed') {
        const local = await authService.signIn('google.user@example.com');
        setUser(local);
        useBookerStore.setState({ user: local, loading: false });
        document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
        await authService.initDemoData(local.id);
        const store = useBookerStore.getState();
        await store.fetchBooks();
        await store.fetchReadLists();
        return;
      }
      throw err;
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!isConfigured) {
      return;
    }
    await sendPasswordResetEmail(auth, email.trim());
  };

  const signInAsDemo = async () => {
    setLoading(true);
    try {
      const local = await authService.signIn('jean.luc@minimalist.fr');
      setUser(local);
      useBookerStore.setState({ user: local, loading: false });
      document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
      await authService.initDemoData(local.id);
      const store = useBookerStore.getState();
      await store.fetchBooks();
      await store.fetchReadLists();
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (isConfigured && auth.currentUser) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.error('Firebase signout error:', e);
      }
    }
    await authService.signOut();
    setUser(null);
    setFirebaseUser(null);
    useBookerStore.setState({ user: null, books: [], readLists: [], selectedBookId: null, activeTab: 'dashboard' });
    document.cookie = 'booker_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const contextValue = useMemo(
    () => ({
      user,
      firebaseUser,
      loading,
      isConfigured,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      sendPasswordReset,
      signOut,
      signInAsDemo,
    }),
    [user, firebaseUser, loading, isConfigured]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

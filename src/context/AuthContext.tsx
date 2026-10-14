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
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);

          let appUser: User;
          if (snap.exists()) {
            appUser = snap.data() as User;
          } else {
            const rawName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Reader';
            const cleanPrefix = rawName.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase() || 'BKR';
            const inviteCode = `${cleanPrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;

            appUser = {
              id: fbUser.uid,
              email: fbUser.email || '',
              display_name: rawName,
              avatar_url: fbUser.photoURL || undefined,
              invite_code: inviteCode,
              is_public: false,
              created_at: new Date().toISOString(),
            };

            await setDoc(userRef, appUser);
            // Initialize sample demo collection for new users
            await authService.initDemoData(fbUser.uid);
          }

          setUser(appUser);
          useBookerStore.setState({ user: appUser, loading: false });
          document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(appUser))}; path=/; max-age=2592000; SameSite=Lax`;

          // Load books and lists for the user
          const store = useBookerStore.getState();
          await store.fetchBooks();
          await store.fetchReadLists();
        } catch (err) {
          console.error('Error fetching/syncing Firebase user document:', err);
          setUser(null);
          useBookerStore.setState({ user: null, loading: false });
        }
      } else {
        setUser(null);
        useBookerStore.setState({ user: null, loading: false });
        document.cookie = 'booker_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      const local = await authService.signIn(email);
      setUser(local);
      useBookerStore.setState({ user: local });
      document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
      return;
    }
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    if (!isConfigured) {
      const local = await authService.signUp(email, displayName || email.split('@')[0]);
      setUser(local);
      useBookerStore.setState({ user: local });
      document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
  };

  const signInWithGoogle = async () => {
    if (!isConfigured) {
      const inputEmail = window.prompt('Local mode: Enter your email to simulate Google sign-in:', 'user@gmail.com');
      if (inputEmail) {
        const local = await authService.signIn(inputEmail.trim());
        setUser(local);
        useBookerStore.setState({ user: local });
        document.cookie = `booker_session=${encodeURIComponent(JSON.stringify(local))}; path=/; max-age=2592000; SameSite=Lax`;
      }
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const sendPasswordReset = async (email: string) => {
    if (!isConfigured) {
      return;
    }
    await sendPasswordResetEmail(auth, email.trim());
  };

  const signOut = async () => {
    if (isConfigured) {
      await fbSignOut(auth);
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

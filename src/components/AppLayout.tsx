'use client';

import React, { useEffect, useState } from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { 
  BookOpen, 
  Library, 
  ListFilter, 
  Users, 
  Trash2, 
  Moon, 
  Sun, 
  LogOut,
  Wifi,
  WifiOff,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from './ProfileModal';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user: authUser, loading: authLoading, signOut } = useAuth();
  const { 
    user: storeUser, 
    activeTab, 
    setActiveTab, 
    isOffline 
  } = useBookerStore();

  const user = storeUser || authUser;

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('booker_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    useBookerStore.setState({ isOffline: !navigator.onLine });
    const handleOnline = () => useBookerStore.setState({ isOffline: false });
    const handleOffline = () => useBookerStore.setState({ isOffline: true });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in');
    }
  }, [authLoading, user, router]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('booker_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    window.location.href = '/sign-in';
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-serif text-4xl italic text-primary animate-pulse tracking-wide">Booker</h1>
          <div className="h-1 w-24 bg-border overflow-hidden rounded-full">
            <div className="h-full w-1/2 bg-primary rounded-full animate-infinite-scroll"></div>
          </div>
          <span className="text-xs text-muted tracking-wider uppercase font-sans mt-2">Loading Collection</span>
        </div>
        <style jsx global>{`
          @keyframes scroll {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
          .animate-infinite-scroll {
            animation: scroll 1.5s infinite linear;
          }
        `}</style>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'inventory', label: 'My Library', icon: Library },
    { id: 'lists', label: 'Reading Lists', icon: ListFilter },
    { id: 'social', label: 'Social & Share', icon: Users },
    { id: 'trash', label: 'Recycle Bin', icon: Trash2 },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background text-foreground transition-colors duration-200">

      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-secondary text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 font-medium z-50 select-none"
          >
            <WifiOff size={14} />
            <span>You are currently offline. Changes will save locally and sync when online.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Top Navigation */}
      <header className="flex h-16 w-full items-center justify-between border-b border-border bg-surface px-6 md:hidden">
        <h1 className="font-serif text-2xl italic font-semibold text-primary tracking-wide">Booker</h1>
        
        <div className="flex items-center gap-3">
          {isOffline ? <WifiOff size={16} className="text-secondary" /> : <Wifi size={16} className="text-primary/70" />}
          <button 
            onClick={toggleTheme} 
            className="p-2 text-muted hover:text-foreground rounded-full hover:bg-background transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background overflow-hidden hover:opacity-90"
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} className="text-muted" />
              )}
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-40">
                <div className="px-4 py-2 border-b border-border">
                  <div className="font-semibold text-sm truncate">{user.display_name}</div>
                  <div className="text-xs text-muted truncate">{user.email}</div>
                </div>
                <button 
                  onClick={() => { setShowProfileModal(true); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-background flex items-center gap-2"
                >
                  <UserIcon size={14} className="text-muted" /> Edit Profile
                </button>
                <button 
                  onClick={() => { handleSignOut(); setShowProfileMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-secondary hover:bg-background flex items-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-surface shrink-0 py-8 px-6 justify-between select-none">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="font-serif text-3xl italic font-semibold tracking-wide text-primary mb-1">Booker</h1>
            <span className="text-xs text-muted tracking-wider uppercase font-sans">Personal Library</span>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-card text-sm font-medium transition-all duration-150 group relative ${
                    isActive 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-muted hover:text-foreground hover:bg-background'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-muted group-hover:text-foreground'} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-3 w-1.5 h-1.5 bg-accent rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6">
          {/* User info & Settings */}
          <div 
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-3 px-2 cursor-pointer hover:bg-background/50 rounded-card p-2 transition-all"
            title="Edit Profile Settings"
          >
            <div className="w-10 h-10 rounded-full border border-border bg-background overflow-hidden relative shrink-0">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt={user.display_name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-full h-full p-2 text-muted" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold truncate leading-tight">{user.display_name}</span>
              <span className="text-xs text-muted truncate leading-none mt-0.5">{user.email}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pt-2 text-xs">
            <button 
              onClick={toggleTheme} 
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-border hover:bg-background text-muted hover:text-foreground transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={12} />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun size={12} />
                  <span>Light Mode</span>
                </>
              )}
            </button>
            
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-secondary/20 hover:bg-secondary/10 text-secondary hover:text-secondary transition-colors"
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 bg-background overflow-y-auto px-6 py-8 md:px-10 md:py-10 pb-24 md:pb-10">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 border-t border-border bg-surface/90 backdrop-blur-md flex items-center justify-around px-2 md:hidden z-30 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-primary' : 'text-muted'} />
              <span className="mt-1">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
      
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

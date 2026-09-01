'use client';

import React, { useState, useEffect } from 'react';
import { useBookerStore } from '../store/useBookerStore';
import { User, Invitation, Book } from '../types';
import { dbService } from '../services/db';
import { 
  Copy, 
  Check, 
  Send, 
  Search, 
  UserPlus, 
  Library, 
  Share2,
  Lock,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialView() {
  const { user, updateProfile } = useBookerStore();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [isPublic, setIsPublic] = useState(user?.is_public || false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Invite states
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Browse shared library states
  const [searchCode, setSearchCode] = useState('');
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchError, setSearchError] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    async function loadInvitations() {
      if (user) {
        const invs = await dbService.getInvitations(user.id);
        setInvitations(invs);
      }
    }
    loadInvitations();
  }, [user]);

  if (!user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      await updateProfile({
        display_name: displayName,
        avatar_url: avatarUrl || undefined,
        is_public: isPublic
      });
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/invite/${user.invite_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    try {
      const inv = await dbService.createInvitation(user.id, inviteEmail);
      setInvitations(prev => [inv, ...prev]);
      setInviteEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleSearchFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchedUser(null);
    setSearchedBooks([]);

    try {
      // Simulate API call and latency
      await new Promise(r => setTimeout(r, 600));

      // SOPHIA demo library bypass
      if (searchCode.toUpperCase().includes('SOPHIA')) {
        const sophiaUser: User = {
          id: 'sophia-demo-id',
          email: 'sophia.reading@classic.fr',
          display_name: 'Sophia Reading',
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256&h=256',
          invite_code: 'SOPHIA-9988',
          is_public: true,
          created_at: new Date().toISOString()
        };
        const sophiaBooks: Book[] = [
          {
            id: 'sophia-b1',
            user_id: 'sophia-demo-id',
            title: 'No Exit (Huis Clos)',
            author: 'Jean-Paul Sartre',
            genre: 'Drama',
            pages: 120,
            language: 'French',
            description: 'A depiction of the afterlife, in which three deceased characters are locked in a room together for eternity. Out of this, the iconic phrase "Hell is other people" was born.',
            ownership_type: 'bought',
            date_added: '2026-03-01',
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'sophia-b2',
            user_id: 'sophia-demo-id',
            title: 'Journey to the End of the Night',
            author: 'Louis-Ferdinand Céline',
            genre: 'Fiction',
            pages: 448,
            language: 'French',
            description: 'Following Ferdinand Bardamu, a soldier disillusioned by the pointlessness and horror of WWI, traveling through colonial Africa and America.',
            ownership_type: 'bought',
            date_added: '2026-05-10',
            is_deleted: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setSearchedUser(sophiaUser);
        setSearchedBooks(sophiaBooks);
      } else {
        // Look up in our IndexedDB users
        const match = await dbService.getUserByInviteCode(searchCode.trim().toUpperCase());
        if (match) {
          if (match.is_public) {
            const matchBooks = await dbService.getBooks(match.id);
            setSearchedUser(match);
            setSearchedBooks(matchBooks);
          } else {
            setSearchError('This user\'s bookshelf is private.');
          }
        } else {
          setSearchError('No user found with this invite code. Try "SOPHIA-9988" for a demo!');
        }
      }
    } catch (err) {
      console.error(err);
      setSearchError('An error occurred during search.');
    } finally {
      setSearching(false);
    }
  };

  const getInitials = (title: string, author: string) => {
    return ((title.charAt(0) || '') + (author.charAt(0) || '')).toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Left Column: Profile Card & Invite system */}
      <div className="flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-surface border border-border p-6 rounded-card shadow-sm">
          <h3 className="font-serif text-xl font-bold mb-4">My Cabinet Profile</h3>
          
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="px-3.5 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="px-3.5 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="flex items-center justify-between border border-border p-3.5 rounded-card bg-background/30 mt-2">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  {isPublic ? <Globe size={14} className="text-primary" /> : <Lock size={14} className="text-muted" />}
                  <span>Bookshelf Visibility</span>
                </span>
                <span className="text-[11px] text-muted truncate mt-0.5">Allow friends with invite code to browse library</span>
              </div>
              
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center p-0.5 cursor-pointer ${
                  isPublic ? 'bg-primary justify-end' : 'bg-border justify-start'
                }`}
              >
                <motion.div layout className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            {profileSuccess && (
              <span className="text-primary text-xs font-semibold self-start mt-2">✓ Profile updated successfully</span>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-white font-medium py-2.5 rounded-input text-xs transition-colors mt-2 cursor-pointer"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Invite System */}
        <div className="bg-surface border border-border p-6 rounded-card shadow-sm flex flex-col gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-primary">Invite Collaborators</h3>
            <p className="text-muted text-xs mt-0.5">Share your library and invite friends to read</p>
          </div>

          {/* Share code box */}
          <div className="flex items-center justify-between bg-background border border-border p-3 rounded-card text-sm">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Invite Code</span>
              <code className="font-semibold truncate mt-0.5">{user.invite_code}</code>
            </div>
            
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full font-bold cursor-pointer transition-colors"
            >
              {copiedLink ? <Check size={12} /> : <Copy size={12} />}
              <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

          <hr className="border-border/60" />

          {/* Send Invite Form */}
          <form onSubmit={handleSendInvite} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-muted">Invite Friend by Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@library.com"
                  className="flex-1 px-3.5 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="bg-primary hover:bg-primary/95 disabled:bg-primary/50 text-white p-2.5 rounded-input transition-colors cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </form>

          {/* Sent invites list */}
          <div className="flex flex-col gap-2.5 mt-2">
            <h4 className="text-[11px] uppercase tracking-wider font-semibold text-muted">Sent Invitations</h4>
            <div className="border border-border/80 rounded-card divide-y divide-border/80 max-h-32 overflow-y-auto">
              {invitations.length > 0 ? (
                invitations.map(inv => (
                  <div key={inv.id} className="p-2.5 flex justify-between items-center text-xs">
                    <span className="truncate max-w-[160px] font-sans font-medium">{inv.invitee_email}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      inv.status === 'accepted' 
                        ? 'bg-primary/10 border-primary/20 text-primary' 
                        : inv.status === 'expired' 
                        ? 'bg-secondary/10 border-secondary/20 text-secondary' 
                        : 'bg-accent/15 border-accent/20 text-amber-700 dark:text-accent'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                ))
              ) : (
                <span className="block text-[11px] text-muted text-center py-4 italic">No invites sent yet.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Explore shared bookshelf */}
      <div className="bg-surface border border-border p-6 rounded-card shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="font-serif text-xl font-bold">Explore Shared Libraries</h3>
          <p className="text-muted text-xs mt-0.5">Search and view collections of fellow book curations</p>
        </div>

        <form onSubmit={handleSearchFriend} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter friend's Invite Code..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="flex-1 px-3.5 py-2 border border-border rounded-input bg-background text-sm focus:outline-none focus:border-primary transition-colors"
            required
          />
          <button
            type="submit"
            disabled={searching}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-input text-xs font-semibold transition-colors cursor-pointer"
          >
            <Search size={13} />
            <span>{searching ? 'Browsing...' : 'Browse'}</span>
          </button>
        </form>

        {searchError && (
          <span className="text-secondary text-xs font-semibold">{searchError}</span>
        )}

        {/* Browser shared library details */}
        <AnimatePresence mode="wait">
          {searchedUser ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 border border-border p-4 rounded-card bg-background/30"
            >
              {/* Friend profile details */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-border overflow-hidden shrink-0 bg-background">
                  {searchedUser.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={searchedUser.avatar_url} alt={searchedUser.display_name} className="w-full h-full object-cover" />
                  ) : (
                    <UserPlus className="w-full h-full p-2 text-muted" />
                  )}
                </div>
                <div>
                  <h4 className="font-serif text-sm font-semibold">{searchedUser.display_name}</h4>
                  <span className="text-[10px] text-muted uppercase font-bold tracking-widest">{searchedUser.invite_code}</span>
                </div>
              </div>

              {/* Friend catalog listing */}
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                  <Library size={12} /> Public Bookshelf ({searchedBooks.length} books)
                </span>
                
                <div className="divide-y divide-border/80 border border-border/70 rounded-lg max-h-60 overflow-y-auto bg-surface">
                  {searchedBooks.length > 0 ? (
                    searchedBooks.map(book => (
                      <div key={book.id} className="p-3 flex items-center gap-3 text-xs">
                        {/* Mock Cover spine */}
                        <div className="w-6 h-9 bg-background border border-border rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                          {book.cover_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-serif text-[8px] font-bold text-primary/45">{getInitials(book.title, book.author)}</span>
                          )}
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary/20 border-r border-black/5" />
                        </div>
                        
                        <div className="min-w-0">
                          <h5 className="font-serif font-semibold truncate leading-tight">{book.title}</h5>
                          <p className="text-[10px] text-muted truncate mt-0.5">{book.author}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="block text-[11px] text-muted text-center py-6 italic">This user's catalog is empty.</span>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="border border-dashed border-border py-12 text-center rounded-card text-muted">
              <Share2 size={24} className="mx-auto mb-2 text-border animate-pulse" />
              <p className="text-sm">Search code: Try "SOPHIA-9988"</p>
              <p className="text-xs text-muted-foreground mt-0.5">Explore books shared by your peers.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

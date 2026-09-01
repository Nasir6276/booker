export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  invite_code: string;
  is_public: boolean;
  created_at: string;
}

export type OwnershipType = 'bought' | 'borrowed';
export type BorrowStatus = 'returned' | 'not_returned';

export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string;
  genre: string;
  pages?: number;
  language?: string;
  description?: string;
  cover_url?: string;
  
  // Ownership
  ownership_type: OwnershipType;
  purchase_price?: number;
  currency?: string;
  date_added: string;
  borrower_name?: string;
  return_date?: string;
  borrow_status?: BorrowStatus;
  
  // Identification
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  edition?: string;
  
  // Meta
  is_deleted: boolean;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ReadList {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface ReadListBook {
  list_id: string;
  book_id: string;
  added_at: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  status: InvitationStatus;
  token: string;
  expires_at: string;
  created_at: string;
}

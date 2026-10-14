# Architecture Context

## Stack

| Layer     | Technology                       | Role                                              |
| --------- | -------------------------------- | ------------------------------------------------- |
| Framework | Next.js 16 (App Router) + TS     | Application framework, SSR, routing & proxying   |
| UI        | Tailwind CSS v4 + Framer Motion  | Styling, design system tokens, animations         |
| Auth      | Firebase Authentication          | Email/Password, Google OAuth, session management  |
| Database  | Cloud Firestore (Firebase v13)   | Users, books, reading lists, with offline cache   |
| State     | Zustand                          | Global client application state & reactivity      |

## System Boundaries

- `src/lib/firebase.ts` — Firebase client initialization, Auth, Firestore persistent offline cache configuration.
- `src/context/AuthContext.tsx` — Reactive authentication provider, user profile synchronization to Firestore, sign in/up/out actions.
- `src/services/db.ts` — Cloud Firestore data access service with offline persistence and graceful local IndexedDB fallback.
- `src/services/auth.ts` — Local fallback and demo data seeder.
- `src/store/useBookerStore.ts` — Booker UI state, filtering, books & lists state cache.
- `src/proxy.ts` — Next.js 16 request proxy protecting `/dashboard` and routing authenticated users.

## Storage Model

- **Cloud Firestore**:
  - `users`: User profiles, display name, avatar, invite code, public flag.
  - `books`: Personal book inventory records, ownership type, lending metadata, soft deletion timestamps.
  - `read_lists`: Reading lists created by users with color tokens.
  - `read_list_books`: Link records connecting books to specific reading lists.
  - `invitations`: Invitation tokens, status (`pending`, `accepted`, `expired`), expires_at.

## Auth and Access Model

- Authentication is managed via Firebase Auth supporting Email/Password and Google Sign-In.
- Upon first sign-in (Email or Google), a user document is created in the `users` collection with an automated invite code.
- Route protection is managed via `src/proxy.ts` using secure session cookies and client-side guards in `AppLayout.tsx`.

## Invariants

1. Clerk authentication dependencies are strictly excluded from the codebase.
2. Firebase initialization handles build-time prerendering without failing on unconfigured keys.
3. Offline capabilities are preserved across all book management operations through Firestore's persistent local cache.
4. `npm run build` passes before any phase is considered complete.

# 📚 Booker — Personal Book Inventory App
### Product Requirements Document (PRD) · v1.0

---

## 1. Executive Summary

**Booker** is a mobile-first personal book inventory web application that allows users to track, manage, and categorize their book collections. It supports borrowing workflows, reading-list curation, and social discovery — designed with a clean, premium French-minimalist aesthetic.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Easy book entry | < 60 seconds to add a complete book |
| High retention | 7-day return rate > 40% |
| Social growth | 20% of users invite ≥ 1 friend |
| Offline reliability | Core features work with no internet |

---

## 3. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR, file-based routing, API routes |
| **Language** | TypeScript | Type safety, reusable component contracts |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first, design token support |
| **UI Components** | shadcn/ui (headless) | Accessible, unstyled base components |
| **State Management** | Zustand | Lightweight, no boilerplate |
| **Database** | Supabase (PostgreSQL) | Real-time, auth, RLS out of the box |
| **Auth** | Supabase Auth | Email/password + magic link + OAuth |
| **File Storage** | Supabase Storage | Book cover image uploads |
| **Offline Support** | PWA + IndexedDB (via idb) | Offline-first reads and writes |
| **Animations** | Framer Motion | Page transitions and micro-interactions |
| **Forms** | React Hook Form + Zod | Performant, type-safe validation |
| **Notifications** | Supabase Realtime + Web Push API | Borrowing return reminders |
| **Deployment** | Vercel | Edge functions, preview deploys |

---

## 4. Features & Scope

### 4.1 Book Entry — Add a Book
Users can add a book with three groups of fields:

**Basic Details** *(Required)*
- Book title
- Author
- Genre *(drives automatic categorization)*
- Number of pages
- Language
- Description / summary

**Ownership Details** *(Required)*
- Ownership type: `Bought` | `Borrowed`
- Purchase price *(if bought)*
- Date added
- Borrower's name *(if lent out)*
- Return date *(if borrowed/lent)*
- Borrow status: `Returned` | `Not Returned`

**Identification Details** *(Optional)*
- ISBN number
- Publisher
- Publication year
- Edition

### 4.2 Manage Entries
- Edit any field inline or via modal
- Soft-delete with 30-day recovery window
- Bulk actions (delete, move to list)

### 4.3 Categorization
- **Automatic**: Books are auto-bucketed by genre on creation
- **Manual Read Lists**: User-defined lists (e.g. "Summer 2025", "Must Read")
- A book can belong to multiple lists
- Search by name + filter by genre, status, date

### 4.4 Dashboard (Mobile-Optimized)
- Total books, books read, currently reading, borrowed out
- Reading progress card
- Recent entries
- Upcoming return-date reminders
- Quick-add floating action button (FAB)

### 4.5 Invite Friends
- Shareable invite link (unique per user)
- Invited friends see an "Explore" page of the inviter's public inventory
- Users can mark inventory as Public / Private

### 4.6 Offline Support
- Full read access while offline
- Queued writes synced on reconnect
- PWA installable on mobile homescreen

---

## 5. User Flows

### Add a Book
`Dashboard → FAB (+) → Multi-step form (Basic → Ownership → Identification) → Save → Book appears in inventory + auto-categorized`

### Manage Entry
`Inventory list → Tap book card → Book detail view → Edit icon → Edit form → Save`
`Inventory list → Long press / swipe → Delete → Confirm → Soft delete`

### Create a Read List
`Library → "Lists" tab → (+) New list → Name list → Add books from inventory`

### Invite a Friend
`Profile → "Invite Friends" → Copy link / Share → Friend opens link → Signs up → Sees public inventory`

---

## 6. Data Model

### `users`
```
id            uuid        PK
email         text        UNIQUE NOT NULL
display_name  text
avatar_url    text
invite_code   text        UNIQUE
is_public     boolean     DEFAULT false
created_at    timestamptz DEFAULT now()
```

### `books`
```
id               uuid        PK
user_id          uuid        FK → users.id
title            text        NOT NULL
author           text        NOT NULL
genre            text        NOT NULL
pages            integer
language         text
description      text
cover_url        text

-- Ownership
ownership_type   text        CHECK IN ('bought','borrowed')
purchase_price   numeric(10,2)
date_added       date        NOT NULL
borrower_name    text
return_date      date
borrow_status    text        CHECK IN ('returned','not_returned')

-- Identification (optional)
isbn             text
publisher        text
publication_year integer
edition          text

-- Meta
is_deleted       boolean     DEFAULT false
deleted_at       timestamptz
created_at       timestamptz DEFAULT now()
updated_at       timestamptz DEFAULT now()
```

### `read_lists`
```
id          uuid    PK
user_id     uuid    FK → users.id
name        text    NOT NULL
color       text
created_at  timestamptz DEFAULT now()
```

### `read_list_books` *(join table)*
```
list_id     uuid    FK → read_lists.id
book_id     uuid    FK → books.id
added_at    timestamptz DEFAULT now()
PRIMARY KEY (list_id, book_id)
```

### `invitations`
```
id             uuid    PK
inviter_id     uuid    FK → users.id
invitee_email  text
status         text    CHECK IN ('pending','accepted','expired')
token          text    UNIQUE
expires_at     timestamptz
created_at     timestamptz DEFAULT now()
```

---

## 7. Design System

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#3B5659` | Nav, buttons, headings |
| `--color-secondary` | `#D95B72` | CTAs, badges, alerts |
| `--color-accent` | `#D9BE36` | Highlights, progress, stars |
| `--color-background` | `#F2F2F2` | Page background (light) |
| `--color-surface` | `#FFFFFF` | Cards (light) |
| Dark mode `--color-background` | `#111718` | Page background (dark) |
| Dark mode `--color-surface` | `#1E2829` | Cards (dark) |

**Typography**: Playfair Display (headings) + DM Sans (body)
**Border radius**: 12px cards, 8px inputs, 999px pills
**Accessibility**: WCAG AA contrast on all colour pairings

---

## 8. Out of Scope (v1)

- AI reading recommendations
- Habit reports / reading analytics
- Native mobile apps (iOS / Android)
- Book marketplace / lending exchange

---

## 9. Milestones

| Phase | Deliverable | Est. Duration |
|---|---|---|
| 0 | Design system + component library | 1 week |
| 1 | Auth + book CRUD + dashboard | 2 weeks |
| 2 | Categorization + read lists | 1 week |
| 3 | Offline PWA + invite system | 1 week |
| 4 | Polish, a11y audit, dark mode QA | 3 days |

---

*Document owner: Engineering · Last updated: June 2026*

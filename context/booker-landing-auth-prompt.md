# Booker — Landing Page + Authentication Build Prompt

Use this as a direct build prompt for an AI coding assistant (e.g. Claude Code) or a developer brief. The Booker dashboard already exists — this prompt covers **only** the public landing page and the authentication flow that gates access to that dashboard.

---

## 1. Context

Booker is an existing Next.js 14 (App Router) + TypeScript personal book inventory app. The dashboard is already built. What's missing:

1. A **public marketing landing page** at `/`
2. A full **authentication flow** (sign in, sign up, reset password) that sits between the landing page and the dashboard
3. Route protection so the dashboard is only reachable once a user is authenticated

Everything must visually match the existing app — same design tokens, same fonts, same component style (shadcn/ui + Tailwind). Do not introduce a new visual language; extend the existing one.

---

## 2. Design System (must reuse exactly)

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#3B5659` | Nav, buttons, headings |
| `--color-secondary` | `#D95B72` | CTAs, badges, alerts |
| `--color-accent` | `#D9BE36` | Highlights, progress, stars |
| `--color-background` (light) | `#F2F2F2` | Page background |
| `--color-surface` (light) | `#FFFFFF` | Cards |
| `--color-background` (dark) | `#111718` | Page background |
| `--color-surface` (dark) | `#1E2829` | Cards |

- **Typography:** Playfair Display for headings, DM Sans for body text
- **Border radius:** 12px on cards, 8px on inputs, 999px (pill) on buttons/badges
- **Accessibility:** WCAG AA contrast on every color pairing, in both light and dark mode
- **Tech stack to stay consistent with:** Next.js 14 App Router, TypeScript, Tailwind CSS + CSS variables, shadcn/ui (headless components), React Hook Form + Zod for forms, Framer Motion for transitions, Supabase Auth (email/password, magic link, OAuth), Zustand for any client state needed on these pages

---

## 3. Landing Page — Section by Section

Build these as composable, reusable TypeScript components (one component per section) inside something like `app/(marketing)/page.tsx` with sections imported from `components/marketing/`.

### 3.1 Navbar
- Logo (left) + CTA buttons (right): "Sign In" (ghost/secondary style) and "Get Started" / "Sign Up" (primary pill button)
- Sticky on scroll, transparent-to-solid background transition using Framer Motion
- Mobile: collapses into a hamburger menu with the two CTAs still visible or in the drawer

### 3.2 Hero Section
- Large Playfair Display headline + supporting DM Sans subtext
- Primary CTA button ("Get Started" → routes to `/sign-up`) plus a secondary link/button (e.g. "See how it works" → scrolls to How It Works)
- Hero image or lightweight animation on the right (or below, on mobile) — e.g. an illustrated/mocked view of the book dashboard, using the accent color for highlights
- Should closely mirror the copy pattern in your reference screenshots: a bold value statement plus one supporting sentence

### 3.3 Value Proposition Section
- Sits directly beneath the hero
- Short 1–2 sentence framing that speaks to the visitor's problem ("You have books everywhere and no idea what you own, what's lent out, or what to read next") followed by a bolded promise line ("This is where your library gets organized.")
- Centered, generous vertical spacing, no card/background — plain text on the page background like the reference

### 3.4 Feature Showcase Section (with CTA)
- Split layout: real UI screenshot/mockup of the dashboard (book detail card, "Add a Book" flow, or reading progress) on one side, headline + short description + CTA button on the other
- Use this section to show 2–3 alternating instances if there's enough content (e.g. one for "Track your collection," one for "Never lose a borrowed book," one for "Curate reading lists") — text/image sides swap left-right each time
- Each instance ends in a CTA button routing to `/sign-up`

### 3.5 How It Works Section
- Centered headline: "How does it work?"
- 3 equal-width cards, each with: Step number label ("Step 1"), bold title, one-line description
- Suggested Booker-specific steps:
  1. **Add your books** — Enter a book in under a minute, with genre auto-categorization
  2. **Track & organize** — Manage ownership, lending status, and reading lists in one dashboard
  3. **Never lose track** — Get return-date reminders and pick up right where you left off

### 3.6 What Makes Booker Different
- Differentiator section — short headline + a small set of feature/benefit cards or a comparison-style layout (e.g. "Booker vs. a spreadsheet" or icon + short benefit list): offline-first, auto-categorization, borrow tracking, invite-only social discovery
- Keep visual weight lighter than the Feature Showcase section — this is more of a "why us" recap

### 3.7 Benefits / Testimonials
- Testimonial grid (3-column on desktop, stacking to 1-column on mobile) matching the reference pattern:
  - Quote icon top-left
  - Category/benefit tag pill top-right (e.g. "Saves time," "Stay organized," "Easy to use")
  - Quote text
  - Name + role/description at the bottom
- Since Booker has no real testimonials yet, use clearly-labeled placeholder content (e.g. `[Name]`, `[Role]`) so it's obvious what needs replacing before launch

### 3.8 Footer
- Columns or inline links: **Terms**, **Privacy**, **Cookies**, **About Us**
- **Terms** and **Privacy** must open in a new tab and load as a PDF document (`target="_blank"`, linking to a static PDF asset, e.g. `/legal/terms.pdf` and `/legal/privacy.pdf`)
- **Cookies** and **About Us** can be either in-page anchors, modal dialogs, or simple routed pages — pick whichever is fastest to implement without breaking the footer's visual rhythm
- Keep footer background on `--color-background`, text muted, consistent with the rest of the page

---

## 4. Authentication Flow

Build three pages under `app/(auth)/`: `sign-in`, `sign-up`, `reset-password`. Use Supabase Auth under the hood, React Hook Form + Zod for validation, and shadcn/ui form primitives styled with the existing tokens (12px cards, 8px inputs, pill buttons).

### 4.1 Sign In (`/sign-in`)
- Two entry paths, both visible on the same screen:
  1. **"Continue with Google"** button (Supabase OAuth)
  2. **Email/Username + Password** form (Supabase email/password sign-in)
- "Forgot password?" link under the password field → routes to `/reset-password`
- Link at the bottom: "Don't have an account? Sign up" → `/sign-up`
- On success → redirect to `/dashboard`
- On failure → inline error message (invalid credentials, unconfirmed email, etc.)

### 4.2 Sign Up (`/sign-up`)
- Same dual entry pattern:
  1. **"Continue with Google"** (Supabase OAuth sign-up)
  2. **Email + Password** form
- Password field must enforce and visibly display requirements as the user types (e.g. minimum length, upper/lowercase, number, special character) — use a small live checklist component, not just a validation error after submit
- Confirm-password field with match validation
- On success → Supabase sends confirmation email (if enabled) or logs the user in directly and redirects to `/dashboard`
- Link at the bottom: "Already have an account? Sign in" → `/sign-in`

### 4.3 Reset Password (`/reset-password`)
- Single email input field: "Enter your email and we'll send you a reset link"
- On submit → Supabase sends a password-reset email containing a link back to a `/reset-password/confirm` page where the user sets a new password (with the same live requirement checklist as sign-up)
- Show a clear success state after the email is sent ("Check your inbox for a reset link") rather than silently redirecting

### 4.4 Route Protection
- Wrap the dashboard route group in a server-side auth check (middleware or layout-level Supabase session check)
- Unauthenticated users hitting any `/dashboard/*` route should be redirected to `/sign-in`, with a `?redirect=` param so they land back where they intended after logging in
- Authenticated users hitting `/sign-in` or `/sign-up` should be redirected straight to `/dashboard`

---

## 5. File/Component Structure (suggested)

```
app/
  (marketing)/
    page.tsx                 → landing page, composes sections below
  (auth)/
    sign-in/page.tsx
    sign-up/page.tsx
    reset-password/page.tsx
    reset-password/confirm/page.tsx
  (dashboard)/
    layout.tsx                → add server-side auth guard here
components/
  marketing/
    navbar.tsx
    hero.tsx
    value-proposition.tsx
    feature-showcase.tsx
    how-it-works.tsx
    differentiators.tsx
    testimonials.tsx
    footer.tsx
  auth/
    google-auth-button.tsx
    sign-in-form.tsx
    sign-up-form.tsx
    reset-password-form.tsx
    password-requirements-checklist.tsx
lib/
  supabase/
    client.ts
    server.ts
    middleware.ts
public/
  legal/
    terms.pdf
    privacy.pdf
```

---

## 6. Deliverable Notes

- All new components should be typed, reusable, and follow the same prop-driven, composable pattern as the existing dashboard components (no inline one-off styling — use the shared design tokens)
- Every form must be fully accessible (labeled inputs, keyboard navigation, visible focus states, error messages tied to fields via `aria-describedby`)
- Mobile-first: the landing page and auth screens must look and function correctly at narrow viewports before desktop polish
- Dark mode should be supported end-to-end using the existing dark-mode tokens, not just on the dashboard

---

*Prepared from handwritten planning notes + Booker PRD v1.0 (June 2026).*

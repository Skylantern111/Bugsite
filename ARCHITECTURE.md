# BugSite — System Architecture

BugSite is a **deliberately vulnerable** e-commerce single-page app used for
security training and AI-agent evaluation. It ships **28 intentional frontend
bugs** that must keep working exactly as-is. A small Express + Firebase backend
was added to make the catalog and a few admin/community features data-driven —
**without touching any bug logic**.

> ⚠️ This is a training target. Do not enter real data anywhere. All 28 bugs are
> intentional — never "fix" them. See [`bug-site/bug-site/src/data/bugs.js`](bug-site/bug-site/src/data/bugs.js)
> and the in-app **Bug Index** (`/bugs`) for the canonical list.

---

## 1. High-level topology

```
┌─────────────────────────────┐        HTTP / JSON        ┌──────────────────────────┐        Admin SDK             ┌──────────────┐
│   React SPA (Vite dev :5173) │  ───── fetch ──────────►  │   Express API  (:4000)   │  ───────────────────────►    │   Firestore   │
│   bug-site/bug-site          │  ◄──── JSON ───────────   │   server/                │  ◄───────────────────────    │   (Firebase   │
│   - 17 routes / pages        │                           │   - products / reviews   │                              │    project or │
│   - 28 intentional bugs      │                           │   - stats aggregation    │                              │    emulator)  │
│   - CartContext (in-memory)  │                           │   - project id (no PII)  │                              └──────┬───────┘
└─────────────────────────────┘                           └──────────────────────────┘                                     │ views
                                                                                                                     ┌──────▼───────┐
        Catalog falls back to bundled static data if the API is down.                                                │  Firebase    │
        Reviews / Product Manager / Store Stats REQUIRE the API.                                                     │  console     │
                                                                                                                     └──────────────┘
```

Two independent processes, started in two terminals:

| Process   | Directory            | Command         | Port |
|-----------|----------------------|-----------------|------|
| Backend   | `server/`            | `npm run dev`   | 4000 |
| Frontend  | `bug-site/bug-site/` | `npm run dev`   | 5173 |

Setup and configuration details live in [`server/DATABASE.md`](server/DATABASE.md).

---

## 2. Repository layout

```
Bugsite/
├── ARCHITECTURE.md                 ← this file (whole-system design)
├── server/                         ← Express + Firebase (Firestore) backend
│   ├── index.js                    ← API routes (products, reviews, stats)
│   ├── db.js                       ← shared Firestore instance, emulator/prod switch
│   ├── seed.js                     ← loads products + reviews from frontend data
│   ├── package.json                ← scripts: start / dev / seed
│   ├── .env                        ← config (git-ignored, never commit)
│   ├── .env.example                ← template
│   ├── README.md                   ← backend quickstart
│   └── DATABASE.md                 ← DB config + run guide
└── bug-site/bug-site/              ← React SPA (Vite)
    └── src/
        ├── App.jsx                 ← router + providers + global widgets
        ├── lib/api.js              ← typed fetch client for the backend
        ├── data/                   ← products.js, reviews.js, bugs.js (source of truth)
        ├── context/                ← CartContext / cartStore (in-memory cart)
        ├── components/
        │   ├── layout/             ← NavBar (hover dropdowns), Footer, ErrorBoundary
        │   ├── ui/                 ← shared UI incl. BackendRequired empty-state
        │   └── widgets/            ← SupportChat, Newsletter, CookieConsent
        └── pages/                  ← 17 route components (see §4)
```

---

## 3. Backend (`server/`)

A thin, stateless Express app over the Firebase Admin SDK (Firestore). It exposes
only reference/store-management data — **no shopper PII, no carts, no orders.**

- **`db.js`** — lazy, shared Firestore instance (`getDb()` initializes once).
  Talks to the local **Firestore emulator** when `FIRESTORE_EMULATOR_HOST` is
  set, otherwise a real Firebase project via `GOOGLE_APPLICATION_CREDENTIALS`.
  Exports `config` (`projectId`, `usingEmulator`) for logging/health checks —
  there's no password to mask.
- **`index.js`** — the routes below. A `route()` wrapper gives every handler
  consistent `500` handling. `products` are keyed by `slug` and `reviews` by
  `id`, which double as Firestore document ids, so the frontend keys off the
  same `id`/`slug` fields either way.
- **`seed.js`** — **idempotent** (wipe + reinsert). Imports the frontend's own
  `products.js` and `reviews.js` so the DB is always a mirror of what the app
  ships with.

### API endpoints

| Method | Path                     | Purpose                                            | DB write |
|--------|--------------------------|----------------------------------------------------|:--------:|
| GET    | `/api/health`            | liveness + project id (no DB needed)               |    –     |
| GET    | `/api/products`          | all products                                       |    –     |
| GET    | `/api/products/:slug`    | one product (404 if missing)                       |    –     |
| GET    | `/api/categories`        | distinct category names                            |    –     |
| POST   | `/api/products`          | create (validates name+price, 409 on dup slug)     |    ✅    |
| PATCH  | `/api/products/:slug`    | update whitelisted fields (numbers coerced)        |    ✅    |
| DELETE | `/api/products/:slug`    | delete a product                                   |    ✅    |
| GET    | `/api/reviews?slug=`     | reviews, optionally filtered by product            |    –     |
| POST   | `/api/reviews`           | create review + recompute product rating/count     |    ✅    |
| DELETE | `/api/reviews/:id`       | delete a review                                    |    ✅    |
| GET    | `/api/stats`             | live aggregation: totals, by-category, low-stock   |    –     |

### Collections

| Collection | Docs | Key fields | Document id |
|------------|------|------------|-------------|
| `products` | 28   | `id, slug, name, category, brand, price(Number), stock(Number), rating, reviewCount, …` | `slug` |
| `reviews`  | 16   | `id(uuid), productSlug, productName, author, title, text, rating, createdAt` | `id` |

`price` / `stock` / `rating` are stored as real **Numbers** deliberately — this
matches the frontend's Bug 8 type-coercion model. Do not convert them to strings.

---

## 4. Frontend (`bug-site/bug-site/`)

React 19 + Vite + Tailwind v4, `react-router-dom` v7. `App.jsx` wires an error
boundary, `BrowserRouter`, `CartProvider`, the `NavBar`/`Footer` shell, and
global widgets (`SupportChatWidget` is keyed by pathname so it remounts on every
navigation — that remount is what powers Bugs 3 & 13).

### Routes / pages

| Route                | Page              | Data source            | Notes                                  |
|----------------------|-------------------|------------------------|----------------------------------------|
| `/`                  | Home              | static                 | Bug 9 (layout shift)                   |
| `/catalog`           | Catalog           | **API** + static fallback | Bugs 4, 18, 23; "Live from Firebase" badge |
| `/product/:slug`     | ProductDetails    | static                 | Bugs 5, 6, 14, 16                      |
| `/cart`              | Cart              | CartContext (memory)   | Bugs 2, 8                              |
| `/wishlist`          | Wishlist          | localStorage           | Bug 21                                 |
| `/checkout`          | Checkout          | CartContext            | Bugs 12, 24                            |
| `/account`           | Account           | localStorage           | Bugs 7, 15, 19                         |
| `/orders`            | Orders            | mocked                 | Bugs 10, 11                            |
| `/admin/analytics`   | AdminAnalytics    | mocked                 | Bugs 1, 17, 20, 25, 26, 27, 28         |
| `/deals`             | Deals             | static                 | —                                      |
| `/deals/:partnerSlug`| PartnerDeals      | query param            | Bug 22 (open redirect)                 |
| `/compare`           | Compare           | static                 | —                                      |
| `/notifications`     | Notifications     | static                 | —                                      |
| `/bugs`              | BugIndex          | `data/bugs.js`         | bug-free index of all 28               |
| `/reviews`           | Reviews           | **API only**           | DB-backed; no fallback                 |
| `/admin/products`    | AdminProducts     | **API only**           | DB-backed CRUD; no fallback            |
| `/admin/inventory`   | AdminInventory    | **API only**           | DB-backed aggregation; no fallback     |

### Navigation

`NavBar.jsx` groups pages into three **hover dropdown** menus on desktop
(**Shop**, **Account**, **Testing Lab**) plus a standalone **Home** link. Each
group button reveals its pages on hover/focus (a `pt-2` bridge keeps the menu
open while the cursor travels into it). On mobile the same groups render as
labeled sections inside the **burger** menu. Quick-action icons (notifications,
wishlist, cart, checkout) stay in the top bar.

### API client (`lib/api.js`)

Single fetch wrapper. `BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'`.
Exports `fetchProducts`, `createProduct`, `updateProduct`, `deleteProduct`,
`fetchReviews`, `createReview`, `deleteReview`, `fetchStats`. Non-2xx throws, so
DB-only pages can render the shared `BackendRequired` empty-state on failure.

---

## 5. Data flow examples

**Catalog (graceful):** `Catalog` mounts → `fetchProducts()` → on success swaps
static `PRODUCTS` for DB data and flips the badge to "● Live from Firebase"; on
failure keeps static data ("○ Static data"). Either way, Bugs 4/18/23 still fire.

**Post a review (DB-required):** Reviews form → `createReview()` → `POST /api/reviews`
→ backend validates the product exists, inserts the review, and re-aggregates the
product's `rating`/`reviewCount` from real DB data → new review prepended to the feed.

**Store Stats (DB-required):** `AdminInventory` → `fetchStats()` → `GET /api/stats`
fetches `products`/`reviews` from Firestore and aggregates totals/by-category/low-stock
in server code (Firestore has no group-by pipeline) → KPIs and charts render
entirely from server-computed values (no client-side math).

---

## 6. The 28 intentional bugs

Grouped as in the Bug Index. **Every one is intentional and must stay working.**

| # | Bug | Group | Where |
|---|-----|-------|-------|
| 1 | Stale Closure | State & Lifecycle | Analytics — Revenue by Category |
| 2 | State Mutation | Core Shopping | Cart — quantity stepper |
| 3 | Memory Leak | State & Lifecycle | Support chat widget (global) |
| 4 | Event Bubbling | Core Shopping | Catalog — Recently Viewed |
| 5 | A11y Violations | Content & Trust | PDP — star rating / like |
| 6 | XSS Vector | Content & Trust | PDP — product reviews (`dangerouslySetInnerHTML`) |
| 7 | Hidden Token | Content & Trust | Account — security panel |
| 8 | Type Coercion | Core Shopping | Cart — subtotal (string `""` accumulator) |
| 9 | Layout Shift | Core Shopping | Home — flash-sale CTA |
| 10 | Parse Failure | Data & Analytics | Orders — Track Package |
| 11 | Unmounted setState | State & Lifecycle | Orders — live tracking |
| 12 | History Desync | State & Lifecycle | Checkout — wizard step not in URL |
| 13 | Listener Accumulator | State & Lifecycle | Support chat widget (global) |
| 14 | Query Desync | Content & Trust | PDP — tabs not in query |
| 15 | Cache Pollution | State & Lifecycle | Account — profile cache |
| 16 | Broken Memoization | Content & Trust | PDP — You Might Also Like |
| 17 | Race Condition | State & Lifecycle | Analytics — refresh dashboard |
| 18 | Ghost Modal / DOM Leak | Core Shopping | Catalog — Quick View lightbox |
| 19 | Cross-Session Leak | State & Lifecycle | Account — account switcher |
| 20 | Infinite Render Loop | State & Lifecycle | Analytics — live refresh |
| 21 | Index as Key | Core Shopping | Wishlist — saved-item notes |
| 22 | Open Redirect | Content & Trust | Partner Deals — Visit Partner Store |
| 23 | Missing Debounce | Core Shopping | Catalog — search bar (`[API SPAM]`) |
| 24 | ReDoS | Data & Analytics | Checkout — promo code field |
| 25 | Graph Manipulation | Data & Analytics | Analytics — data-source toggle |
| 26 | Export Corruption | Data & Analytics | Analytics — CSV/JSON export |
| 27 | Timezone Desync | Data & Analytics | Analytics — timezone selector |
| 28 | Legend Desync | Data & Analytics | Analytics — revenue vs cost chart |

The backend does **not** interact with any of these. Bug-bearing files were never
modified when adding the database — new features live in new files plus additive
routes/nav links.

---

## 7. Tech stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/vite`), react-router-dom v7, lucide-react |
| Backend   | Node.js 18+ (ESM), Express 4, firebase-admin v14, cors, dotenv |
| Database  | Firebase Firestore (real project or local Firestore emulator) |
| Tooling   | Firebase console / Emulator UI (view/edit data) |

---

## 8. Security posture (by design)

- **Intentionally vulnerable frontend** — the 28 bugs include XSS, open redirect,
  ReDoS, hidden tokens, and cross-session leaks. That is the point; do not fix them.
- **Backend is narrow** — reference/store-management data only. No auth, no
  shopper PII, no orders. Safe to run locally against a throwaway database.
- **Credential hygiene** — `.env` and any `service-account*.json` key are
  git-ignored; the Admin SDK key is never logged or returned by `/api/health`;
  never paste a real service account key into chat, tickets, or screenshots.
```

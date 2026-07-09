# BugSite — Architectural Blueprint & Vulnerability Mapping Plan

**Status:** Planning document only. No application code has been written yet, per project directive.
**Source of truth for bugs:** [`bug-site/bug-site/src/component/VulnerableApp.tsx`](bug-site/bug-site/src/component/VulnerableApp.tsx) — a 28-bug reference demo currently rendered as isolated "cards" on a fake dashboard. This plan re-homes every one of those 28 bugs into real, functioning e-commerce features of **BugSite**, a Juice-Shop-style tech gadget storefront.

---

## 0. Design Principles

1. **No demo cards.** Every bug lives inside a feature a real shopper would actually use — search, product pages, cart, checkout, account, admin analytics.
2. **28 in, 28 out.** The matrix in Section 4 accounts for all 28 numbered bugs from the reference file, one-to-one, with no bugs invented and none dropped. One unnumbered bonus challenge (client-side-only form validation bypass) is preserved as a labeled extra, outside the 28-count.
3. **Fidelity over convenience.** Where the reference implementation doesn't actually reproduce its own badge (see Bug 11 below), BugSite's real implementation fixes the *fidelity* gap, not the bug itself.
4. **Bugs must survive `npm run build` and a real host.** Every tactic in Section 1 exists because a production pipeline (bundler, minifier, CDN, WAF) will otherwise silently "fix" several of these bugs by accident.

---

## 1. System Architecture Overview

### 1.1 Frontend
- **Stack:** React + Vite, evolving the existing scaffold at `bug-site/bug-site/` (TypeScript, Tailwind, lucide-react icons already present — reuse rather than re-scaffold).
- **Routing:** React Router (`BrowserRouter`) for real, shareable routes — **with two deliberate exceptions**:
  - The **Checkout wizard** keeps its step (`shipping → payment → review → confirm`) in local `useState`, not the URL. This is what preserves Bug 12 (History Desync): the browser Back button exits checkout instead of stepping backward, because there's no route to go back *to*.
  - The **Product Details tab switcher** (Overview/Reviews/Specs/Shipping) keeps the active tab in local `useState`, not a query param. This preserves Bug 14 (Query Desync): refreshing or sharing a PDP link always lands on Overview.
  - This asymmetry — some parts of the SPA route correctly, some silently don't — is intentional and should be documented in code comments so future maintainers don't "fix" it by accident.
- **State management:** Local component state + Context for auth/cart, matching the reference file's approach (no Redux/Zustand needed — several bugs, like State Mutation, specifically depend on raw `useState` array mutation, which a normalized store would mask).

### 1.2 Backend
- **Stack:** Node.js + Express, Mongoose ODM.
- **Local dev:** MongoDB Compass connected to `mongodb://localhost:27017/bugsite` for schema inspection and manual data edits during development/training-content authoring.
- **Production:** MongoDB Atlas (free/shared tier is sufficient — this is a training target, not a scale target).
- **API surface:** `/api/products`, `/api/reviews`, `/api/cart`, `/api/orders`, `/api/users`, `/api/coupons`, `/api/analytics`. Standard REST + JWT auth. The backend itself is written **correctly** — BugSite's vulnerabilities are a frontend catalog; the API returns clean, correctly-typed data (e.g. `price` is a real `Number`), so bugs like Type Coercion are demonstrably a *frontend* mishandling of good data, not a backend defect. This distinction matters for training: it teaches "the API is fine, the client broke it."
- **Reviews are stored and served unsanitized.** No server-side HTML stripping, no DOMPurify anywhere in the pipeline. This is what makes Bug 6 (XSS) real end-to-end rather than just a client-side sandbox trick.

### 1.3 Hosting
| Layer | Host | Why |
|---|---|---|
| Frontend (static build) | Vercel or Netlify | CDN-edge hosting for the SPA bundle |
| Backend (Express API) | Render or Railway | Needs an **always-on Node process**, not edge/serverless functions — several bugs depend on real client/server state divergence and in-memory counters that serverless cold-starts would reset unpredictably |
| Database | MongoDB Atlas | Managed, Compass-compatible for local dev parity |

### 1.4 Tactics for Preserving Bugs Through a Production Build & Host

These are the specific countermeasures against the four ways a "real" hosting pipeline tends to accidentally neuter intentional bugs:

**a) Defeating tree-shaking / dead-code elimination**
- Leaky `window.addEventListener` calls (Bug 3, Bug 13) must be written **inline inside the body of a mounted component's `useEffect`**, not factored into a standalone exported utility function. Rollup/Terser only eliminate code that is provably *unreached* (unused exports); code that executes as part of a rendered component's effect is always reachable and will never be stripped, regardless of how "obviously leaky" it looks to a human reviewer.
- Avoid `/*#__PURE__*/` annotations or wrapping the leak in a function that's never called — that pattern genuinely is tree-shakeable and would silently delete the bug.

**b) Surviving minification**
- Set the Vite/Terser build config to **not** use `drop_console` or `pure_funcs: ['console.log']`. Several bugs (ReDoS freeze warning, listener-leak counters, race-condition timing logs) are only observable via console output during agent testing; a default "production" minifier preset would strip them.
- Keep `build.minify` on `esbuild` (default) rather than adding an aggressive Terser pass with dead-code assumptions about side-effect-free functions.

**c) Bypassing hosting sanitization/security plugins**
- **Do not** enable Netlify's "Post Processing / Asset Optimization" (it can rewrite inline `<script>` and minify HTML in ways that interfere with the injected review payloads).
- **Do not** enable any Vercel/Cloudflare WAF, Bot Protection, or "Attack Challenge Mode" toggle — these can rate-limit or block the exact traffic patterns BugSite intentionally produces (API-spam search, ReDoS payloads).
- **Do not** add a `Content-Security-Policy` header or meta tag. A real CSP would block inline event handlers and `dangerouslySetInnerHTML`-injected `<script>` execution, which would silently neuter Bug 6 (XSS) — the single most important bug to keep alive.
- Confirm `vite-plugin-pwa` / any service worker is **not** installed. Default SW cache-cleanup strategies purge `localStorage`/cache state on new deploys, which would kill the "survives navigation" property of Bugs 15 and 19.

**d) Persistent, cross-session, cross-navigation state leaks**
- Bug 15 (Cache Pollution) and Bug 19 (Cross-Session Leak) must use `localStorage`, never `sessionStorage` — `sessionStorage` is scoped per-tab and would accidentally "fix" the leak on tab close.
- The global leak counter (`window.__leakedListenersCount`, used to safety-cap Bugs 3/13 so they don't consume unbounded CPU in a training session) persists across in-app SPA navigation but resets on hard refresh or new deploy — this matches the "must survive navigation, may reset on hard refresh" requirement exactly as specified.

---

## 2. Database Schema (MongoDB Collections)

| Collection | Key Fields | Notes / Bug Linkage |
|---|---|---|
| **Users** | `_id`, `email`, `passwordHash`, `role` (`user`\|`admin`), `balance`, `badge`, `timezonePref`, `createdAt` | `balance`/`badge` back the Cache Pollution profile widget (Bug 15) |
| **Products** | `_id`, `name`, `slug`, `category`, `price` (Number), `stock`, `specs` (object), `images[]`, `description` | Correctly typed `price` — proves Type Coercion (Bug 8) is a frontend bug, not bad data |
| **Reviews** | `_id`, `productId`, `author`, `text` (raw HTML, unsanitized), `rating`, `createdAt` | Stored/served as-is — no sanitizer anywhere; backs XSS (Bug 6) |
| **Carts** | `_id`, `userId`, `items[{productId, qty, priceAtAdd}]`, `updatedAt` | Server-side source of truth that the client is allowed to diverge from via direct array mutation (Bug 2) |
| **Orders** | `_id`, `userId`, `items[]`, `subtotal`, `discount`, `total`, `status`, `shippingAddress`, `trackingCarrier`, `createdAt` | Backs Order History / Live Tracking (Bugs 10, 11) and Admin Export (Bug 26) |
| **Coupons** | `_id`, `code`, `discountPercent`, `active` | Validated client-side against the catastrophic-backtracking regex (Bug 24) |
| **SessionEvents** | `_id`, `userId`, `event` (`login`\|`logout`\|`switch`), `timestamp`, `ip` | Backs realism for Cross-Session Leak (Bug 19) and general audit trail |

---

## 3. Core Page Structure

| Route | Page | Purpose |
|---|---|---|
| `/` | Home | Hero, featured products, category tiles |
| `/catalog` | Catalog | Browse/filter/search all products |
| `/product/:slug` | Product Details (PDP) | Full product info, reviews, related items |
| `/cart` | Shopping Cart | Line items, order summary/subtotal |
| `/wishlist` | Wishlist / Saved Items | Saved products with personal notes |
| `/checkout` | Checkout (single route, internal multi-step wizard) | Shipping → Payment → Review → Confirm |
| `/account` | Account & Settings | Profile, security panel, account security form |
| `/orders` | Order History | Past orders, live tracking widget |
| `/admin/analytics` | Admin Analytics Dashboard (role-gated) | Revenue, graphs, exports, timezone/legend widgets |
| `/deals/:partnerSlug` | Partner Deals | Outbound affiliate/partner link page |
| *(global, not a route)* | Support Chat Widget | Persistent floating widget mounted on every page |
| *(global, not a route)* | Newsletter Modal | First-visit popup |
| *(global, not a route)* | Cookie Consent Banner | Persistent footer bar until dismissed |

**Note on scope:** the reference file's "Notifications" and "Users" pages are undeveloped stubs with decorative badges (`STACKING`, `SESSION FIX`, `PERMISSION DRIFT`, `PRIORITY BUG`) and no actual wired logic — they are not among the 28 numbered bugs. BugSite builds Notification Center and Admin Role Management as real, **bug-free** functional pages rather than inventing new, unrequested vulnerabilities to fill them.

---

## 4. Vulnerability Mapping Master Matrix

| # | Bug Class | Real Feature | Page / Route | User Interaction to Trigger | Fidelity Note |
|---|---|---|---|---|---|
| 1 | Stale Closure | "Revenue by Category" widget | `/admin/analytics` | Click Electronics/Clothing/Books tab — the interval-driven revenue/order counters never actually reflect the selected category (missing `revenueTab` dependency) | Direct port |
| 2 | State Mutation | Add-to-Cart | `/cart`, quick-add from Catalog/PDP | `cart.push(product)` mutates the array directly instead of `setCart([...cart, product])`; the cart badge count in the nav desyncs from the rendered list until an unrelated re-render | Direct port |
| 3 | Memory Leak | Global Support Chat Widget | Persistent, all pages | Scroll/resize listeners attached via `window.addEventListener` on mount, never cleaned up; remounting the widget (e.g. toggling it) piles up duplicate listeners | Relocated from a standalone "Viewport Monitor" card to a persistent widget so it's exercised on every page — maximizes exposure for agent testing |
| 4 | Event Bubbling | "Recently Viewed" product grid | `/catalog` | Click the inline delete/remove icon on a card — the card's own `onClick` (navigate to PDP) still fires because `e.stopPropagation()` is missing | Direct port |
| 5 | A11y Violations | Star rating & "Like this product" | `/product/:slug` | Controls built from `<div>`/`<span>` instead of `<button>`, no `aria-label`/keyboard handling; reviewer avatar has no `alt` text | Direct port |
| 6 | XSS Vector | Product Reviews | `/product/:slug` | Submit a review containing an HTML/script payload; it's stored raw and rendered via `dangerouslySetInnerHTML` for every future visitor | Direct port; now genuinely persistent (stored XSS) since Reviews live server-side |
| 7 | Obfuscation | "Security Panel" | `/account` | Hidden `data-token` attribute holds `btoa("ADMIN_TOKEN_...")`; an invisible, off-screen "Bypass Auth" button sits in the DOM | Direct port |
| 8 | Type Coercion | Order Summary subtotal | `/cart` | Subtotal accumulator starts at `""` instead of `0`, producing string concatenation (`"100400.10.2"`) plus a `0.1 + 0.2 = 0.30000000000000004` float-precision display | Direct port |
| 9 | Layout Shift | "Shop Flash Sale" CTA | `/` (Home) | Hovering the button randomly translates it, dodging the cursor | Direct port |
| 10 | Parse Failure | "Track Package" | `/orders` | A mocked external carrier-tracking API call returns malformed JSON (trailing commas/unquoted keys); `JSON.parse` throws | Direct port |
| 11 | Unmounted setState | Live Order Tracking widget | `/orders` | Click "Track", then navigate away before the simulated 2s response resolves — a `setState` fires on an unmounted component | **Fidelity fix required:** the reference `ZombieChild` guards this with `isMountedRef.current`, so it never actually reproduces its badge. BugSite's implementation must drop that guard to make this a genuine, observable bug |
| 12 | History Desync | Checkout wizard | `/checkout` | Step through Shipping → Payment → Review; press browser Back — it exits checkout entirely instead of returning to the previous step, because the URL never changed | Direct port |
| 13 | Listener Accumulator | Global Support Chat Widget | Persistent, all pages | Every SPA navigation remounts the widget, permanently adding 2 more `keydown` listeners (capped via `window.__leakedListenersCount` for CPU safety in training sessions) | Co-located with Bug 3 on the same persistent widget |
| 14 | Query Desync | Overview/Reviews/Specs/Shipping tabs | `/product/:slug` | Switch tabs — the URL never reflects the active tab; refreshing or sharing the link always lands back on Overview | Direct port |
| 15 | Cache Pollution & Liar Label | Profile widget | `/account` | Click Logout — `localStorage['bugsite_profile_cache']` is never cleared, so balance/badge remain readable via devtools after "logout" | Direct port |
| 16 | Broken Memoization | "You Might Also Like" related products | `/product/:slug` | Any parent state change (e.g. switching tabs) re-renders every `React.memo`'d item because an inline arrow function is passed as `onDelete`/`onClick`, breaking referential equality | Direct port |
| 17 | Race Condition | "Refresh Dashboard Data" | `/admin/analytics` | Click refresh — a fast (1s) response resolves first, then a slow (3s) "legacy" response overwrites it, leaving stale data displayed as current | Direct port |
| 18 | Ghost Modal / DOM Leak | Quick View lightbox | `/catalog` | Open the image lightbox (locks `document.body.style.overflow`), then navigate away via in-app SPA link (not hard refresh) — the main page stays scroll-locked | Direct port |
| 19 | Cross-Session Leak | Account switcher | `/account` | Fast-switch the active user (e.g. shared/family account) without a hard refresh — the previous user's sensitive document name lingers in component state/UI | Direct port |
| 20 | Infinite Render Loop | "Trigger Live Refresh" | `/admin/analytics` | Click trigger — a new inline config object is created every render and passed into a `useEffect` dependency array, causing a runaway re-render loop (capped at 100 for safety) | Direct port |
| 21 | Index as Key | Saved Items list | `/wishlist` | Type a personal note into an item's text field, then delete the item **above** it — because `key={index}` is used, React remaps the DOM node and the note text appears to jump to the wrong product | Direct port |
| 22 | Open Redirect | "Visit Partner Store" | `/deals/:partnerSlug` | A raw, unvalidated URL (user- or query-controlled) is assigned directly to `window.location.href` | Direct port |
| 23 | Missing Debounce | Product search bar | `/catalog` | Every keystroke fires a simulated API call with no debounce/throttle, flooding network/console | Direct port |
| 24 | ReDoS | Promo Code / gift-note field | `/checkout` | Enter/paste a crafted alphanumeric+space string against `/^([a-zA-Z0-9]+\s?)*$/` — catastrophic backtracking freezes the tab | Direct port |
| 25 | Graph Manipulation | Revenue Graph toggle | `/admin/analytics` | Toggling "Data Source" swaps in flat, fake values while the toggle's own label logic is inverted | Direct port |
| 26 | Export Corruption | Export Orders (CSV/JSON) | `/admin/analytics` | Export orders containing long addresses/descriptions — unescaped commas/quotes break CSV structure; encoding issues surface in JSON | Direct port |
| 27 | Timezone Desync | Timezone selector | `/admin/analytics` | Change the timezone dropdown (EST/PST) — displayed order timestamps always remain UTC regardless of selection | Direct port |
| 28 | Legend Desync | Revenue vs. Cost chart | `/admin/analytics` | The chart legend lists a "Costs" series that is never actually rendered in the chart itself | Direct port |

**Bonus (unnumbered, outside the 28-count):** Client-side-only form validation bypass — the Account Security form's `maxLength`, `pattern`, and `disabled` constraints are enforced only in the DOM/React and trivially bypassed via devtools or an automation tool submitting the raw form. Folded into `/account` alongside Bug 7.

**Distribution check:** Home (1) + Catalog (3: #4, #18, #23) + PDP (4: #5, #6, #14, #16) + Cart (2: #2, #8) + Wishlist (1: #21) + Checkout (2: #12, #24) + Account (3: #7, #15, #19) + Orders (2: #10, #11) + Admin Analytics (7: #1, #17, #20, #25, #26, #27, #28) + Support Widget (2: #3, #13) + Partner Deals (1: #22) = **28/28**.

---

## 5. Phase Implementation Plan

| Phase | Scope |
|---|---|
| **0 — Foundation** | Restructure repo into `client/` + `server/`, environment config, MongoDB Atlas + Compass connection docs |
| **1 — Backend core** | Express server, Mongoose models per Section 2, seed script for Products/Users/Reviews, correct/bug-free CRUD endpoints |
| **2 — Frontend shell** | Real React Router setup, shared layout (nav/footer), Home/Catalog/PDP/Cart wired to live API — still bug-free at this stage |
| **3 — Bug Wave 1 (Core Shopping)** | #2 State Mutation, #8 Type Coercion, #4 Event Bubbling, #23 Missing Debounce, #9 Layout Shift, #21 Index as Key |
| **4 — Bug Wave 2 (Content & Trust)** | #6 XSS, #5 A11y Violations, #7 Obfuscation, #22 Open Redirect, #16 Broken Memoization, #14 Query Desync |
| **5 — Bug Wave 3 (State & Lifecycle)** | #1 Stale Closure, #3 Memory Leak, #13 Listener Accumulator, #11 Unmounted setState, #17 Race Condition, #20 Infinite Render Loop, #19 Cross-Session Leak, #15 Cache Pollution, #12 History Desync |
| **6 — Bug Wave 4 (Data & Analytics)** | #10 Parse Failure, #24 ReDoS, #25 Graph Manipulation, #26 Export Corruption, #27 Timezone Desync, #28 Legend Desync |
| **7 — Dark-pattern / meta layer** | Newsletter modal, cookie consent banner, global error boundary + recovery reset |
| **8 — Hosting hardening** | Deploy pipeline; manually verify all 28 bugs survive the production build per Section 1.4 tactics |
| **9 — Documentation** | Per-bug instructor solution guide, agent-testing scoring rubric, reset/seed endpoint for repeatable training sessions |

---

*End of architectural blueprint. No implementation code has been written as part of this document, per project directive.*

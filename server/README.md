# BugSite API (Express + Firebase)

A **minimal, read-only** backend that serves BugSite's product catalog out of
**Firestore** so you can browse/edit it in the **Firebase console**. It is
intentionally narrow: it only exposes reference product data. It does **not**
store carts, orders, accounts, or anything user-entered, and it does **not**
touch any of the 28 intentional frontend bugs — those stay exactly where they are.

```
React SPA  ──fetch(HTTP)──►  this API (:4000)  ──Admin SDK──►  Firestore
                                                                    ▲
                                                    Firebase console (just views it)
```

## 1. Prerequisites

- **Node.js 18+**
- A **Firebase project** with Firestore enabled, either:
  - the real cloud project → [console.firebase.google.com](https://console.firebase.google.com), or
  - the local **Firestore emulator** (`npm install -g firebase-tools`, then `firebase emulators:start --only firestore`) — no credentials needed.

## 2. Configure

```bash
cd server
cp .env.example .env      # then edit if your project id / emulator host differ
npm install
```

Defaults (no edits needed for local emulator use):

| Var | Default | Meaning |
|-----|---------|---------|
| `FIREBASE_PROJECT_ID` | `demo-bugsite` | Firebase project id (`demo-*` works emulator-only, no auth needed) |
| `FIRESTORE_EMULATOR_HOST` | `127.0.0.1:8080` | set → talk to the local emulator; unset → talk to the real project |
| `GOOGLE_APPLICATION_CREDENTIALS` | – | path to a service account JSON key (only needed against a real project) |
| `PORT` | `4000` | port the API listens on |

## 3. Seed the 28 products

```bash
npm run seed
```

This loads the exact same data the frontend ships with
(`bug-site/bug-site/src/data/products.js`) into the `products` collection.
Re-run any time — it wipes and reinserts, so it always matches.

## 4. Browse it in the Firebase console (or emulator UI)

- Real project: **console.firebase.google.com** → your project → **Firestore Database** → collections **`products`** / **`reviews`**.
- Emulator: the emulator suite prints a local **Emulator UI** URL (default `http://127.0.0.1:4000`) with the same view.

## 5. Run the API

```bash
npm run dev      # auto-restarts on change (node --watch)
# or: npm start
```

Then verify:

- http://localhost:4000/api/health
- http://localhost:4000/api/products
- http://localhost:4000/api/products/mechanical-keyboard-tkl
- http://localhost:4000/api/categories

## 6. Run the frontend against it

In another terminal:

```bash
cd bug-site/bug-site
npm run dev
```

Open the app and go to **Catalog**. When the API is reachable, the header shows
a green **"● Live from Firebase"** badge and the grid is served from the database.
If the API is down, the catalog silently falls back to the bundled static data
(badge reads **"○ Static data"**) — so the rest of the site, and every bug,
keeps working with or without Firebase.

To point the frontend at a non-default API URL, set `VITE_API_BASE` (e.g. in
`bug-site/bug-site/.env`):

```
VITE_API_BASE=http://localhost:4000
```

## Endpoints

| Method | Path | Returns |
|--------|------|---------|
| GET | `/api/health` | `{ ok, projectId, usingEmulator }` (no Firestore required) |
| GET | `/api/products` | array of all products |
| GET | `/api/products/:slug` | one product, or 404 |
| POST | `/api/products` | create a product |
| PATCH | `/api/products/:slug` | update fields (price, stock, …) |
| DELETE | `/api/products/:slug` | delete a product |
| GET | `/api/categories` | distinct category names |
| GET | `/api/reviews` `?slug=` | reviews (optionally filtered by product) |
| POST | `/api/reviews` | create a review (also updates product rating) |
| DELETE | `/api/reviews/:id` | delete a review |
| GET | `/api/stats` | live aggregation (totals, by-category, low stock) |

## DB-backed features in the app

These pages **require** the backend + Firestore (no static fallback — they show a
"Database connection required" message if the API is down):

- **`/reviews`** — Community Reviews: submit a review (persisted to Firestore) and browse all reviews.
- **`/admin/products`** — Product Manager: create / edit / delete products in the database.
- **`/admin/inventory`** — Store Stats: KPIs and charts computed from live Firestore data.

The **Catalog** (`/catalog`) also reads products from the API, but falls back to
bundled static data when the backend is down. All 28 intentional bugs are
unaffected by any of this.

> ⚠️ BugSite is a deliberately vulnerable training target — do not enter real
> data, and keep this backend read-only reference data only.

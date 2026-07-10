# BugSite API (Express + MongoDB)

A **minimal, read-only** backend that serves BugSite's product catalog out of
MongoDB so you can browse/edit it in **MongoDB Compass**. It is intentionally
narrow: it only exposes reference product data. It does **not** store carts,
orders, accounts, or anything user-entered, and it does **not** touch any of the
28 intentional frontend bugs — those stay exactly where they are.

```
React SPA  ──fetch(HTTP)──►  this API (:4000)  ──driver──►  MongoDB (:27017)
                                                                  ▲
                                                    MongoDB Compass (just views it)
```

## 1. Prerequisites

- **Node.js 18+**
- **MongoDB** running somewhere. Either:
  - MongoDB Community Server locally → `mongodb://127.0.0.1:27017`, or
  - a free **MongoDB Atlas** cluster → `mongodb+srv://…`

## 2. Configure

```bash
cd server
cp .env.example .env      # then edit if your Mongo URI/port differ
npm install
```

Defaults (no edits needed for a standard local install):

| Var | Default | Meaning |
|-----|---------|---------|
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | where Mongo runs (same string Compass uses) |
| `DB_NAME` | `bugsite` | database name |
| `PORT` | `4000` | port the API listens on |

## 3. Seed the 28 products

```bash
npm run seed
```

This loads the exact same data the frontend ships with
(`bug-site/bug-site/src/data/products.js`) into the `bugsite.products`
collection. Re-run any time — it wipes and reinserts, so it always matches.

## 4. Browse it in MongoDB Compass

1. Open Compass.
2. **New Connection** → paste your `MONGODB_URI` (e.g. `mongodb://127.0.0.1:27017`) → **Connect**.
3. Open database **`bugsite`** → collection **`products`**. You'll see all 28 documents and can view/edit them there.

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
a green **"● Live from MongoDB"** badge and the grid is served from the database.
If the API is down, the catalog silently falls back to the bundled static data
(badge reads **"○ Static data"**) — so the rest of the site, and every bug,
keeps working with or without MongoDB.

To point the frontend at a non-default API URL, set `VITE_API_BASE` (e.g. in
`bug-site/bug-site/.env`):

```
VITE_API_BASE=http://localhost:4000
```

## Endpoints

| Method | Path | Returns |
|--------|------|---------|
| GET | `/api/health` | `{ ok, db, uri }` (no Mongo required; password masked) |
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

These pages **require** the backend + MongoDB (no static fallback — they show a
"Database connection required" message if the API is down):

- **`/reviews`** — Community Reviews: submit a review (persisted to Mongo) and browse all reviews.
- **`/admin/products`** — Product Manager: create / edit / delete products in the database.
- **`/admin/inventory`** — Store Stats: KPIs and charts from a live MongoDB aggregation pipeline.

The **Catalog** (`/catalog`) also reads products from the API, but falls back to
bundled static data when the backend is down. All 28 intentional bugs are
unaffected by any of this.

> ⚠️ BugSite is a deliberately vulnerable training target — do not enter real
> data, and keep this backend read-only reference data only.

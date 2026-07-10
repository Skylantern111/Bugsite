# Database Configuration & Run Guide

How to configure the MongoDB backend for BugSite and exactly what to run, in
order. This backend serves the product catalog and powers the DB-only pages
(**Reviews**, **Product Manager**, **Store Stats**). It never stores shopper PII,
and it does **not** touch any of the 28 intentional frontend bugs.

```
React SPA ──fetch(HTTP)──► Express API (:4000) ──driver──► MongoDB ──► Compass (views it)
```

---

## 1. Prerequisites

- **Node.js 18+** (developed on v24).
- A MongoDB you can reach, one of:
  - **MongoDB Atlas** (cloud) → connection string looks like
    `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net`
  - **MongoDB Community Server** (local) → `mongodb://127.0.0.1:27017`
- **MongoDB Compass** (optional GUI) to browse the data.

---

## 2. Configuration (`server/.env`)

All config lives in `server/.env`. Copy the template, then edit:

```bash
cd server
cp .env.example .env
```

| Variable      | Required | Default                        | What it does                                                                 |
|---------------|----------|--------------------------------|------------------------------------------------------------------------------|
| `MONGODB_URI` | ✅       | `mongodb://127.0.0.1:27017`    | Where Mongo runs. **The same string you paste into Compass.**                |
| `DB_NAME`     | –        | `bugsite`                      | Database the collections live in.                                            |
| `PORT`        | –        | `4000`                         | Port the API listens on (the React app calls this).                          |
| `DNS_SERVER`  | –        | *(unset)*                      | Only for Atlas: fixes `querySrv ECONNREFUSED`. Set to `8.8.8.8`. See §6.     |

**Example — local MongoDB:**

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=bugsite
PORT=4000
```

**Example — MongoDB Atlas:**

```dotenv
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net
DB_NAME=bugsite
PORT=4000
DNS_SERVER=8.8.8.8
```

> 🔒 **`.env` is git-ignored** — never commit it, and never paste your real
> connection string (with password) into chat, tickets, or screenshots. Logs and
> the `/api/health` endpoint mask the password as `****`.

---

## 3. What to run — step by step

From the `server/` directory:

```bash
# 1. Install backend dependencies (first time only)
npm install

# 2. Load the 28 products + starter reviews into MongoDB
npm run seed

# 3. Start the API (auto-restarts on file change)
npm run dev
#    or, without watch:  npm start
```

`npm run seed` is **idempotent** — it wipes and reinserts, so re-run it any time
to reset the database to a clean state (28 products, 16 reviews). It reads the
exact data the frontend ships with (`bug-site/bug-site/src/data/products.js` and
`.../data/reviews.js`), so the DB always matches the app.

### npm scripts (`server/package.json`)

| Command         | What it runs        | Use it to…                                    |
|-----------------|---------------------|-----------------------------------------------|
| `npm install`   | install deps        | set up the backend the first time             |
| `npm run seed`  | `node seed.js`      | load / reset products + reviews in Mongo       |
| `npm run dev`   | `node --watch index.js` | run the API during development (auto-reload) |
| `npm start`     | `node index.js`     | run the API once (no watch)                    |

---

## 4. Run the frontend against it

In a **second terminal**:

```bash
cd bug-site/bug-site
npm install      # first time only
npm run dev
```

The app defaults to `http://localhost:4000`. To point at a different API URL,
set `VITE_API_BASE` in `bug-site/bug-site/.env`:

```dotenv
VITE_API_BASE=http://localhost:4000
```

- **Catalog** shows a green **"● Live from MongoDB"** badge when the API is up,
  and silently falls back to bundled static data when it is down.
- **Reviews**, **Product Manager**, and **Store Stats** have **no fallback** —
  they show a "Database connection required" screen unless the API + DB are up.

---

## 5. Verify it works

With the API running:

- <http://localhost:4000/api/health> → `{ ok, db, uri }` (password masked)
- <http://localhost:4000/api/products> → all 28 products
- <http://localhost:4000/api/stats> → live aggregation

In **Compass**: New Connection → paste `MONGODB_URI` → **Connect** → open the
`bugsite` database → collections **`products`** (28) and **`reviews`** (16).

### Collections & shape

**`products`** (indexes: `slug` unique, `category`)

```json
{ "id": "p1", "slug": "mechanical-keyboard-tkl", "name": "...", "category": "...",
  "brand": "...", "price": 129.99, "stock": 42, "emoji": "⌨️",
  "rating": 4.6, "reviewCount": 3, "description": "...", "specs": {}, "tags": [] }
```

**`reviews`** (indexes: `productSlug`, `id` unique)

```json
{ "id": "<uuid>", "productSlug": "mechanical-keyboard-tkl", "productName": "...",
  "author": "...", "title": "", "text": "...", "rating": 5,
  "createdAt": "2026-07-10T12:00:00.000Z" }
```

`price`, `stock`, and `rating` are stored as real **Numbers** on purpose (this
matches the frontend's Bug 8 type-coercion model — do not "fix" it to strings).

---

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `querySrv ECONNREFUSED _mongodb._tcp.<cluster>` | Node's DNS resolver won't resolve the Atlas SRV record (even when the OS can). | Add `DNS_SERVER=8.8.8.8` to `.env`. `db.js` calls `dns.setServers()` with it. |
| `EADDRINUSE: address already in use :::4000` | An old API is still holding port 4000. | Kill it: `Get-NetTCPConnection -LocalPort 4000 \| Select -Expand OwningProcess \| ForEach { Stop-Process -Id $_ -Force }` (PowerShell). |
| `MongoServerError: bad auth` | Wrong user/password in `MONGODB_URI`. | Re-check the Atlas DB user credentials; URL-encode special characters in the password. |
| Reviews / Product Manager / Store Stats show "Database connection required" | API or Mongo is down. | Start the API (`npm run dev`) and confirm `/api/health` responds. |
| Catalog badge stuck on "○ Static data" | API unreachable. | Same as above — the catalog falls back to static data by design. |

---

> ⚠️ BugSite is a deliberately vulnerable **training target**. Do not enter real
> data anywhere in the app, and keep this backend to reference/store-management
> data only. See [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the whole-system design.

# Database Configuration & Run Guide

How to configure the Firebase (Firestore) backend for BugSite and exactly what
to run, in order. This backend serves the product catalog and powers the
DB-only pages (**Reviews**, **Product Manager**, **Store Stats**). It never
stores shopper PII, and it does **not** touch any of the 28 intentional
frontend bugs.

```
React SPA ──fetch(HTTP)──► Express API (:4000) ──Admin SDK──► Firestore ──► Firebase console (views it)
```

---

## 1. Prerequisites

- **Node.js 18+** (developed on v24).
- A Firestore you can reach, one of:
  - **A real Firebase project** (cloud) — create one free at
    [console.firebase.google.com](https://console.firebase.google.com), enable
    **Firestore Database**, then generate a service account key under
    **Project settings → Service accounts → Generate new private key**. See
    [`FIREBASE_CONSOLE_SETUP.md`](./FIREBASE_CONSOLE_SETUP.md) for a full
    click-by-click guide.
  - **The Firestore emulator** (local, no account needed) —
    `npm install -g firebase-tools`, then `firebase emulators:start --only firestore`.
- **Firebase console** (or the emulator's local Emulator UI) to browse the data.

---

## 2. Configuration (`server/.env`)

All config lives in `server/.env`. Copy the template, then edit:

```bash
cd server
cp .env.example .env
```

| Variable | Required | Default | What it does |
|----------|----------|---------|---------------|
| `FIREBASE_PROJECT_ID` | ✅ | `demo-bugsite` | Your Firebase project id. `demo-*` ids work against the emulator with no credentials. |
| `FIRESTORE_EMULATOR_HOST` | – | *(unset)* | Set to `127.0.0.1:8080` to talk to the local emulator instead of the real project. |
| `GOOGLE_APPLICATION_CREDENTIALS` | – | *(unset)* | Path to a service account JSON key file. Only needed against a real project (ignored when the emulator host is set). |
| `FIREBASE_SERVICE_ACCOUNT` | – | *(unset)* | The service account JSON *contents* as one env var, for hosts with no file to point at (e.g. Railway). Takes priority over the path above. |
| `PORT` | – | `4000` | Port the API listens on (the React app calls this). |

**Example — local emulator (no account, no key file):**

```dotenv
FIREBASE_PROJECT_ID=demo-bugsite
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
PORT=4000
```

**Example — real Firebase project:**

```dotenv
FIREBASE_PROJECT_ID=my-real-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
PORT=4000
```

> 🔒 **`.env` and `service-account*.json` are git-ignored** — never commit
> them, and never paste a real service account key into chat, tickets, or
> screenshots.

---

## 3. What to run — step by step

From the `server/` directory:

```bash
# 1. Install backend dependencies (first time only)
npm install

# 2. (local dev only) start the Firestore emulator in its own terminal
firebase emulators:start --only firestore

# 3. Load the 28 products + starter reviews into Firestore
npm run seed

# 4. Start the API (auto-restarts on file change)
npm run dev
#    or, without watch:  npm start
```

`npm run seed` is **idempotent** — it wipes and reinserts, so re-run it any time
to reset the database to a clean state (28 products, 16 reviews). It reads the
exact data the frontend ships with (`bug-site/bug-site/src/data/products.js` and
`.../data/reviews.js`), so the DB always matches the app.

### npm scripts (`server/package.json`)

| Command | What it runs | Use it to… |
|---------|---------------|------------|
| `npm install` | install deps | set up the backend the first time |
| `npm run seed` | `node seed.js` | load / reset products + reviews in Firestore |
| `npm run dev` | `node --watch index.js` | run the API during development (auto-reload) |
| `npm start` | `node index.js` | run the API once (no watch) |

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

- **Catalog** shows a green **"● Live from Firebase"** badge when the API is up,
  and silently falls back to bundled static data when it is down.
- **Reviews**, **Product Manager**, and **Store Stats** have **no fallback** —
  they show a "Database connection required" screen unless the API + DB are up.

---

## 5. Verify it works

With the API running:

- <http://localhost:4000/api/health> → `{ ok, projectId, usingEmulator }`
- <http://localhost:4000/api/products> → all 28 products
- <http://localhost:4000/api/stats> → live aggregation

In the **Firebase console** (or emulator UI): open the **Firestore Database**
section → collections **`products`** (28) and **`reviews`** (16).

### Collections & shape

**`products`** (document id = `slug`)

```json
{ "id": "p1", "slug": "mechanical-keyboard-tkl", "name": "...", "category": "...",
  "brand": "...", "price": 129.99, "stock": 42, "emoji": "⌨️",
  "rating": 4.6, "reviewCount": 3, "description": "...", "specs": {}, "tags": [] }
```

**`reviews`** (document id = `id`, a uuid)

```json
{ "id": "<uuid>", "productSlug": "mechanical-keyboard-tkl", "productName": "...",
  "author": "...", "title": "", "text": "...", "rating": 5,
  "createdAt": "2026-07-10T12:00:00.000Z" }
```

`price`, `stock`, and `rating` are stored as real **Numbers** on purpose (this
matches the frontend's Bug 8 type-coercion model — do not "fix" it to strings).

Reviews are filtered/sorted in application code rather than a Firestore
`where()` + `orderBy()` query, since at this data volume (a few dozen docs)
that's simpler than requiring a composite index.

---

## 6. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Could not load the default credentials` | Talking to a real project without `GOOGLE_APPLICATION_CREDENTIALS` set (and no emulator host). | Point `GOOGLE_APPLICATION_CREDENTIALS` at a service account key, or set `FIRESTORE_EMULATOR_HOST` for local dev. |
| `ECONNREFUSED 127.0.0.1:8080` | `FIRESTORE_EMULATOR_HOST` is set but the emulator isn't running. | Run `firebase emulators:start --only firestore` in another terminal. |
| `EADDRINUSE: address already in use :::4000` | An old API is still holding port 4000. | Kill it: `Get-NetTCPConnection -LocalPort 4000 \| Select -Expand OwningProcess \| ForEach { Stop-Process -Id $_ -Force }` (PowerShell). |
| `PERMISSION_DENIED` from Firestore | Security rules reject the service account, or wrong project id. | Double-check `FIREBASE_PROJECT_ID`, and that Firestore is in **Native mode** with rules that allow the Admin SDK (server-side Admin SDK bypasses rules by default — this usually means the wrong project/key). |
| Reviews / Product Manager / Store Stats show "Database connection required" | API or Firestore is down/unreachable. | Start the API (`npm run dev`) and confirm `/api/health` responds. |
| Catalog badge stuck on "○ Static data" | API unreachable. | Same as above — the catalog falls back to static data by design. |

---

> ⚠️ BugSite is a deliberately vulnerable **training target**. Do not enter real
> data anywhere in the app, and keep this backend to reference/store-management
> data only. See [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the whole-system design.

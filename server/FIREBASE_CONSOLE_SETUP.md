# Firebase Console Setup Guide

Step-by-step instructions for creating the Firestore database **in the
Firebase console** for BugSite's backend. This is the piece that happens
*before* [`DATABASE.md`](./DATABASE.md) — once you've done the steps here,
you'll have a project id and (optionally) a service account key to drop into
`server/.env` as described there.

> Using the local Firestore **emulator** instead of a real project? You can
> skip this whole guide — no Firebase console account is needed. See
> [`DATABASE.md` § 1. Prerequisites](./DATABASE.md#1-prerequisites).

---

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
   and sign in with a Google account.
2. Click **Add project**.
3. Enter a project name (e.g. `bugsite-dev`) → **Continue**.
4. Google Analytics is not used by this backend — you can toggle it off →
   **Create project**.
5. Wait for provisioning, then **Continue** into the project console.

---

## 2. Create the Firestore database 

1. In the left sidebar, under **Build**, click **Firestore Database**.
2. Click **Create database**.
3. Choose **Native mode**. ⚠️ Do **not** pick "Datastore mode" — the
   `firebase-admin` SDK this backend uses requires Native mode.
4. Choose a **location** for your data (e.g. `nam5 (us-central)`). This
   cannot be changed later without recreating the database.
5. Choose a starting rules mode:
   - **Production mode** (recommended) — locks the database down by default.
     This is fine even though the mobile/web security rules are locked down,
     because the server talks to Firestore through the **Admin SDK**, which
     bypasses security rules entirely.
   - **Test mode** — open read/write for 30 days. Only use this if you also
     plan to hit Firestore from client-side code (BugSite's frontend does
     not — it goes through the Express API).
6. Click **Create**/**Enable**.

---

## 3. Get the Project ID

1. Click the **gear icon** next to "Project Overview" → **Project settings**.
2. On the **General** tab, copy the **Project ID** (not the "Project name" —
   they can differ).
3. This value is `FIREBASE_PROJECT_ID` in `server/.env`.

---

## 4. Generate a service account key

Only needed if you're connecting to this real project (skip if using the
emulator).

1. Still in **Project settings**, open the **Service accounts** tab.
2. Click **Generate new private key** → confirm **Generate key**.
3. A JSON file downloads — save it somewhere inside `server/` that's
   git-ignored, e.g. `server/service-account.json`.

> 🔒 **Never commit this file, paste its contents into chat/tickets, or share
> it.** It grants full admin access to your Firestore data. `.env` and
> `service-account*.json` are already git-ignored in this repo.

---

## 5. Wire it into the app

Back in your terminal, point the backend at what you just created — see
[`DATABASE.md` § 2. Configuration (`server/.env`)](./DATABASE.md#2-configuration-serverenv)
for the full variable reference and examples. In short:

```dotenv
FIREBASE_PROJECT_ID=<the project id from step 3>
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
PORT=4000
```

Then follow [`DATABASE.md` § 3. What to run — step by step](./DATABASE.md#3-what-to-run--step-by-step)
to `npm install` and `npm run seed`, which populates the database with
BugSite's 28 products and 16 reviews.

---

## 6. Verify in the console

After running `npm run seed`:

1. Back in the Firebase console, open **Build → Firestore Database → Data**.
2. Confirm two collections exist:
   - **`products`** — 28 documents
   - **`reviews`** — 16 documents
3. Click into a document to confirm fields look right (e.g. `price`, `stock`,
   and `rating` should show as **Number**, not String).

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Datastore mode" was selected by mistake | Firestore was created in the wrong mode. | Firestore mode can't be changed after creation — delete the database (Project settings → General → scroll to bottom) and recreate it in **Native mode**. |
| Can't find "Firestore Database" in the sidebar | Looking under the wrong section. | It's under **Build**, not "Develop" or "Release & Monitor" — sidebar labels vary slightly by console version. |
| Downloaded key works locally but backend still can't auth | Key belongs to a different Firebase project than `FIREBASE_PROJECT_ID`. | Re-check the Project ID from step 3 matches the project you generated the key in. |
| `PERMISSION_DENIED` even with a service account key | Firestore not yet created (step 2 skipped) or project id typo. | Confirm the Firestore Database page shows an active database, and double check `FIREBASE_PROJECT_ID` for typos. |

For backend-side errors and env-var troubleshooting once things are wired
up, see [`DATABASE.md` § 6. Troubleshooting](./DATABASE.md#6-troubleshooting).

---

See also: [`DATABASE.md`](./DATABASE.md) for local configuration and running
the backend, and [`../ARCHITECTURE.md`](../ARCHITECTURE.md) for the whole
BugSite system design.

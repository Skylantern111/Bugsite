# BugSite Deployment Guide

Deploy BugSite publicly using **Vercel** (frontend) + **Railway** (backend) + **Firebase Firestore** (database) + custom domain.

---

## 1. Pre-deployment checklist

Before starting, ensure you have:

- [ ] **GitHub account** — your repo must be pushed to GitHub (public or private)
- [ ] **Vercel account** — sign up at [vercel.com](https://vercel.com) (free tier sufficient)
- [ ] **Railway account** — sign up at [railway.app](https://railway.app) (free tier sufficient)
- [ ] **Firebase project** — already set up with Firestore enabled (verify at [console.firebase.google.com](https://console.firebase.google.com))
- [ ] **Domain name** — owned or registered (can use Vercel, Namecheap, GoDaddy, etc.)
- [ ] **Firebase service account key** — generated from **Project settings → Service accounts** (needed by Railway, since it isn't a Google Cloud host)

### Git: push to GitHub

If not already on GitHub, push the repo:

```bash
git remote add origin https://github.com/<your-username>/bugsite.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy frontend to Vercel

### Step 1: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New…"** → **Project**
3. Select **Import Git Repository**
4. Authorize Vercel with GitHub
5. Search for and select your `bugsite` repo

### Step 2: Configure build settings

Vercel auto-detects it's a Vite project. Confirm settings:

| Field                | Value                          |
|----------------------|--------------------------------|
| Framework            | Vite                           |
| Root Directory       | `bug-site/bug-site`            |
| Build Command        | `npm run build`                |
| Output Directory     | `dist`                         |
| Install Command      | `npm install`                  |

### Step 3: Set environment variable

Before deploying, add the Railway backend URL:

1. In Vercel, go to **Settings** → **Environment Variables**
2. Add:

| Key                | Value                                                   | Environment |
|--------------------|--------------------------------------------------------|------------|
| `VITE_API_BASE`    | `https://bugsite-api.railway.app` (placeholder; update after Railway deploy) | Production |

> Replace `bugsite-api.railway.app` with your actual Railway domain once it's deployed.

### Step 4: Deploy

Click **Deploy**. Vercel builds and deploys automatically. Once complete, you'll get a URL like:

```
https://bugsite.vercel.app
```

> Save this URL — you'll use it for testing.

---

## 3. Deploy backend to Railway

### Step 1: Connect Railway to GitHub

1. Go to [railway.app](https://railway.app)
2. Sign in and go to **Dashboard**
3. Click **"Create"** → **Deploy from GitHub repo**
4. Authorize Railway with GitHub
5. Select your `bugsite` repo

### Step 2: Get a Firebase service account key

Railway isn't a Google Cloud host, so it can't use Application Default
Credentials — give it an explicit service account key instead:

1. In the [Firebase console](https://console.firebase.google.com) → your project → **Project settings** → **Service accounts**
2. Click **Generate new private key** → downloads a `.json` file
3. Open the file and copy its **entire contents** (you'll paste it as one env var below)

### Step 3: Configure environment variables

In Railway, go to **Settings** → **Variables** and add:

| Key                        | Value                                              |
|----------------------------|-----------------------------------------------------|
| `FIREBASE_PROJECT_ID`      | your Firebase project id                            |
| `FIREBASE_SERVICE_ACCOUNT` | paste the full JSON key file contents as one value  |
| `PORT`                     | `4000`                                              |
| `NODE_ENV`                 | `production`                                        |

> Do **not** set `FIRESTORE_EMULATOR_HOST` in production — that's local-dev only.

### Step 4: Set the start command

Railway auto-detects `npm start` from `package.json`. Verify in **Settings** → **Build**:

| Field           | Value         |
|-----------------|---------------|
| Start Command   | `npm start`   |
| Build Command   | (leave empty) |

### Step 5: Deploy

Railway auto-deploys. Once the build succeeds, you'll see a **public URL** in the Railway dashboard (e.g., `https://bugsite-api.railway.app`).

> Save this URL.

---

## 4. Wire frontend to backend

Now update Vercel's environment variable with the real Railway URL:

1. Go to **Vercel Dashboard** → your project → **Settings** → **Environment Variables**
2. Update `VITE_API_BASE`:

```
https://bugsite-api.railway.app
```

(Replace `bugsite-api` with your actual Railway service name.)

3. Click **Save**
4. Vercel **auto-redeploys** with the new env var

Test the connection:

- Open your Vercel URL: `https://bugsite.vercel.app/catalog`
- You should see a **green "● Live from Firebase"** badge (not "○ Static data")
- Click a product and check if reviews load

---

## 5. Set up custom domain

### Option A: Use Vercel's domain service (easiest)

1. In Vercel, go to your project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain (e.g., `bugsite.com`)
4. Select **"Buy" or "Connect existing"**
5. Follow the prompts

Vercel handles DNS automatically. Done.

### Option B: Use an external registrar (Namecheap, GoDaddy, etc.)

1. In Vercel, go to **Settings** → **Domains** → click **"Add"**
2. Enter your domain name
3. Vercel shows you the **NS (nameserver) records** to add

In your registrar's dashboard:

1. Find **Nameservers** or **DNS**
2. Update to Vercel's nameservers (Vercel will show them)
3. Wait ~24 hours for DNS to propagate

Once your domain is live, you'll have:

- **Frontend:** `https://bugsite.com` (or your domain)
- **Backend:** `https://api.bugsite.com` (or configure on Railway dashboard)

For the backend API domain:

1. In Railway, go to **Settings** → **Domains** → **Add**
2. Vercel controls your root domain; for a subdomain like `api.bugsite.com`:
   - In your registrar, add a **CNAME record**:
     ```
     Name: api
     Type: CNAME
     Value: <railway-domain>
     ```
   - Or use Railway's built-in domain support (if available)

---

## 6. Seed the database

Before your live site can show data, the database needs products and reviews:

### Option A: Use Railway's CLI

```bash
cd server
npm install
npm run seed
# This wipes and reloads the database from seed.js
```

Run this **once** to populate Firestore with 28 products and 16 reviews.

### Option B: Use Railway's dashboard console

1. In Railway, click **"Plugin"** / **Terminal**
2. Run:
   ```bash
   npm run seed
   ```

After seeding, refresh your frontend — the catalog and reviews should load from the live database.

---

## 7. Verify everything works

### Frontend checklist

| Page                | What to check                                      | Expected |
|---------------------|----------------------------------------------------|----------|
| `/`                 | Layout loads, flash-sale CTA visible              | ✅ works |
| `/catalog`          | Badge shows **"● Live from Firebase"**; 28 products | ✅ works |
| `/product/:slug`    | Product details, reviews load                      | ✅ works |
| `/reviews`          | Reviews feed populated                             | ✅ works |
| `/admin/products`   | Create/edit/delete products                        | ✅ works |
| `/admin/inventory`  | Store stats + charts render                        | ✅ works |
| `/bugs`             | Bug Index loads all 28                             | ✅ works |

### Backend checklist

Test these API endpoints (replace domain with yours):

```bash
# Health check
curl https://api.bugsite.com/api/health
# Response: { "ok": true, "projectId": "your-project-id", "usingEmulator": false }

# All products
curl https://api.bugsite.com/api/products
# Response: array of 28 products

# One product
curl https://api.bugsite.com/api/products/mechanical-keyboard-tkl
# Response: single product object

# Reviews for a product
curl "https://api.bugsite.com/api/reviews?slug=mechanical-keyboard-tkl"
# Response: array of reviews

# Stats
curl https://api.bugsite.com/api/stats
# Response: aggregation with totals, by-category, low-stock
```

All should return `2xx` status and valid JSON.

---

## 8. Monitoring & troubleshooting

### Vercel logs

In Vercel dashboard → **Deployments** → click a build:

- **Build logs** — shows `npm run build` output
- **Runtime logs** — shows browser errors (if any)

### Railway logs

In Railway dashboard → select your service → **Logs**:

- Shows Express server startup messages
- API request logs
- Firestore connection/auth errors

### Common issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Frontend shows "○ Static data" | Backend unreachable | Check `VITE_API_BASE` in Vercel; verify Railway is running |
| "Database connection required" on `/reviews` | Firestore not seeded | Run `npm run seed` in Railway terminal |
| CORS errors in browser console | Frontend/backend domains not matched | Verify `CORS` is configured in `server/index.js` |
| Catalog shows `500` errors | Seeds failed or data missing | Check Railway logs for Firestore auth/connection errors |
| `Could not load the default credentials` in Railway logs | `FIREBASE_SERVICE_ACCOUNT` missing or malformed | Re-paste the full service-account JSON as one line into the Railway variable |
| Custom domain shows Vercel's default page | DNS not propagated | Wait 24 hrs; check nameserver records |

### Enable production logging

To see detailed logs in production:

1. In Railway, set `DEBUG=*` environment variable (or `DEBUG=express`)
2. Redeploy
3. Check logs for troubleshooting

---

## 9. Post-launch

### Share your live site

Your public BugSite is now live at:

```
https://bugsite.com
```

### Database backups

Firestore supports scheduled backups via **Cloud console → Firestore → Backups**
(or `gcloud firestore backups schedules create`) if you want point-in-time recovery.

### Monitoring uptime

- **Vercel** — includes uptime monitoring (Settings → **Monitoring**)
- **Railway** — includes basic monitoring (Dashboard → **Monitoring**)
- **Third-party** — use Uptime Robot, Ping, or similar to monitor `https://bugsite.com/api/health`

### Security notes

- ⚠️ **This is a deliberately vulnerable training site** — never enter real data
- Keep your Firebase service account key out of git (`.env` and `service-account*.json` are git-ignored)
- The backend intentionally stores no PII, so it's safe to run with demo data
- Review the **8. Security posture** section in [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## 10. Next steps

- Add a status page (optional): [betterstack.com](https://betterstack.com) or [statuspage.io](https://statuspage.io)
- Set up CI/CD (automatic deploys on git push) — both Vercel and Railway support this by default
- Share the live URL and invite testers
- Track issues & improvements in a GitHub project or Linear board

**Questions?** Check the logs in Vercel and Railway dashboards. Both provide real-time debugging info.

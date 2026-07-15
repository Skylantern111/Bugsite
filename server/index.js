import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { getDb, config } from './db.js';

const app = express();
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:4000',
  'https://bugsite-one.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Small async wrapper so every route gets consistent 500 handling.
const route = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error(`${req.method} ${req.path} failed:`, err.message);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ ok: true, projectId: config.projectId, usingEmulator: config.usingEmulator });
});

// ---------------------------------------------------------------------------
// Products (read)
// ---------------------------------------------------------------------------
app.get('/api/products', route(async (req, res) => {
  const db = await getDb();
  const snap = await db.collection('products').get();
  res.json(snap.docs.map((d) => d.data()));
}));

app.get('/api/products/:slug', route(async (req, res) => {
  const db = await getDb();
  const doc = await db.collection('products').doc(req.params.slug).get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  res.json(doc.data());
}));

app.get('/api/categories', route(async (req, res) => {
  const db = await getDb();
  const snap = await db.collection('products').get();
  const categories = new Set(snap.docs.map((d) => d.data().category));
  res.json([...categories].sort());
}));

// ---------------------------------------------------------------------------
// Products (write) — powers the Admin Product Manager. DB-backed CRUD.
// This is store-management data, not shopper PII — safe for a training target.
// Products are keyed by `slug`, which doubles as the Firestore document id.
// ---------------------------------------------------------------------------
function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

app.post('/api/products', route(async (req, res) => {
  const b = req.body || {};
  if (!b.name || b.price == null) {
    return res.status(400).json({ error: 'name and price are required' });
  }
  const db = await getDb();
  const slug = b.slug ? slugify(b.slug) : slugify(b.name);
  const ref = db.collection('products').doc(slug);
  if ((await ref.get()).exists) {
    return res.status(409).json({ error: `A product with slug "${slug}" already exists` });
  }
  const doc = {
    id: b.id || `p${Date.now()}`,
    slug,
    name: String(b.name),
    category: b.category || 'Components',
    brand: b.brand || 'BugSite',
    price: Number(b.price),
    stock: Number(b.stock ?? 0),
    emoji: b.emoji || '📦',
    reviewCount: b.reviewCount != null ? Number(b.reviewCount) : 0,
    description: b.description || '',
    specs: b.specs || {},
    tags: Array.isArray(b.tags) ? b.tags : [],
  };
  // Firestore rejects `undefined` field values (unlike Mongo, which silently
  // drops them), so an absent rating is an omitted key, not an undefined one.
  if (b.rating != null) doc.rating = Number(b.rating);
  await ref.set(doc);
  res.status(201).json(doc);
}));

app.patch('/api/products/:slug', route(async (req, res) => {
  const b = req.body || {};
  const update = {};
  // Whitelist + coerce so the numeric fields stay real Numbers (matches Bug 8 model).
  if (b.name != null) update.name = String(b.name);
  if (b.category != null) update.category = String(b.category);
  if (b.brand != null) update.brand = String(b.brand);
  if (b.emoji != null) update.emoji = String(b.emoji);
  if (b.description != null) update.description = String(b.description);
  if (b.price != null) update.price = Number(b.price);
  if (b.stock != null) update.stock = Number(b.stock);
  if (b.oldPrice != null) update.oldPrice = Number(b.oldPrice);
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'No updatable fields provided' });
  }
  const db = await getDb();
  const ref = db.collection('products').doc(req.params.slug);
  const existing = await ref.get();
  if (!existing.exists) return res.status(404).json({ error: 'Not found' });
  await ref.update(update);
  res.json({ ...existing.data(), ...update });
}));

app.delete('/api/products/:slug', route(async (req, res) => {
  const db = await getDb();
  const ref = db.collection('products').doc(req.params.slug);
  if (!(await ref.get()).exists) return res.status(404).json({ error: 'Not found' });
  await ref.delete();
  res.json({ ok: true, slug: req.params.slug });
}));

// ---------------------------------------------------------------------------
// Reviews — persisted community reviews. GET/POST/DELETE against Firestore.
// Reviews are keyed by `id` (a uuid), which doubles as the document id.
// ---------------------------------------------------------------------------
app.get('/api/reviews', route(async (req, res) => {
  const db = await getDb();
  const col = db.collection('reviews');
  const snap = req.query.slug
    ? await col.where('productSlug', '==', req.query.slug).get()
    : await col.get();
  // Sorted in JS rather than an orderBy() query: with only a couple dozen
  // reviews, this avoids requiring a Firestore composite index for the
  // (productSlug ==, createdAt desc) combination.
  const reviews = snap.docs.map((d) => d.data()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  res.json(reviews);
}));

app.post('/api/reviews', route(async (req, res) => {
  const b = req.body || {};
  if (!b.productSlug || !b.author || !b.text) {
    return res.status(400).json({ error: 'productSlug, author and text are required' });
  }
  const db = await getDb();
  // Confirm the product exists so reviews always attach to a real slug.
  const productDoc = await db.collection('products').doc(b.productSlug).get();
  if (!productDoc.exists) return res.status(404).json({ error: `Unknown product "${b.productSlug}"` });
  const product = productDoc.data();

  const rating = Math.max(1, Math.min(5, Number(b.rating) || 5));
  const doc = {
    id: randomUUID(),
    productSlug: b.productSlug,
    productName: product.name,
    author: String(b.author).slice(0, 60),
    title: b.title ? String(b.title).slice(0, 120) : '',
    text: String(b.text).slice(0, 1000),
    rating,
    createdAt: new Date().toISOString(),
  };
  await db.collection('reviews').doc(doc.id).set(doc);

  // Keep the product's aggregate rating/count in sync from real DB data.
  const forProduct = await db.collection('reviews').where('productSlug', '==', b.productSlug).get();
  const ratings = forProduct.docs.map((d) => d.data().rating);
  const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  await db.collection('products').doc(b.productSlug).update({
    rating: Math.round(avg * 10) / 10,
    reviewCount: ratings.length,
  });
  res.status(201).json(doc);
}));

app.delete('/api/reviews/:id', route(async (req, res) => {
  const db = await getDb();
  const ref = db.collection('reviews').doc(req.params.id);
  if (!(await ref.get()).exists) return res.status(404).json({ error: 'Not found' });
  await ref.delete();
  res.json({ ok: true, id: req.params.id });
}));

// ---------------------------------------------------------------------------
// Stats — aggregation over the products collection. Powers the Store Stats
// dashboard, which cannot render without a database. Firestore has no
// server-side group-by, so with only ~28 products this aggregates in JS
// instead of running a pipeline — plenty fast at this scale.
// ---------------------------------------------------------------------------
app.get('/api/stats', route(async (req, res) => {
  const db = await getDb();
  const [productsSnap, reviewsSnap] = await Promise.all([
    db.collection('products').get(),
    db.collection('reviews').get(),
  ]);
  const products = productsSnap.docs.map((d) => d.data());

  const totals = products.reduce(
    (acc, p) => {
      acc.totalProducts += 1;
      acc.totalStock += p.stock;
      acc.inventoryValue += p.price * p.stock;
      acc.priceSum += p.price;
      if (p.rating != null) {
        acc.ratingSum += p.rating;
        acc.ratingCount += 1;
      }
      return acc;
    },
    { totalProducts: 0, totalStock: 0, inventoryValue: 0, priceSum: 0, ratingSum: 0, ratingCount: 0 },
  );

  const byCategoryMap = new Map();
  for (const p of products) {
    const entry = byCategoryMap.get(p.category) || { category: p.category, count: 0, stock: 0, value: 0 };
    entry.count += 1;
    entry.stock += p.stock;
    entry.value += p.price * p.stock;
    byCategoryMap.set(p.category, entry);
  }
  const byCategory = [...byCategoryMap.values()].sort((a, b) => b.value - a.value);

  const lowStock = products
    .filter((p) => p.stock < 20)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8)
    .map((p) => ({ name: p.name, slug: p.slug, stock: p.stock, emoji: p.emoji, category: p.category }));

  res.json({
    totals: {
      totalProducts: totals.totalProducts,
      totalStock: totals.totalStock,
      inventoryValue: totals.inventoryValue,
      avgPrice: totals.totalProducts ? totals.priceSum / totals.totalProducts : 0,
      avgRating: totals.ratingCount ? totals.ratingSum / totals.ratingCount : 0,
    },
    byCategory,
    lowStock,
    reviewCount: reviewsSnap.size,
  });
}));

const port = Number(process.env.PORT) || 4000;
app.listen(port, '0.0.0.0', () => {
  console.log(`🐛 BugSite API listening on http://0.0.0.0:${port}`);
  console.log(`   Firestore: project "${config.projectId}"${config.usingEmulator ? ` (emulator @ ${config.emulatorHost})` : ''}`);
  console.log('   Try: http://localhost:' + port + '/api/products');
});

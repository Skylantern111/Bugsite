import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { getDb, config } from './db.js';

const app = express();
app.use(cors()); // allow the Vite dev server (different origin) to call us
app.use(express.json());

// Never leak Mongo's internal _id to the frontend — the app keys off `id` ("p1").
const NO_ID = { projection: { _id: 0 } };

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
  res.json({ ok: true, db: config.dbName, uri: config.safeUri });
});

// ---------------------------------------------------------------------------
// Products (read)
// ---------------------------------------------------------------------------
app.get('/api/products', route(async (req, res) => {
  const db = await getDb();
  const products = await db.collection('products').find({}, NO_ID).toArray();
  res.json(products);
}));

app.get('/api/products/:slug', route(async (req, res) => {
  const db = await getDb();
  const product = await db.collection('products').findOne({ slug: req.params.slug }, NO_ID);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
}));

app.get('/api/categories', route(async (req, res) => {
  const db = await getDb();
  const categories = await db.collection('products').distinct('category');
  res.json(categories.sort());
}));

// ---------------------------------------------------------------------------
// Products (write) — powers the Admin Product Manager. DB-backed CRUD.
// This is store-management data, not shopper PII — safe for a training target.
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
  if (await db.collection('products').findOne({ slug })) {
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
    rating: b.rating != null ? Number(b.rating) : undefined,
    reviewCount: b.reviewCount != null ? Number(b.reviewCount) : 0,
    description: b.description || '',
    specs: b.specs || {},
    tags: Array.isArray(b.tags) ? b.tags : [],
  };
  await db.collection('products').insertOne({ ...doc });
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
  const result = await db.collection('products').findOneAndUpdate(
    { slug: req.params.slug },
    { $set: update },
    { returnDocument: 'after', projection: { _id: 0 } },
  );
  if (!result) return res.status(404).json({ error: 'Not found' });
  res.json(result);
}));

app.delete('/api/products/:slug', route(async (req, res) => {
  const db = await getDb();
  const { deletedCount } = await db.collection('products').deleteOne({ slug: req.params.slug });
  if (!deletedCount) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true, slug: req.params.slug });
}));

// ---------------------------------------------------------------------------
// Reviews — persisted community reviews. GET/POST/DELETE against Mongo.
// ---------------------------------------------------------------------------
app.get('/api/reviews', route(async (req, res) => {
  const db = await getDb();
  const filter = req.query.slug ? { productSlug: req.query.slug } : {};
  const reviews = await db
    .collection('reviews')
    .find(filter, NO_ID)
    .sort({ createdAt: -1 })
    .toArray();
  res.json(reviews);
}));

app.post('/api/reviews', route(async (req, res) => {
  const b = req.body || {};
  if (!b.productSlug || !b.author || !b.text) {
    return res.status(400).json({ error: 'productSlug, author and text are required' });
  }
  const db = await getDb();
  // Confirm the product exists so reviews always attach to a real slug.
  const product = await db.collection('products').findOne({ slug: b.productSlug });
  if (!product) return res.status(404).json({ error: `Unknown product "${b.productSlug}"` });

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
  await db.collection('reviews').insertOne({ ...doc });

  // Keep the product's aggregate rating/count in sync from real DB data.
  const stats = await db.collection('reviews').aggregate([
    { $match: { productSlug: b.productSlug } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]).toArray();
  if (stats[0]) {
    await db.collection('products').updateOne(
      { slug: b.productSlug },
      { $set: { rating: Math.round(stats[0].avg * 10) / 10, reviewCount: stats[0].n } },
    );
  }
  res.status(201).json(doc);
}));

app.delete('/api/reviews/:id', route(async (req, res) => {
  const db = await getDb();
  const { deletedCount } = await db.collection('reviews').deleteOne({ id: req.params.id });
  if (!deletedCount) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true, id: req.params.id });
}));

// ---------------------------------------------------------------------------
// Stats — live aggregation over the products collection. Powers the Store
// Stats dashboard, which cannot render without a database.
// ---------------------------------------------------------------------------
app.get('/api/stats', route(async (req, res) => {
  const db = await getDb();
  const col = db.collection('products');

  const [totals] = await col.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$stock' },
        inventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
        avgPrice: { $avg: '$price' },
        avgRating: { $avg: '$rating' },
      },
    },
    { $project: { _id: 0 } },
  ]).toArray();

  const byCategory = await col.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        stock: { $sum: '$stock' },
        value: { $sum: { $multiply: ['$price', '$stock'] } },
      },
    },
    { $project: { _id: 0, category: '$_id', count: 1, stock: 1, value: 1 } },
    { $sort: { value: -1 } },
  ]).toArray();

  const lowStock = await col
    .find({ stock: { $lt: 20 } }, { projection: { _id: 0, name: 1, slug: 1, stock: 1, emoji: 1, category: 1 } })
    .sort({ stock: 1 })
    .limit(8)
    .toArray();

  const reviewCount = await db.collection('reviews').countDocuments();

  res.json({ totals: totals || {}, byCategory, lowStock, reviewCount });
}));

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  console.log(`🐛 BugSite API listening on http://localhost:${port}`);
  console.log(`   MongoDB: ${config.safeUri} → db "${config.dbName}"`);
  console.log('   Try: http://localhost:' + port + '/api/products');
});

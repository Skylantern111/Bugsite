import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { getDb, closeDb, config } from './db.js';
// Single source of truth: import the exact same product data the frontend ships
// with. Seeding never invents data — it just loads the 28 products into Mongo.
import { PRODUCTS } from '../bug-site/bug-site/src/data/products.js';
import { SEED_REVIEWS } from '../bug-site/bug-site/src/data/reviews.js';

async function seed() {
  console.log(`Connecting to ${config.safeUri} (db: ${config.dbName})...`);
  const db = await getDb();

  // --- products ---
  const products = db.collection('products');
  await products.deleteMany({});
  const result = await products.insertMany(PRODUCTS.map((p) => ({ ...p })));
  await products.createIndex({ slug: 1 }, { unique: true });
  await products.createIndex({ category: 1 });

  // --- reviews (flattened from SEED_REVIEWS so the community feed starts populated) ---
  const reviews = db.collection('reviews');
  await reviews.deleteMany({});
  const reviewDocs = Object.entries(SEED_REVIEWS).flatMap(([slug, list]) => {
    const product = PRODUCTS.find((p) => p.slug === slug);
    return list.map((r, i) => ({
      id: randomUUID(),
      productSlug: slug,
      productName: product ? product.name : slug,
      author: r.author,
      title: '',
      text: r.text,
      rating: r.rating,
      // Stagger timestamps so the newest-first sort has something to order by.
      createdAt: new Date(Date.now() - (i + 1) * 3600_000).toISOString(),
    }));
  });
  await reviews.insertMany(reviewDocs);
  await reviews.createIndex({ productSlug: 1 });
  await reviews.createIndex({ id: 1 }, { unique: true });

  console.log(`✅ Seeded ${result.insertedCount} products into "${config.dbName}.products".`);
  console.log(`✅ Seeded ${reviewDocs.length} reviews into "${config.dbName}.reviews".`);
  console.log('   Open MongoDB Compass and browse these collections to see them.');
  await closeDb();
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err.message);
  console.error('   Is MongoDB running and MONGODB_URI correct?');
  await closeDb();
  process.exit(1);
});

import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { getDb, closeDb, config } from './db.js';
// Single source of truth: import the exact same product data the frontend ships
// with. Seeding never invents data — it just loads the 28 products into Firestore.
import { PRODUCTS } from '../bug-site/bug-site/src/data/products.js';
import { SEED_REVIEWS } from '../bug-site/bug-site/src/data/reviews.js';

async function wipe(collection) {
  const snap = await collection.get();
  await Promise.all(snap.docs.map((d) => d.ref.delete()));
}

async function seed() {
  console.log(`Connecting to Firestore project "${config.projectId}"${config.usingEmulator ? ` (emulator @ ${config.emulatorHost})` : ''}...`);
  const db = await getDb();

  // --- products (keyed by slug) ---
  const products = db.collection('products');
  await wipe(products);
  await Promise.all(PRODUCTS.map((p) => products.doc(p.slug).set({ ...p })));

  // --- reviews (flattened from SEED_REVIEWS so the community feed starts populated) ---
  const reviews = db.collection('reviews');
  await wipe(reviews);
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
  await Promise.all(reviewDocs.map((r) => reviews.doc(r.id).set(r)));

  console.log(`✅ Seeded ${PRODUCTS.length} products into "products".`);
  console.log(`✅ Seeded ${reviewDocs.length} reviews into "reviews".`);
  console.log('   Open the Firebase console (or emulator UI) to see them.');
  await closeDb();
}

seed().catch(async (err) => {
  console.error('❌ Seed failed:', err.message);
  console.error('   Is Firestore reachable and FIREBASE_PROJECT_ID / credentials correct?');
  await closeDb();
  process.exit(1);
});

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID || 'demo-bugsite';
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
// A key *file path* (works locally and on GCP hosts) or the raw JSON key
// *contents* (works on hosts like Railway with no filesystem to upload to —
// paste the whole service-account.json into one env var).
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

function loadCredential() {
  if (serviceAccountJson) return cert(JSON.parse(serviceAccountJson));
  if (serviceAccountPath) return cert(serviceAccountPath);
  return undefined;
}

// Single shared Firestore instance, created lazily on first use so the server
// can boot even before credentials/emulator are ready (requests will then
// fail cleanly). A `demo-` project id lets the Firestore emulator run with no
// real credentials at all, mirroring how local MongoDB needed no auth either.
let db;

export async function getDb() {
  if (!db) {
    if (!getApps().length) {
      const credential = emulatorHost ? undefined : loadCredential();
      initializeApp(credential ? { credential, projectId } : { projectId });
    }
    db = getFirestore();
  }
  return db;
}

export async function closeDb() {
  // firebase-admin has no persistent socket to tear down explicitly; this is
  // kept so callers (seed.js) don't need to know that.
  db = undefined;
}

export const config = {
  projectId,
  usingEmulator: Boolean(emulatorHost),
  emulatorHost: emulatorHost || null,
};

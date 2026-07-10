import dns from 'node:dns';
import { MongoClient } from 'mongodb';

// Node's own DNS resolver (c-ares) can fail with querySrv ECONNREFUSED on some
// Windows/VPN networks even when the OS resolves fine. Setting DNS_SERVER (e.g.
// 8.8.8.8) forces Node to use a resolver that answers the mongodb+srv lookup.
if (process.env.DNS_SERVER) {
  dns.setServers(process.env.DNS_SERVER.split(',').map((s) => s.trim()));
}

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'bugsite';

// Single shared client, connected lazily on first use so the server can boot
// even when MongoDB isn't running yet (requests will then fail cleanly).
let client;

export async function getDb() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(dbName);
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = undefined;
  }
}

// Hide credentials before printing/returning the URI anywhere (logs, /health).
export function redactUri(u) {
  return u.replace(/\/\/([^:@/]+):([^@/]+)@/, '//$1:****@');
}

export const config = { uri, dbName, safeUri: redactUri(uri) };

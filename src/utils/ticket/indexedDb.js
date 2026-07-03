/**
 * indexedDb.js — IndexedDB wrapper for ticket cache
 * ───────────────────────────────────────────────
 * Stores optimised ticket results with timestamp + TTL.
 */

const DB_NAME = "ticket_optimiser_cache";
const DB_VERSION = 1;
const STORE_NAME = "results";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    req.onsuccess = (event) => resolve(event.target.result);
    req.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Save a result with TTL + fetchedAt timestamp.
 */
export async function saveResult(key, data, ttlMs = 30 * 60 * 1000) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const now = Date.now();
    store.put({ key, data, expires: now + ttlMs, fetchedAt: now });
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Load a result. Returns { data, fetchedAt, fresh, stale } or null.
 *
 * fresh  = within TTL         → no need to refresh
 * stale  = expired            → should refresh in background
 * null   = missing entirely   → must fetch live
 */
export async function getResult(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(key);

    req.onsuccess = () => {
      const entry = req.result;
      if (!entry) return resolve(null);

      const now = Date.now();
      if (now > entry.expires) {
        // Expired — still return data but mark as stale
        return resolve({
          data: entry.data,
          fetchedAt: entry.fetchedAt,
          fresh: false,
        });
      }

      resolve({ data: entry.data, fetchedAt: entry.fetchedAt, fresh: true });
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Check if a key exists and is fresh (within TTL).
 */
export async function isFresh(key) {
  const entry = await getResult(key);
  return entry?.fresh === true;
}

/**
 * Get all non-expired keys.
 */
export async function getAllKeys() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const now = Date.now();
      const entries = req.result || [];
      const fresh = entries.filter((e) => e.expires > now);
      resolve(fresh.map((e) => e.key));
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Clear all expired entries.
 */
export async function clearExpired() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const now = Date.now();
      const entries = req.result || [];
      entries.forEach((e) => {
        if (e.expires <= now) store.delete(e.key);
      });
    };
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Clear everything.
 */
export async function clearAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Format a "last updated" time string.
 */
export function formatFetchedAt(fetchedAt) {
  if (!fetchedAt) return "Unknown";
  const diff = Date.now() - fetchedAt;
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "Just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;

  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
}

/**
 * Format fetchedAt as a precise time (HH:MM AM/PM).
 */
export function formatFetchedAtTime(fetchedAt) {
  if (!fetchedAt) return "";
  return new Date(fetchedAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

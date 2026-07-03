/**
 * cache.js — Frontend (ES Module)
 * ───────────────────────────────────────────────
 * In-memory TTL cache. Data lives in the browser tab's
 * memory — gone on page refresh. Perfect for avoiding
 * re-fetching agencies or re-running optimiser within
 * a single user session.
 */

const cache = new Map();
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ENTRIES = 100;

export function cacheGet(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function cacheSet(key, data, ttlMs = DEFAULT_TTL_MS) {
  if (cache.size >= MAX_ENTRIES) {
    let oldestKey = null;
    let oldestExpiry = Infinity;
    for (const [k, v] of cache.entries()) {
      if (v.expires < oldestExpiry) {
        oldestExpiry = v.expires;
        oldestKey = k;
      }
    }
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

export function cacheHas(key) {
  return cacheGet(key) !== null;
}

export function cacheClear() {
  cache.clear();
}

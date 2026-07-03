/**
 * prefetch.js — Background pre-fetch engine
 * ───────────────────────────────────────────────
 * Runs silently after login. Fetches configured routes
 * for today and stores optimised results in IndexedDB.
 *
 * Exposes real-time status so the UI can show:
 *   "Loading DXB, JED... 2 of 4 routes ready"
 */

import { getPrefetchRoutes } from "./prefetchConfig";
import { saveResult, isFresh } from "./indexedDb";
import { fetchAgencies, fetchFlightData, CONTRACT_ID } from "./ticketApi";
import { buildMegaQuery } from "./queryBuilder";
import { normaliseResults } from "./normaliser";
import { optimise } from "./optimiser";

const AGENCIES_PER_BATCH = 50;
const MAX_CONCURRENT = 7;
const CACHE_TTL = 30 * 60 * 1000;

let prefetchStatus = "idle"; // idle | running | done | error
let prefetchProgress = {
  completed: 0,
  total: 0,
  currentRoute: "",
  routesDone: [],
  routesRemaining: [],
};
let listeners = [];

function notifyListeners() {
  listeners.forEach((fn) =>
    fn({ status: prefetchStatus, progress: { ...prefetchProgress } }),
  );
}

/**
 * Subscribe to pre-fetch status updates.
 * Returns an unsubscribe function.
 */
export function onPrefetchUpdate(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getPrefetchStatus() {
  return { status: prefetchStatus, progress: { ...prefetchProgress } };
}

/**
 * Start background pre-fetch. Safe to call multiple times.
 */
export async function startPrefetch() {
  if (prefetchStatus === "running") return;

  prefetchStatus = "running";
  prefetchProgress = {
    completed: 0,
    total: 0,
    currentRoute: "",
    routesDone: [],
    routesRemaining: [],
  };
  notifyListeners();

  try {
    const agencies = await fetchAgencies();
    const routes = getPrefetchRoutes();
    const today = new Date().toISOString().slice(0, 10);

    // Find routes that need fetching (not fresh)
    const toFetch = [];
    const alreadyFresh = [];

    for (const route of routes) {
      const key = `${route.code}-${today}-1`;
      const fresh = await isFresh(key);
      if (fresh) {
        alreadyFresh.push(route.label);
      } else {
        toFetch.push(route);
      }
    }

    // Mark already-fresh routes as done immediately
    prefetchProgress.routesDone = [...alreadyFresh];
    prefetchProgress.routesRemaining = toFetch.map((r) => r.label);
    prefetchProgress.total = toFetch.length;
    notifyListeners();

    if (toFetch.length === 0) {
      prefetchStatus = "done";
      notifyListeners();
      return;
    }

    // Split agencies into batches
    const batches = [];
    for (let i = 0; i < agencies.length; i += AGENCIES_PER_BATCH) {
      batches.push(agencies.slice(i, i + AGENCIES_PER_BATCH));
    }

    // Process routes one at a time
    for (let r = 0; r < toFetch.length; r++) {
      const route = toFetch[r];
      prefetchProgress.currentRoute = route.label;
      prefetchProgress.completed = r;
      prefetchProgress.routesRemaining = toFetch.slice(r).map((x) => x.label);
      notifyListeners();

      let allTickets = [];

      const tasks = batches.map((batchAgencies) => async () => {
        const mutation = buildMegaQuery(
          batchAgencies,
          route.code,
          today,
          1,
          CONTRACT_ID,
        );
        try {
          const raw = await fetchFlightData(mutation);
          return normaliseResults(raw, batchAgencies, [today]);
        } catch {
          return [];
        }
      });

      for (let i = 0; i < tasks.length; i += MAX_CONCURRENT) {
        const round = tasks.slice(i, i + MAX_CONCURRENT);
        const results = await Promise.allSettled(round.map((t) => t()));
        for (const r of results) {
          if (r.status === "fulfilled" && Array.isArray(r.value)) {
            allTickets = allTickets.concat(r.value);
          }
        }
      }

      if (allTickets.length > 0) {
        const optimised = optimise(allTickets, new Date(today), "price");
        const key = `${route.code}-${today}-1`;
        await saveResult(key, optimised, CACHE_TTL);
      }

      // Update progress
      prefetchProgress.completed = r + 1;
      prefetchProgress.routesDone.push(route.label);
      prefetchProgress.routesRemaining = toFetch
        .slice(r + 1)
        .map((x) => x.label);
      notifyListeners();
    }

    prefetchProgress.currentRoute = "";
    prefetchProgress.completed = toFetch.length;
    prefetchProgress.routesRemaining = [];
    prefetchStatus = "done";
    notifyListeners();
  } catch (err) {
    console.error("Prefetch failed:", err);
    prefetchStatus = "error";
    notifyListeners();
  }
}

/**
 * searchManager.js — Background search engine for the Ticket Optimiser
 * ───────────────────────────────────────────────
 * Module-level singleton so user-initiated searches survive page
 * navigation (component unmount). Mirrors the prefetch.js pattern:
 * module state + pub/sub status + a monotonically increasing request
 * id for cancellation.
 *
 * Semantics:
 *   - Only ONE user search runs at a time ("latest wins"): starting a
 *     new search invalidates whatever is in flight.
 *   - A search stops ONLY when it finishes or cancelSearch() is called.
 *     Navigating away never stops it — results stream into module state
 *     and caches (memory + IndexedDB) are still written.
 *   - Remounting the page with the same params never restarts or
 *     duplicates a running/finished search.
 */

import { cacheGet, cacheSet } from "./cache";
import { saveResult, getResult } from "./indexedDb";
import { fetchAgencies, fetchFlightData, CONTRACT_ID } from "./ticketApi";
import { buildMegaQuery } from "./queryBuilder";
import { normaliseResults } from "./normaliser";
import { optimise } from "./optimiser";

const AGENCIES_PER_BATCH = 50;
const MAX_CONCURRENT = 7;
const CACHE_TTL_MS = 30 * 60 * 1000;

const makeKey = (p) => `${p.destination}-${p.departureDate}-${p.windowDays}`;

let searchState = {
  status: "idle", // idle | running | done | error
  params: null, // snapshot of { destination, departureDate, windowDays }
  result: null, // final optimised result (cache hit, revalidate or live)
  liveResult: null, // streaming partial result while running
  error: null,
  dataSource: null, // fresh-idb | stale-idb | memory | live
  fetchedAt: null,
  isStale: false,
  refreshing: false, // a background revalidate is running
  cancelled: false, // user cancelled this search — don't auto-restart it
  agenciesCount: 0,
  startedAt: null, // for the UI's estimated progress bar
};

let requestId = 0;
let revalidate = { active: false };
let listeners = [];

function notify() {
  const snapshot = { ...searchState };
  listeners.forEach((fn) => fn(snapshot));
}

/**
 * Subscribe to search state updates. Returns an unsubscribe function.
 */
export function onSearchUpdate(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getSearchState() {
  return { ...searchState };
}

/**
 * Cancel the running search. Bumping the requestId makes the in-flight
 * pipeline short-circuit at its next checkpoint and stop scheduling new
 * batches. Partial results gathered so far (liveResult) stay visible.
 */
export function cancelSearch() {
  requestId += 1;
  if (searchState.status === "running") {
    searchState = {
      ...searchState,
      status: searchState.liveResult ? "done" : "idle",
      cancelled: true,
    };
    notify();
  }
}

/**
 * Start (or resume) a search. Safe to call repeatedly:
 *   - same params while running            → no-op (it keeps going)
 *   - same params with a fresh done result → no-op (result stays shown)
 *   - same params with a stale result      → background revalidate only
 *   - same params after a cancel           → no-op (cancel means cancel)
 *   - anything else                        → new search (latest wins)
 */
export async function startSearch(params) {
  const normalized = {
    destination: params.destination,
    departureDate: params.departureDate,
    windowDays: Number(params.windowDays) || 1,
  };
  if (!normalized.destination || !normalized.departureDate) return;

  const key = makeKey(normalized);

  if (searchState.params && makeKey(searchState.params) === key) {
    if (searchState.status === "running") return;
    if (searchState.cancelled) return;
    if (searchState.status === "done" && !searchState.isStale) return;
    if (searchState.status === "done" && searchState.isStale) {
      // Stale data is already on screen — just refresh it in the background.
      revalidateInBackground(normalized);
      return;
    }
    // status "idle"/"error" with same params → fall through and retry.
  }

  // Latest wins: invalidate whatever is in flight.
  const reqId = ++requestId;

  searchState = {
    ...searchState,
    status: "running",
    params: normalized,
    result: null,
    liveResult: null,
    error: null,
    dataSource: null,
    fetchedAt: null,
    isStale: false,
    cancelled: false,
    startedAt: Date.now(),
  };
  notify();

  try {
    // 1) IndexedDB — fresh → done; stale → show it + revalidate in background
    const cached = await getResult(key);
    if (reqId !== requestId) return;
    if (cached) {
      searchState = {
        ...searchState,
        result: cached.data,
        fetchedAt: cached.fetchedAt,
        dataSource: cached.fresh ? "fresh-idb" : "stale-idb",
        status: "done",
        isStale: !cached.fresh,
      };
      notify();
      if (!cached.fresh) revalidateInBackground(normalized);
      return;
    }

    // 2) In-memory cache (survives route changes within the session)
    const memory = cacheGet(key);
    if (reqId !== requestId) return;
    if (memory) {
      searchState = {
        ...searchState,
        result: memory,
        dataSource: "memory",
        fetchedAt: Date.now(),
        status: "done",
      };
      notify();
      return;
    }

    // 3) Live search against the LMIS gateway
    searchState = { ...searchState, dataSource: "live" };
    notify();

    const agencies = await fetchAgencies();
    if (reqId !== requestId) return;
    searchState = { ...searchState, agenciesCount: agencies.length };
    notify();

    const dates = [];
    for (let i = 0; i < normalized.windowDays; i++) {
      const d = new Date(normalized.departureDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const batches = [];
    for (let i = 0; i < agencies.length; i += AGENCIES_PER_BATCH) {
      batches.push(agencies.slice(i, i + AGENCIES_PER_BATCH));
    }

    const tasks = [];
    dates.forEach((date) => {
      batches.forEach((batchAgencies) => {
        tasks.push(async () => {
          if (reqId !== requestId) return [];
          try {
            const raw = await fetchFlightData(
              buildMegaQuery(
                batchAgencies,
                normalized.destination,
                date,
                1,
                CONTRACT_ID,
              ),
            );
            if (reqId !== requestId) return [];
            return normaliseResults(raw, batchAgencies, [date]);
          } catch {
            return [];
          }
        });
      });
    });

    let all = [];
    for (let i = 0; i < tasks.length; i += MAX_CONCURRENT) {
      if (reqId !== requestId) return;
      const round = await Promise.allSettled(
        tasks.slice(i, i + MAX_CONCURRENT).map((t) => t()),
      );
      let gained = false;
      for (const r of round) {
        if (r.status === "fulfilled" && Array.isArray(r.value)) {
          all = all.concat(r.value);
          gained = true;
        }
      }
      // Stream partial results so the UI shows "Best So Far" while the
      // search is still running — even when the user is on another page,
      // because this state lives at module level now.
      if (all.length && gained) {
        searchState = {
          ...searchState,
          liveResult: optimise(
            all,
            new Date(normalized.departureDate),
            "price",
          ),
        };
        notify();
      }
    }

    if (reqId !== requestId) return;

    if (!all.length) {
      searchState = {
        ...searchState,
        status: "error",
        error: `No flights found for ${normalized.destination} on ${normalized.departureDate}`,
      };
      notify();
      return;
    }

    const finalResult = optimise(
      all,
      new Date(normalized.departureDate),
      "price",
    );
    const now = Date.now();
    cacheSet(key, finalResult, CACHE_TTL_MS);
    try {
      await saveResult(key, finalResult, CACHE_TTL_MS);
    } catch {
      // Cache write failure is non-fatal — memory cache still has it.
    }

    if (reqId !== requestId) return;

    searchState = {
      ...searchState,
      status: "done",
      result: finalResult,
      liveResult: finalResult,
      fetchedAt: now,
      dataSource: "live",
    };
    notify();
  } catch (err) {
    if (reqId !== requestId) return;
    searchState = {
      ...searchState,
      status: "error",
      error: err?.message || "Error",
    };
    notify();
  }
}

/**
 * Stale-while-revalidate: re-run a full-window search for params whose
 * cached result expired, then refresh the caches. Navigation-safe by
 * design (not tied to requestId) — it only publishes to the UI when the
 * user is still on the same params and no user search is running.
 */
export async function revalidateInBackground(params) {
  if (revalidate.active) return;
  const key = makeKey(params);

  revalidate = { active: true };
  searchState = { ...searchState, refreshing: true };
  notify();

  try {
    const agencies = await fetchAgencies();

    const dates = [];
    for (let i = 0; i < params.windowDays; i++) {
      const d = new Date(params.departureDate);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const batches = [];
    for (let i = 0; i < agencies.length; i += AGENCIES_PER_BATCH) {
      batches.push(agencies.slice(i, i + AGENCIES_PER_BATCH));
    }

    let all = [];
    for (let i = 0; i < batches.length; i += MAX_CONCURRENT) {
      // Full window (all dates × all batches) so the refreshed cache entry
      // covers every day of the window — the old in-component version only
      // re-fetched day 1 while writing it under the multi-day cache key.
      const tasks = batches
        .slice(i, i + MAX_CONCURRENT)
        .flatMap((batchAgencies) =>
          dates.map((date) => async () => {
            try {
              const raw = await fetchFlightData(
                buildMegaQuery(
                  batchAgencies,
                  params.destination,
                  date,
                  1,
                  CONTRACT_ID,
                ),
              );
              return normaliseResults(raw, batchAgencies, [date]);
            } catch {
              return [];
            }
          }),
        );
      const settled = await Promise.allSettled(tasks.map((t) => t()));
      for (const s of settled) {
        if (s.status === "fulfilled" && Array.isArray(s.value)) {
          all = all.concat(s.value);
        }
      }
    }

    if (all.length) {
      const fresh = optimise(all, new Date(params.departureDate), "price");
      cacheSet(key, fresh, CACHE_TTL_MS);
      await saveResult(key, fresh, CACHE_TTL_MS);

      const stillSameParams =
        searchState.params && makeKey(searchState.params) === key;
      const noUserSearch = searchState.status !== "running";
      if (stillSameParams && noUserSearch) {
        searchState = {
          ...searchState,
          result: fresh,
          fetchedAt: Date.now(),
          dataSource: "fresh-idb",
          isStale: false,
        };
      }
    }
  } catch (err) {
    console.warn("Background refresh:", err?.message);
  } finally {
    revalidate = { active: false };
    searchState = { ...searchState, refreshing: false };
    notify();
  }
}

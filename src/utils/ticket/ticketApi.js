/**
 * ticketApi.js — Frontend (ES Module)
 * ───────────────────────────────────────────────
 * Direct calls to the LMIS GraphQL gateway from the browser.
 */

import { cacheGet, cacheSet } from "./cache";

const LMIS_GATEWAY = "https://gateway.lmis.gov.et/v1/graphql";
export const CONTRACT_ID = "b7f42792-d0e1-4cb2-96e4-e203bcf191a6";
const AGENCY_CACHE_KEY = "lmis_agencies_frontend";
const AGENCY_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch active travel agencies (cached in browser memory).
 */
export async function fetchAgencies() {
  const cached = cacheGet(AGENCY_CACHE_KEY);
  if (cached) return cached;

  const res = await fetch(LMIS_GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operationName: "GET_TRAVEL_AGENCIES",
      query: `query GET_TRAVEL_AGENCIES {
        emdms {
          emdms_ticketing_agency_labours(where: {is_active: {_eq: true}}) {
            labour_id name id
          }
        }
      }`,
      variables: {},
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch agencies (HTTP ${res.status})`);
  }

  const json = await res.json();
  const raw = json?.data?.emdms?.emdms_ticketing_agency_labours || [];

  if (raw.length === 0) {
    throw new Error("No active agencies returned from LMIS");
  }

  const agencies = raw.map((a) => ({
    labour_id: a.labour_id,
    name: a.name,
    id: a.id,
  }));

  cacheSet(AGENCY_CACHE_KEY, agencies, AGENCY_CACHE_TTL);
  return agencies;
}

/**
 * Send the mega-mutation and return the raw GraphQL response.
 */
export async function fetchFlightData(mutation) {
  const res = await fetch(LMIS_GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables: {} }),
  });

  if (!res.ok) {
    throw new Error(`LMIS returned HTTP ${res.status}`);
  }

  const data = await res.json();

  if (data.errors && data.errors.length > 0) {
    console.error("LMIS GraphQL errors:", data.errors);
    throw new Error("LMIS query returned errors");
  }

  return data;
}

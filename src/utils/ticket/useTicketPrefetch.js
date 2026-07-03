/**
 * useTicketPrefetch.js
 * ───────────────────────────────────────────────
 * React hook — call once on app init (after login).
 * Starts silent background pre-fetch of configured routes.
 */

import { useEffect, useState } from "react";
import {
  startPrefetch,
  onPrefetchUpdate,
  getPrefetchStatus,
} from "./prefetch";

export function useTicketPrefetch() {
  const [status, setStatus] = useState(() => getPrefetchStatus());

  useEffect(() => {
    // Start pre-fetch
    startPrefetch();

    // Listen for updates
    const unsub = onPrefetchUpdate((s) => setStatus(s));

    return unsub;
  }, []);

  return status;
}

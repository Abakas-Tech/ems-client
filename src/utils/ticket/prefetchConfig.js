const DEFAULT_ROUTES = [
  { code: "JED", label: "Jeddah" },
  { code: "RUH", label: "Riyadh" },
  { code: "DMM", label: "Dammam" },
  { code: "AMM", label: "Amman" },
];

export function getPrefetchRoutes() {
  try {
    const stored = localStorage.getItem("ticket_prefetch_routes");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ROUTES;
}

export function setPrefetchRoutes(routes) {
  localStorage.setItem("ticket_prefetch_routes", JSON.stringify(routes));
}

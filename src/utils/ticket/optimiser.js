/**
 * optimiser.js — Frontend (ES Module)
 * ───────────────────────────────────────────────
 * Sliding-window best-price engine.
 */

export const WINDOWS = {
  "3_day": {
    days: 3,
    label: "Within 3 Days",
    icon: "bi-lightning-charge",
    color: "#10b981",
  },
  "7_day": {
    days: 7,
    label: "Within 7 Days",
    icon: "bi-calendar-week",
    color: "#3b82f6",
  },
  "15_day": {
    days: 15,
    label: "Within 15 Days",
    icon: "bi-calendar-range",
    color: "#f59e0b",
  },
};

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function optimise(tickets, refDate = new Date(), sortBy = "price") {
  if (!Array.isArray(tickets) || tickets.length === 0) {
    return { windows: {}, all_tickets: [] };
  }

  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);

  const future = tickets.filter((t) => new Date(t.departure_date) >= today);
  const result = { windows: {}, all_tickets: future };

  for (const [key, config] of Object.entries(WINDOWS)) {
    const endDate = addDays(today, config.days);

    const candidates = future.filter((t) => {
      const dep = new Date(t.departure_date);
      return dep >= today && dep <= endDate;
    });

    const sorted = [...candidates].sort((a, b) => {
      if (sortBy === "price") {
        if (a.total_price !== b.total_price)
          return a.total_price - b.total_price;
        return new Date(a.departure_date) - new Date(b.departure_date);
      }
      return new Date(a.departure_date) - new Date(b.departure_date);
    });

    result.windows[key] = {
      ...config,
      count: sorted.length,
      best: sorted[0] || null,
      top_5: sorted.slice(0, 5),
    };
  }

  return result;
}

export function getRouteOptions(tickets) {
  const origins = new Set();
  const destinations = new Set();
  for (const t of tickets) {
    if (t.route_from) origins.add(t.route_from);
    if (t.route_to) destinations.add(t.route_to);
  }
  return {
    origins: [...origins].sort(),
    destinations: [...destinations].sort(),
  };
}

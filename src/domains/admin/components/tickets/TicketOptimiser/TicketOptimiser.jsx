import React, { useState, useEffect, useRef, useMemo } from "react";
import { WINDOWS } from "../../../../../utils/ticket/optimiser";
import { formatFetchedAt } from "../../../../../utils/ticket/indexedDb";
import {
  onPrefetchUpdate,
  getPrefetchStatus,
} from "../../../../../utils/ticket/prefetch";
import {
  startSearch,
  cancelSearch,
  onSearchUpdate,
  getSearchState,
} from "../../../../../utils/ticket/searchManager";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import TicketFilter from "../TicketFilter/TicketFilter";

// Batch size, concurrency and cache TTL now live in searchManager.js
const LIST_LIMIT = 10;

// How many alternative offers the "Also available" list shows. Raising this
// number only helps if bestPriceWindow[key].top_5 (see optimiser.js) actually
// contains that many entries — by name it looks capped at 5 upstream, so this
// constant is a ceiling on the display side, not a guarantee of 10 results.
const ALT_LIST_LIMIT = 10;

// Rough real-world durations per search window (matches the estimates
// already shown in the window dropdown: ~1/4/8/15 min). The progress bar
// is driven by these, not by actual batches completed — batch-accurate
// progress looked "stuck" for long stretches then jumped erratically, which
// read as broken even when the search was working fine underneath.
const WINDOW_ESTIMATED_MS = {
  1: 60 * 1000,
  3: 4 * 60 * 1000,
  7: 8 * 60 * 1000,
  15: 15 * 60 * 1000,
};

function getDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diff = (target - today) / 86400000;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function getWindowLabel(days, departureDate) {
  if (days === 1) return getDateLabel(departureDate);
  const start = getDateLabel(departureDate);
  const endDate = new Date(departureDate);
  endDate.setDate(endDate.getDate() + days - 1);
  const end = getDateLabel(endDate.toISOString().slice(0, 10));
  return start + " \u2013 " + end;
}

// ────────────────────────────────────────────
// Best-Price Card
// ────────────────────────────────────────────
var BestPriceCard = function (p) {
  var aw = [
    { key: "3_day", ...WINDOWS["3_day"] },
    { key: "7_day", ...WINDOWS["7_day"] },
    { key: "15_day", ...WINDOWS["15_day"] },
  ];
  var ac =
    aw.find(function (w) {
      return w.days >= (p.windowDays || 1);
    }) || aw[0];
  var best = p.bestPriceWindow?.[ac.key]?.best;
  var count = p.bestPriceWindow?.[ac.key]?.count || 0;
  var wl = getWindowLabel(p.windowDays || 1, p.departureDate);
  // Renamed from `top3` since it's no longer a fixed 3 — capped at
  // ALT_LIST_LIMIT (10), but the real ceiling is however many entries
  // bestPriceWindow[key].top_5 actually contains upstream.
  var topAlternatives = (p.bestPriceWindow?.[ac.key]?.top_5 || []).slice(
    0,
    ALT_LIST_LIMIT,
  );

  // Dashed "perforation" divider — evokes a ticket tear-line rather than a plain rule
  var Perforation = function () {
    return (
      <div
        style={{
          width: "2px",
          alignSelf: "stretch",
          minHeight: "48px",
          flexShrink: 0,
          backgroundImage:
            "repeating-linear-gradient(to bottom, #d7dce3 0, #d7dce3 4px, transparent 4px, transparent 9px)",
        }}
      />
    );
  };

  return (
    <div className="col-12">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "22px",
          padding: "18px 24px 18px 20px",
          borderRadius: "16px",
          borderTop: "1px solid #eef1f5",
          borderRight: "1px solid #eef1f5",
          borderBottom: "1px solid #eef1f5",
          borderLeft: "4px solid " + ac.color,
          background: "#ffffff",
          boxShadow:
            "0 1px 2px rgba(15,23,42,0.04), 0 10px 28px -16px rgba(15,23,42,0.14)",
        }}
      >
        {/* Route */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            minWidth: "180px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: ac.color + "14",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i
              className="bi bi-airplane-fill"
              style={{
                fontSize: "18px",
                color: ac.color,
                transform: "rotate(45deg)",
                display: "inline-block",
              }}
            />
          </div>
          <div style={{ lineHeight: 1.4 }}>
            <div
              className="fw-bold text-dark"
              style={{ fontSize: "15px", letterSpacing: "0.2px" }}
            >
              ADD
              <span
                style={{
                  color: "#cbd5e1",
                  margin: "0 6px",
                  fontWeight: 400,
                }}
              >
                ✈ ·· ✈
              </span>
              {p.destination || "???"}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "2px",
              }}
            >
              <i className={"bi " + ac.icon} style={{ color: ac.color }} />
              <span>
                {wl} · {count} ticket{count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <Perforation />

        {/* Best price — styled like an airport departure board */}
        {best ? (
          <>
            <div
              style={{
                position: "relative",
                borderRadius: "10px",
                padding: "10px 20px",
                background: "linear-gradient(160deg, #12151c 0%, #1c2233 100%)",
                overflow: "hidden",
                minWidth: "150px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: ac.color,
                }}
              />
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: ac.color,
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Best fare
              </div>
              <div style={{ lineHeight: 1, whiteSpace: "nowrap" }}>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', 'SF Mono', monospace",
                    fontWeight: 700,
                    fontSize: "30px",
                    color: "#ffb020",
                    letterSpacing: "0.5px",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {best.total_price.toLocaleString()}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#8b93a7",
                    marginLeft: "6px",
                  }}
                >
                  ETB
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#475569",
                flexWrap: "wrap",
              }}
            >
              {best.airline_logo && (
                <img
                  src={best.airline_logo}
                  alt=""
                  style={{ width: "20px", height: "20px", borderRadius: "5px" }}
                />
              )}
              <span className="fw-semibold text-dark">{best.airline}</span>
              {best.flight_number && (
                <span
                  style={{
                    background: "#f1f5f9",
                    padding: "2px 8px",
                    borderRadius: "5px",
                    fontSize: "12px",
                    fontWeight: 600,
                    fontFamily: "monospace",
                    color: "#334155",
                  }}
                >
                  {best.flight_number}
                </span>
              )}
              <span style={{ color: "#94a3b8" }}>
                {new Date(best.departure_date).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                  color: ac.color,
                  background: ac.color + "12",
                  padding: "3px 10px",
                  borderRadius: "20px",
                }}
              >
                {best.agency_name}
              </span>
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: "14px",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: ac.color,
                display: "inline-block",
                animation: "bpc-pulse 1.2s ease-in-out infinite",
              }}
            />
            Searching agencies...
            <style>{`
              @keyframes bpc-pulse {
                0%, 100% { opacity: 0.25; }
                50% { opacity: 1; }
              }
            `}</style>
          </div>
        )}

        {/* Alternatives — boarding-list style, now up to ALT_LIST_LIMIT
            entries instead of a fixed 3. Long lists get a capped-height,
            scrollable container so the card doesn't stretch the whole row
            taller than the route/price panels next to it. */}
        {topAlternatives.length > 0 && (
          <>
            <Perforation />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                minWidth: "175px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  fontFamily: "monospace",
                  marginBottom: "2px",
                }}
              >
                Also available ({topAlternatives.length})
              </span>
              <div
                style={{
                  maxHeight: topAlternatives.length > 5 ? "190px" : "none",
                  overflowY: topAlternatives.length > 5 ? "auto" : "visible",
                  paddingRight: topAlternatives.length > 5 ? "4px" : 0,
                }}
              >
                {topAlternatives.map(function (t, i) {
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                        padding: "4px 0",
                        borderBottom:
                          i < topAlternatives.length - 1
                            ? "1px solid #f1f5f9"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: ac.color + "16",
                            color: ac.color,
                            fontWeight: 700,
                            fontSize: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        {t.airline_logo && (
                          <img
                            src={t.airline_logo}
                            alt=""
                            style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "3px",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          className="text-truncate"
                          style={{
                            fontSize: "12px",
                            color: "#475569",
                            fontWeight: 500,
                          }}
                        >
                          {t.airline}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          fontFamily: "monospace",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {t.total_price.toLocaleString()}
                        <span
                          style={{
                            fontWeight: 400,
                            color: "#94a3b8",
                            fontSize: "10px",
                            marginLeft: "3px",
                          }}
                        >
                          ETB
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Progress Bar
// ────────────────────────────────────────────
const ProgressBar = ({ completed, total, label }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
          {label}
        </span>
        <span style={{ fontSize: "12px", color: "#64748b" }}>{pct}%</span>
      </div>
      <div
        style={{
          height: "6px",
          background: "#e2e8f0",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: pct + "%",
            background:
              "linear-gradient(90deg, var(--maincolor, #2563eb), #60a5fa)",
            borderRadius: "3px",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
};

// ────────────────────────────────────────────
// Route status pill — used in the background-loading banner
// ────────────────────────────────────────────
const routePillTone = {
  done: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  loading: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  pending: { bg: "#f8fafc", color: "#94a3b8", border: "#e2e8f0" },
};

const RoutePill = ({ route, tone }) => {
  const c = routePillTone[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11.5,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 20,
        background: c.bg,
        color: c.color,
        border: "1px solid " + c.border,
      }}
    >
      {tone === "done" && (
        <i className="bi bi-check-circle-fill" style={{ fontSize: 10 }} />
      )}
      {tone === "loading" && (
        <span
          className="spinner-border spinner-border-sm"
          style={{ width: 9, height: 9, borderWidth: 1.5 }}
        />
      )}
      {route}
    </span>
  );
};

// ────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────
const TicketOptimiser = () => {
  // Filter inputs are restored from the search engine on mount, so coming
  // back to this page mid-search re-attaches to the running/last search
  // instead of resetting to defaults — defaults would trigger a new
  // default search on mount and supersede the running one ("latest wins").
  const lastParams = getSearchState().params;
  const [destination, setDestination] = useState(
    lastParams?.destination ?? "JED",
  );
  const [departureDate, setDepartureDate] = useState(
    () => lastParams?.departureDate ?? new Date().toISOString().slice(0, 10),
  );
  const [windowDays, setWindowDays] = useState(lastParams?.windowDays ?? 1);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [show15Warning, setShow15Warning] = useState(
    lastParams?.windowDays === 15,
  );
  const [listPage, setListPage] = useState(1);
  const [prefetchState, setPrefetchState] = useState(() => getPrefetchStatus());
  // ...but search state (status/results/progress) lives in the module-level
  // searchManager, so an in-flight search keeps running when the user
  // navigates away from this page. This component only subscribes to it.
  const [search, setSearch] = useState(getSearchState);
  const fakeProgressTimerRef = useRef(null);
  const fakeProgressStartRef = useRef(null);

  // Derived from the search manager — same names the render below has
  // always used, so the JSX stays untouched.
  const loading = search.status === "running";
  const refreshing = search.refreshing;
  const error = search.error;
  const result = search.result;
  const liveResult = search.liveResult;
  const fetchedAt = search.fetchedAt;
  const isStale = search.isStale;
  const agenciesCount = search.agenciesCount;

  // Search state listener
  useEffect(function () {
    return onSearchUpdate(setSearch);
  }, []);

  // Prefetch state listener
  useEffect(function () {
    return onPrefetchUpdate(function (s) {
      setPrefetchState(s);
    });
  }, []);

  // Drives the fake progress bar: starts at a small nonzero value so it
  // doesn't look inert, then eases toward 100% using the estimated duration
  // for whichever window was selected. The curve (1 - e^-t/tau) hits ~95%
  // right around the estimated time, then keeps creeping up slowly if the
  // real request runs long, instead of sitting at 100% while still loading
  // or looking stuck. It's capped below 100 — the bar only reaches 100% when
  // `loading` actually goes false and unmounts.
  useEffect(() => {
    if (loading) {
      // startedAt comes from the manager — the search may have started
      // before this page mounted (or while the user was on another page),
      // so we sync to it instead of "now".
      fakeProgressStartRef.current = search.startedAt || Date.now();
      const progressWindow = search.params?.windowDays || windowDays;
      setFakeProgress(4);
      const estimatedMs =
        WINDOW_ESTIMATED_MS[progressWindow] || WINDOW_ESTIMATED_MS[1];
      const tau = estimatedMs / 3;
      fakeProgressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - fakeProgressStartRef.current;
        const pct = 100 * (1 - Math.exp(-elapsed / tau));
        setFakeProgress(Math.min(pct, 97));
      }, 150);
    } else {
      clearInterval(fakeProgressTimerRef.current);
      setFakeProgress(0);
    }
    return () => clearInterval(fakeProgressTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  // Note: there is intentionally no "load cached result on mount" effect —
  // the auto-search effect below fires on the initial render and delegates
  // to searchManager.startSearch, which resolves fresh IndexedDB / memory
  // caches instantly and never restarts a search that is already running.
  // (Stale-while-revalidate moved into searchManager.revalidateInBackground —
  // it is background work by nature, so it belongs outside the component.)
  var handleWindowChange = function (v) {
    var d = Number(v);
    setWindowDays(d);
    setShow15Warning(d === 15);
  };

  var handleCancel = function () {
    // Cancels the background engine: searchManager bumps its request id so
    // the in-flight pipeline short-circuits at its next checkpoint (stops
    // scheduling new batches and won't publish state anymore). Partial
    // results gathered so far (liveResult) are kept rather than cleared.
    // The engine stays cancelled for these params — navigating away and
    // back will NOT restart it; changing filters starts a new search.
    cancelSearch();
  };

  // (Search pipeline moved into searchManager.startSearch — it runs at
  // module level so it survives page navigation.)

  // Auto-search when filters change (including on mount). Delegates to the
  // background engine: same-params calls are no-ops there, so navigating
  // away and back never restarts or duplicates a search; changed params
  // start a new search and invalidate the old one ("latest wins").
  useEffect(() => {
    if (destination && departureDate) {
      startSearch({ destination, departureDate, windowDays });
    }
  }, [destination, departureDate, windowDays]);

  // New search started → back to the first page of the results list.
  // (params is a fresh object only when a genuinely new search begins.)
  useEffect(() => {
    setListPage(1);
  }, [search.params]);

  const displayResult = result || liveResult;
  const rawTickets = displayResult?.all_tickets || [];
  // "All Results" should read cheapest → most expensive. optimise() doesn't
  // guarantee an order (it's built for finding the best-per-window, not for
  // display), so the sort happens here rather than assuming upstream order.
  // Sorted on a copy — never mutate the array coming from state/props.
  // Missing/invalid prices sort to the end instead of crashing the compare.
  const allTickets = useMemo(() => {
    return [...rawTickets].sort((a, b) => {
      const pa = Number.isFinite(a?.total_price) ? a.total_price : Infinity;
      const pb = Number.isFinite(b?.total_price) ? b.total_price : Infinity;
      return pa - pb;
    });
  }, [rawTickets]);
  const paginatedData = useMemo(() => {
    const start = (listPage - 1) * LIST_LIMIT;
    return allTickets.slice(start, start + LIST_LIMIT);
  }, [allTickets, listPage]);

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Ticket Optimiser</h2>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <p className="text-muted mb-0">
            Compare prices across {agenciesCount || "all"} travel agencies.
          </p>
          {/* Your badges */}
        </div>
      </div>

      <TicketFilter
        destination={destination}
        setDestination={setDestination}
        departureDate={departureDate}
        setDepartureDate={setDepartureDate}
        windowDays={windowDays}
        handleWindowChange={handleWindowChange}
        onCancel={handleCancel}
        loading={loading}
      />

      {/* All Alerts in Middle Section */}
      {prefetchState.status === "running" &&
        (() => {
          const doneRoutes = prefetchState.progress.routesDone || [];
          const currentRoute = prefetchState.progress.currentRoute;
          // The prefetch state can list the in-progress route inside
          // routesRemaining too — filter it out so a route never shows as
          // both "loading" and "remaining" at once.
          const remainingRoutes = (
            prefetchState.progress.routesRemaining || []
          ).filter((r) => r !== currentRoute);

          return (
            <div
              className="d-flex align-items-start gap-3 mb-3 p-3 rounded-3"
              style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <i
                className="bi bi-arrow-repeat"
                style={{
                  fontSize: "16px",
                  color: "#1d4ed8",
                  marginTop: "1px",
                  flexShrink: 0,
                  animation: "spin 1.5s linear infinite",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1e3a8a",
                    marginBottom: "8px",
                  }}
                >
                  Loading prices for other destinations in the background
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {doneRoutes.map((r) => (
                    <RoutePill key={r} route={r} tone="done" />
                  ))}
                  {currentRoute && (
                    <RoutePill route={currentRoute} tone="loading" />
                  )}
                  {remainingRoutes.map((r) => (
                    <RoutePill key={r} route={r} tone="pending" />
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

      {prefetchState.status === "done" &&
        prefetchState.progress.routesDone.length > 0 &&
        !loading &&
        !displayResult && (
          <div
            className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3"
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              fontSize: "13px",
              color: "#065f46",
            }}
          >
            <i
              className="bi bi-check-circle-fill"
              style={{ fontSize: "15px" }}
            />
            <div>
              <strong>Ready</strong> —{" "}
              {prefetchState.progress.routesDone.join(", ")} pre-loaded.
            </div>
          </div>
        )}

      {show15Warning && !loading && (
        <div
          className="d-flex align-items-start gap-2 mb-3 p-3 rounded-3"
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            fontSize: "13px",
            color: "#92400e",
          }}
        >
          <i
            className="bi bi-exclamation-triangle-fill"
            style={{ marginTop: "1px" }}
          />
          <div>
            <strong>
              A 15-day search checks every agency across all 15 dates
            </strong>
            , so it can take 10–15 minutes. Try a single day first if you're not
            sure yet.
          </div>
        </div>
      )}

      {loading && (
        <ProgressBar
          completed={Math.round(fakeProgress)}
          total={100}
          label={
            windowDays > 1
              ? `Searching flights across ${windowDays} days`
              : "Searching travel agencies"
          }
        />
      )}

      {error && (
        <div
          className="d-flex align-items-center gap-2 mb-4 p-3 rounded-3"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            fontSize: "13px",
          }}
        >
          <i className="bi bi-exclamation-triangle" />
          {error}
        </div>
      )}

      {/* Results */}
      {displayResult && (
        <>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span
              style={{
                width: "3px",
                height: "20px",
                background: "var(--maincolor, #2563eb)",
                borderRadius: "2px",
                display: "inline-block",
              }}
            />
            <h5 className="fw-bold mb-0" style={{ fontSize: "15px" }}>
              {loading ? "Best So Far" : "Best Prices"}
            </h5>
            <span
              style={{
                fontSize: "11px",
                background: loading ? "#fef9c3" : "#eff6ff",
                color: loading ? "#92400e" : "#1d4ed8",
                padding: "2px 10px",
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              {loading
                ? allTickets.length + " tickets found so far"
                : allTickets.length + " tickets found"}
            </span>
            {fetchedAt && (
              <span
                style={{
                  fontSize: "11px",
                  background: isStale || refreshing ? "#fef3c7" : "#f8fafc",
                  color: isStale || refreshing ? "#92400e" : "#64748b",
                  padding: "2px 10px",
                  borderRadius: "20px",
                  fontWeight: 500,
                }}
              >
                <i className="bi bi-clock me-1" />
                {refreshing
                  ? "Updating prices..."
                  : isStale
                    ? "Checking for newer prices..."
                    : formatFetchedAt(fetchedAt)}
              </span>
            )}
          </div>

          <div className="row mb-4">
            <BestPriceCard
              windowDays={windowDays}
              bestPriceWindow={displayResult.windows}
              destination={destination}
              departureDate={departureDate}
            />
          </div>

          {!loading && (
            <div className="mt-3">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span
                  style={{
                    width: "3px",
                    height: "20px",
                    background: "#f59e0b",
                    borderRadius: "2px",
                    display: "inline-block",
                  }}
                />
                <h5 className="fw-bold mb-0" style={{ fontSize: "15px" }}>
                  All Results
                </h5>
                <span
                  style={{
                    fontSize: "11px",
                    background: "#f1f5f9",
                    color: "#475569",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    fontWeight: 600,
                  }}
                >
                  {allTickets.length} tickets
                </span>
              </div>
              <ListingComponent
                data={paginatedData}
                columns={[
                  {
                    header: "Airline",
                    accessor: "airline",
                    render: (row) => (
                      <div className="d-flex align-items-center gap-2">
                        {row.airline_logo && (
                          <img
                            src={row.airline_logo}
                            alt=""
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "4px",
                            }}
                          />
                        )}
                        <span className="fw-medium">{row.airline}</span>
                      </div>
                    ),
                  },
                  { header: "Flight", accessor: "flight_number" },
                  {
                    header: "Date",
                    render: (row) =>
                      new Date(row.departure_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      }),
                  },
                  {
                    header: "Price (ETB)",
                    render: (row) => (
                      <span className="fw-semibold">
                        {row.total_price?.toLocaleString()}
                      </span>
                    ),
                  },
                  { header: "Agency", accessor: "agency_name" },
                ]}
                emptyState={{
                  title: "No results found",
                  subtitle:
                    "Try adjusting your filters or expanding the date window.",
                }}
                pagination={{
                  page: listPage,
                  limit: LIST_LIMIT,
                  total: allTickets.length,
                }}
                onPageChange={(p) => setListPage(p)}
              />
            </div>
          )}
        </>
      )}

      {!displayResult && !loading && !error && (
        <div className="text-center py-5">
          <i
            className="bi bi-search"
            style={{ fontSize: "48px", color: "#cbd5e1" }}
          />
          <h5
            className="fw-bold text-muted mt-3 mb-1"
            style={{ fontSize: "16px" }}
          >
            Search for best ticket prices
          </h5>
          <p className="text-muted" style={{ fontSize: "13px" }}>
            Select a destination and date, then click Search.
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketOptimiser;

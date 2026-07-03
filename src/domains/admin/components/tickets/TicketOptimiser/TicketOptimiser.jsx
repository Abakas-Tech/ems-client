import React, { useState, useEffect, useRef, useMemo } from "react";
import { WINDOWS, optimise } from "../../../../../utils/ticket/optimiser";
import { buildMegaQuery } from "../../../../../utils/ticket/queryBuilder";
import { normaliseResults } from "../../../../../utils/ticket/normaliser";
import { cacheGet, cacheSet } from "../../../../../utils/ticket/cache";
import {
  getResult,
  saveResult,
  formatFetchedAt,
} from "../../../../../utils/ticket/indexedDb";
import {
  onPrefetchUpdate,
  getPrefetchStatus,
} from "../../../../../utils/ticket/prefetch";
import {
  fetchAgencies,
  fetchFlightData,
  CONTRACT_ID,
} from "../../../../../utils/ticket/ticketApi";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import styles from "./TicketOptimiser.module.css";
import TicketFilter from "../TicketFilter/TicketFilter";

const AGENCIES_PER_BATCH = 50;
const MAX_CONCURRENT = 7;
const CACHE_TTL_MS = 30 * 60 * 1000;
const LIST_LIMIT = 10;

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
// Best-Price Card — three-column compact
// ────────────────────────────────────────────
// Assumes WINDOWS and getWindowLabel are available in this module's scope,
// exactly as in the original — nothing about that contract changed.

const BestPriceCard = (p) => {
  const aw = [
    { key: "3_day", ...WINDOWS["3_day"] },
    { key: "7_day", ...WINDOWS["7_day"] },
    { key: "15_day", ...WINDOWS["15_day"] },
  ];
  const ac = aw.find((w) => w.days >= (p.windowDays || 1)) || aw[0];
  const best = p.bestPriceWindow?.[ac.key]?.best;
  const count = p.bestPriceWindow?.[ac.key]?.count || 0;
  const wl = getWindowLabel(p.windowDays || 1, p.departureDate);
  // Derived from the same window as `best` — previously this came from a
  // separate `top3` prop that the parent always populated from the 15-day
  // window, so it could silently show alternatives from a different window
  // than the one actually selected. Scoping it here means it can't drift.
  const top3 = (p.bestPriceWindow?.[ac.key]?.top_5 || []).slice(0, 3);

  return (
    <div className="col-12">
      <style>{`
        .bpc-alt-col {
          border-left: 1px solid #f1f5f9;
          padding-left: 28px;
        }
        @media (max-width: 991.98px) {
          .bpc-alt-col {
            border-left: none;
            border-top: 1px solid #f1f5f9;
            padding-left: 0;
            padding-top: 20px;
            margin-top: 20px;
          }
        }
      `}</style>

      <div
        className="card border-0"
        style={{
          borderRadius: 16,
          overflow: "hidden",
          background: "#fff",
          maxWidth: 800,
          marginRight: "auto",
          marginLeft: 0,
          border: "1px solid #eef1f5",
          boxShadow:
            "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.08)",
        }}
      >
        {/* Accent bar */}
        <div style={{ height: 4, background: ac.color }} />

        <div className="p-4">
          <div className="row g-0">
            {/* LEFT — Route, price, flight details */}
            <div className="col-lg-7 pe-lg-4">
              <div className="d-flex align-items-start justify-content-between">
                <div className="d-flex gap-3">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: ac.color + "14",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className="bi bi-geo-alt-fill"
                      style={{ fontSize: 20, color: ac.color }}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#0f172a",
                        letterSpacing: -0.2,
                      }}
                    >
                      ADD{" "}
                      <span style={{ color: "#cbd5e1", fontWeight: 500 }}>
                        →
                      </span>{" "}
                      {p.destination || "???"}
                    </div>

                    <div className="d-flex align-items-center flex-wrap gap-2 mt-1">
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: ac.color,
                          background: ac.color + "12",
                          padding: "3px 8px",
                          borderRadius: 6,
                          textTransform: "uppercase",
                          letterSpacing: 0.3,
                        }}
                      >
                        <i
                          className={"bi " + ac.icon}
                          style={{ fontSize: 11 }}
                        />
                        {wl}
                      </span>
                      <span style={{ fontSize: 12.5, color: "#94a3b8" }}>
                        {count} ticket{count !== 1 ? "s" : ""} found
                      </span>
                    </div>
                  </div>
                </div>

                {best && (
                  <div
                    className="text-end"
                    style={{ flexShrink: 0, paddingLeft: 12 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "flex-end",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 30,
                          fontWeight: 800,
                          color: "#0f172a",
                          lineHeight: 1,
                          letterSpacing: -0.5,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {best.total_price.toLocaleString()}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#94a3b8",
                        }}
                      >
                        ETB
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {best && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    className="d-flex align-items-center flex-wrap"
                    style={{ fontSize: 13.5, rowGap: 8 }}
                  >
                    <div
                      className="d-flex align-items-center gap-2"
                      style={{ marginRight: 14 }}
                    >
                      {best.airline_logo && (
                        <img
                          src={best.airline_logo}
                          alt=""
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 5,
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <span style={{ fontWeight: 600, color: "#0f172a" }}>
                        {best.airline}
                      </span>
                      {best.flight_number && (
                        <span style={{ color: "#94a3b8", fontSize: 12.5 }}>
                          {best.flight_number}
                        </span>
                      )}
                    </div>

                    <span style={{ color: "#e2e8f0" }}>•</span>

                    <span style={{ color: "#64748b", marginLeft: 14 }}>
                      <i
                        className="bi bi-calendar3 me-1"
                        style={{ fontSize: 12 }}
                      />
                      {new Date(best.departure_date).toLocaleDateString(
                        "en-GB",
                        { weekday: "short", day: "numeric", month: "short" },
                      )}
                    </span>

                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#475569",
                        background: "#f8fafc",
                        border: "1px solid #f1f5f9",
                        padding: "4px 10px",
                        borderRadius: 6,
                      }}
                    >
                      {best.agency_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Alternatives */}
            <div className="col-lg-5">
              <div className="bpc-alt-col">
                <div
                  style={{
                    fontSize: 10.5,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}
                >
                  Also available
                </div>

                {top3.length > 0 ? (
                  <div>
                    {top3.map((t, i) => (
                      <div
                        key={i}
                        className="d-flex justify-content-between align-items-center"
                        style={{
                          padding: "9px 0",
                          borderTop: i > 0 ? "1px solid #f8fafc" : "none",
                        }}
                      >
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ minWidth: 0, flex: 1 }}
                        >
                          <span
                            style={{
                              color: "#cbd5e1",
                              fontSize: 12,
                              width: 14,
                              fontWeight: 600,
                            }}
                          >
                            {i + 1}
                          </span>
                          {t.airline_logo && (
                            <img
                              src={t.airline_logo}
                              alt=""
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 4,
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <span
                            className="text-truncate"
                            style={{
                              fontSize: 13.5,
                              fontWeight: 500,
                              color: "#334155",
                            }}
                          >
                            {t.airline}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 13.5,
                            fontWeight: 700,
                            color: "#0f172a",
                            fontVariantNumeric: "tabular-nums",
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          {t.total_price.toLocaleString()}{" "}
                          <span
                            style={{
                              fontWeight: 500,
                              color: "#94a3b8",
                              fontSize: 11.5,
                            }}
                          >
                            ETB
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center" style={{ padding: "20px 0" }}>
                    <i
                      className="bi bi-slash-circle"
                      style={{ fontSize: 20, color: "#e2e8f0" }}
                    />
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "#94a3b8",
                        marginTop: 6,
                      }}
                    >
                      No alternative offers
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
  const [destination, setDestination] = useState("JED");
  const [departureDate, setDepartureDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [windowDays, setWindowDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [liveResult, setLiveResult] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    checked: 0,
  });
  const [show15Warning, setShow15Warning] = useState(false);
  const [dataSource, setDataSource] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [prefetchState, setPrefetchState] = useState(() => getPrefetchStatus());
  // Was a boolean `cancelledRef` that was only ever reset to false and never
  // set to true, so every `if (cancelledRef.current) return;` check was dead
  // code. A monotonically increasing request id lets us tell whether the
  // in-flight search is still the latest one requested, and actually bail
  // out of stale searches when the user changes filters mid-flight.
  const requestIdRef = useRef(0);
  const backgroundRefreshRef = useRef(false);

  const airports = [
    { value: "JED", label: "Jeddah (JED)" },
    { value: "RUH", label: "Riyadh (RUH)" },
    { value: "DMM", label: "Dammam (DMM)" },
    { value: "MED", label: "Medina (MED)" },
  ];

  // Prefetch state listener
  useEffect(function () {
    return onPrefetchUpdate(function (s) {
      setPrefetchState(s);
    });
  }, []);

  // Note: the dedicated "load cached JED/today result on mount" effect that
  // used to live here was removed — it raced the auto-search effect below,
  // which fires on the same initial render (destination/departureDate are
  // already set) and performs the identical getResult/cacheGet/stale-refresh
  // lookup itself. Keeping both meant the cached result would flash in, then
  // get wiped by handleSearch's `setResult(null)` and reloaded a moment
  // later. The auto-search effect now covers the mount case on its own.

  var triggerBackgroundRefresh = async function (dest, date, days) {
    if (backgroundRefreshRef.current) return;
    backgroundRefreshRef.current = true;
    setRefreshing(true);
    try {
      var list = await fetchAgencies();
      var batches = [];
      for (var i = 0; i < list.length; i += AGENCIES_PER_BATCH)
        batches.push(list.slice(i, i + AGENCIES_PER_BATCH));
      var all = [];
      for (var r = 0; r < batches.length; r += MAX_CONCURRENT) {
        var tasks = batches.slice(r, r + MAX_CONCURRENT).map(function (b) {
          return async function () {
            try {
              return normaliseResults(
                await fetchFlightData(
                  buildMegaQuery(b, dest, date, 1, CONTRACT_ID),
                ),
                b,
                [date],
              );
            } catch (_) {
              return [];
            }
          };
        });
        var settled = await Promise.allSettled(
          tasks.map(function (t) {
            return t();
          }),
        );
        for (var s = 0; s < settled.length; s++) {
          if (
            settled[s].status === "fulfilled" &&
            Array.isArray(settled[s].value)
          )
            all = all.concat(settled[s].value);
        }
      }
      if (all.length) {
        var fr = optimise(all, new Date(date), "price");
        cacheSet(dest + "-" + date + "-" + days, fr, CACHE_TTL_MS);
        await saveResult(dest + "-" + date + "-" + days, fr, CACHE_TTL_MS);
        if (dest === destination && date === departureDate) {
          setResult(fr);
          setDataSource("fresh-idb");
          setFetchedAt(Date.now());
          setIsStale(false);
        }
      }
    } catch (err) {
      console.warn("Bg refresh:", err.message);
    } finally {
      backgroundRefreshRef.current = false;
      setRefreshing(false);
    }
  };

  var handleWindowChange = function (v) {
    var d = Number(v);
    setWindowDays(d);
    setShow15Warning(d === 15);
  };

  var handleCancel = function () {
    // Bumping the id invalidates every `if (requestId !== requestIdRef.current)`
    // check already threaded through handleSearch, so the in-flight search
    // stops making further batches/requests and won't overwrite state once
    // any already-started network calls resolve. Whatever partial results
    // were gathered so far (liveResult) are kept rather than cleared.
    requestIdRef.current++;
    setLoading(false);
    setProgress({ completed: 0, total: 0, checked: 0 });
  };

  var handleSearch = async function () {
    if (!destination || !departureDate) return;
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setResult(null);
    setLiveResult(null);
    setFetchedAt(null);
    setIsStale(false);
    setDataSource(null);
    setShow15Warning(false);
    setListPage(1);
    try {
      var key = destination + "-" + departureDate + "-" + windowDays;
      var e = await getResult(key);
      if (requestId !== requestIdRef.current) return;
      if (e) {
        setResult(e.data);
        setFetchedAt(e.fetchedAt);
        setDataSource(e.fresh ? "fresh-idb" : "stale-idb");
        setLoading(false);
        if (!e.fresh) {
          setIsStale(true);
          triggerBackgroundRefresh(destination, departureDate, windowDays);
        }
        return;
      }
      var m = cacheGet(key);
      if (m) {
        setResult(m);
        setDataSource("memory");
        setFetchedAt(Date.now());
        setLoading(false);
        return;
      }

      setDataSource("live");
      var list = await fetchAgencies();
      if (requestId !== requestIdRef.current) return;
      setAgencies(list);

      var dates = [];
      for (var i = 0; i < windowDays; i++) {
        var d = new Date(departureDate);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().slice(0, 10));
      }
      var batches = [];
      for (var j = 0; j < list.length; j += AGENCIES_PER_BATCH)
        batches.push(list.slice(j, j + AGENCIES_PER_BATCH));
      var tasks = [];
      dates.forEach(function (date) {
        batches.forEach(function (bA) {
          tasks.push(async function () {
            if (requestId !== requestIdRef.current) return [];
            try {
              return normaliseResults(
                await fetchFlightData(
                  buildMegaQuery(bA, destination, date, 1, CONTRACT_ID),
                ),
                bA,
                [date],
              );
            } catch (_) {
              return [];
            }
          });
        });
      });

      var totalB = tasks.length;
      setProgress({ completed: 0, total: totalB, checked: 0 });
      var all = [],
        cc = 0;
      for (var k = 0; k < totalB; k += MAX_CONCURRENT) {
        if (requestId !== requestIdRef.current) break;
        var round = await Promise.allSettled(
          tasks.slice(k, k + MAX_CONCURRENT).map(function (t) {
            return t();
          }),
        );
        for (var ri = 0; ri < round.length; ri++) {
          cc++;
          if (
            round[ri].status === "fulfilled" &&
            Array.isArray(round[ri].value)
          )
            all = all.concat(round[ri].value);
        }
        setProgress({
          completed: cc,
          total: totalB,
          checked: Math.min(cc * AGENCIES_PER_BATCH, list.length),
        });
        if (all.length)
          setLiveResult(optimise(all, new Date(departureDate), "price"));
      }
      if (requestId !== requestIdRef.current) return;
      if (!all.length) {
        setError(
          "No flights found for " + destination + " on " + departureDate,
        );
        setLoading(false);
        return;
      }
      var fr = optimise(all, new Date(departureDate), "price");
      var now = Date.now();
      cacheSet(key, fr, CACHE_TTL_MS);
      try {
        await saveResult(key, fr, CACHE_TTL_MS);
      } catch (_) {}
      setResult(fr);
      setLiveResult(fr);
      setFetchedAt(now);
      setDataSource("live");
    } catch (err) {
      if (requestId === requestIdRef.current) setError(err.message || "Error");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };
  // Auto-search when filters change
  useEffect(() => {
    if (destination && departureDate) {
      handleSearch();
    }
  }, [destination, departureDate, windowDays]);

  const displayResult = result || liveResult;
  const allTickets = displayResult?.all_tickets || [];
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
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Compare prices across {agencies.length || "all"} travel agencies.
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
        onSearch={handleSearch}
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

      {loading &&
        (progress.total > 0 ? (
          <ProgressBar
            completed={progress.completed}
            total={progress.total}
            label={
              windowDays > 1
                ? `Searching flights across ${windowDays} days`
                : "Searching travel agencies"
            }
          />
        ) : (
          <div
            className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3"
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              fontSize: "13px",
              color: "#1d4ed8",
            }}
          >
            <span
              className="spinner-border spinner-border-sm me-1"
              style={{ width: "14px", height: "14px" }}
            />
            Fetching the list of travel agencies...
          </div>
        ))}

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

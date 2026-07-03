import React, { useState, useEffect, useRef, useMemo } from "react";
import { WINDOWS, optimise } from "../../../../utils/ticket/optimiser";
import { buildMegaQuery } from "../../../../utils/ticket/queryBuilder";
import { normaliseResults } from "../../../../utils/ticket/normaliser";
import { cacheGet, cacheSet } from "../../../../utils/ticket/cache";
import {
  getResult,
  saveResult,
  formatFetchedAt,
} from "../../../../utils/ticket/indexedDb";
import {
  onPrefetchUpdate,
  getPrefetchStatus,
} from "../../../../utils/ticket/prefetch";
import {
  fetchAgencies,
  fetchFlightData,
  CONTRACT_ID,
} from "../../../../utils/ticket/ticketApi";
import ListingComponent from "../../../../shared/components/ListingComponent/ListingComponent";
import styles from "./TicketOptimiser.module.css";

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
  const top3 = p.top3 || [];

  return (
    <div className="col-12">
      <div
        className="card border-0 shadow-sm"
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          background: "#fff",
          maxWidth: "800px", // Reduced width
          marginRight: "auto", // Pushed to left
          marginLeft: 0,
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            height: "5px",
            background: `linear-gradient(90deg, ${ac.color}, ${ac.color}99)`,
          }}
        />

        <div className="card-body p-4">
          <div className="row g-4 align-items-center">
            {/* LEFT — Merged Route + Big Price + Flight Details */}
            <div className="col-lg-7">
              <div className="d-flex gap-4 align-items-start">
                {/* Icon */}
                <div style={{ flexShrink: 0, paddingTop: "4px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: ac.color + "15",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="bi bi-geo-alt-fill"
                      style={{ fontSize: "26px", color: ac.color }}
                    />
                  </div>
                </div>

                {/* Route + Price */}
                <div style={{ flex: 1 }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold fs-4 text-dark">
                        ADD → {p.destination || "???"}
                      </div>
                      <div style={{ fontSize: "13.5px", color: "#64748b" }}>
                        <i className={"bi " + ac.icon + " me-1"} />
                        {wl} • {count} ticket{count !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Price - Centered in its area */}
                    {best && (
                      <div className="text-end" style={{ minWidth: "140px" }}>
                        <div
                          className="fw-bold"
                          style={{
                            fontSize: "34px",
                            lineHeight: 1,
                            color: "#0f172a",
                          }}
                        >
                          {best.total_price.toLocaleString()}
                        </div>
                        <div
                          style={{
                            fontSize: "15px",
                            color: "#64748b",
                            marginTop: "-4px",
                          }}
                        >
                          ETB
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flight Details */}
                  {best && (
                    <div
                      className="d-flex align-items-center gap-3 flex-wrap mt-3"
                      style={{ fontSize: "14px" }}
                    >
                      {best.airline_logo && (
                        <img
                          src={best.airline_logo}
                          alt=""
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "4px",
                          }}
                        />
                      )}
                      <span className="fw-semibold text-dark">
                        {best.airline}
                      </span>

                      {best.flight_number && (
                        <span className="text-muted">
                          • {best.flight_number}
                        </span>
                      )}

                      <span className="text-muted">
                        {new Date(best.departure_date).toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          },
                        )}
                      </span>

                      <span
                        style={{
                          fontSize: "12.5px",
                          background: ac.color + "12",
                          color: ac.color,
                          padding: "4px 11px",
                          borderRadius: "6px",
                          fontWeight: 600,
                        }}
                      >
                        {best.agency_name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — Alternatives */}
            <div className="col-lg-5">
              {top3.length > 0 ? (
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    ALSO FROM
                  </div>
                  {top3.slice(0, 3).map((t, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center py-2"
                      style={{
                        borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ flex: 1 }}
                      >
                        <span
                          style={{
                            color: "#94a3b8",
                            width: "18px",
                            fontSize: "13px",
                          }}
                        >
                          {i + 1}.
                        </span>
                        {t.airline_logo && (
                          <img
                            src={t.airline_logo}
                            alt=""
                            style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "3px",
                            }}
                          />
                        )}
                        <span
                          className="fw-medium text-truncate"
                          style={{ fontSize: "13.5px" }}
                        >
                          {t.airline}
                        </span>
                      </div>
                      <span
                        className="fw-semibold"
                        style={{ fontSize: "14px" }}
                      >
                        {t.total_price.toLocaleString()} ETB
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="text-muted py-4 text-center"
                  style={{ fontSize: "13px" }}
                >
                  No alternative offers
                </div>
              )}
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
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {completed}/{total}
        </span>
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
  const [statusMsg, setStatusMsg] = useState("");
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
  const cancelledRef = useRef(false);
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
  useEffect(function () {
    (async function () {
      var today = new Date().toISOString().slice(0, 10);
      var key = "JED-" + today + "-1";
      try {
        var e = await getResult(key);
        if (e) {
          setResult(e.data);
          setFetchedAt(e.fetchedAt);
          setDataSource(e.fresh ? "fresh-idb" : "stale-idb");
          if (!e.fresh) {
            setIsStale(true);
            triggerBackgroundRefresh("JED", today, 1);
          }
          return;
        }
        var m = cacheGet("JED-" + today + "-1");
        if (m) {
          setResult(m);
          setDataSource("memory");
        }
      } catch (_) {}
    })();
  }, []);
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

  var handleSearch = async function () {
    if (!destination || !departureDate) return;
    cancelledRef.current = false;
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
      setStatusMsg("Fetching agencies...");
      var list = await fetchAgencies();
      if (cancelledRef.current) return;
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
            if (cancelledRef.current) return [];
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
        if (cancelledRef.current) break;
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
        setStatusMsg(
          "Checking " +
            Math.min(cc * AGENCIES_PER_BATCH, list.length) +
            " / " +
            list.length +
            " agencies...",
        );
        if (all.length)
          setLiveResult(optimise(all, new Date(departureDate), "price"));
      }
      if (cancelledRef.current) return;
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
      setStatusMsg("");
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  var displayResult = result || liveResult;
  var allTickets = displayResult?.all_tickets || [];
  var paginatedData = useMemo(
    function () {
      var start = (listPage - 1) * LIST_LIMIT;
      return allTickets.slice(start, start + LIST_LIMIT);
    },
    [allTickets, listPage],
  );

  // Auto-search when filters change
  useEffect(() => {
    if (destination && departureDate) {
      handleSearch();
    }
  }, [destination, departureDate, windowDays]);

  var displayResult = result || liveResult;
  var allTickets = displayResult?.all_tickets || [];
  var paginatedData = useMemo(() => {
    var start = (listPage - 1) * LIST_LIMIT;
    return allTickets.slice(start, start + LIST_LIMIT);
  }, [allTickets, listPage]);

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Ticket Optimiser</h2>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Compare prices across {agencies.length || "all"} travel agencies.
          </p>
          {/* Your existing badges remain the same */}
        </div>
      </div>

      {/* Filter Form */}
      <div className={"card shadow-sm mb-4 " + styles["filters-card"]}>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* Your filter columns remain exactly the same as last version */}
            <div className="col-md-3">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "12px" }}
              >
                Destination
              </label>
              <select
                className={"form-select " + styles.input}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                {airports.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "12px" }}
              >
                Departure Date
              </label>
              <input
                type="date"
                className={"form-control " + styles.input}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>

            <div className="col-md-3">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "12px" }}
              >
                Search Window
              </label>
              <select
                className={"form-select " + styles.input}
                value={windowDays}
                onChange={(e) => handleWindowChange(e.target.value)}
              >
                <option value={1}>Today Only (~1 min)</option>
                <option value={3}>3 Days (~4 min)</option>
                <option value={7}>7 Days (~8 min)</option>
                <option value={15}>15 Days (~15 min)</option>
              </select>
            </div>

            <div className="col-md-3 d-flex gap-2 align-items-end">
              <button
                type="button"
                className={"btn btn-main text-white " + styles["search-btn"]}
                onClick={handleSearch}
                disabled={loading}
                style={{ flex: 1, minWidth: "160px" }}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      style={{ width: "14px", height: "14px" }}
                    />
                    Searching...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2" />
                    Search Best Prices
                  </>
                )}
              </button>

              {loading && (
                <button
                  type="button"
                  className={styles["cancel-btn"]}
                  onClick={() => {
                    cancelledRef.current = true;
                    setLoading(false);
                    setStatusMsg("Cancelled");
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === ALL ALERTS IN MIDDLE (unchanged from previous) === */}
      {/* === ALL ALERTS / NOTIFICATIONS === (Moved here - Middle of page) */}
      {prefetchState.status === "running" && (
        <div
          className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3"
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            fontSize: "13px",
            color: "#1d4ed8",
          }}
        >
          <i
            className="bi bi-arrow-repeat"
            style={{ fontSize: "15px", animation: "spin 1.5s linear infinite" }}
          />
          <div>
            <strong>Background data is loading</strong> —{" "}
            {prefetchState.progress.routesDone.length > 0
              ? "Ready: " + prefetchState.progress.routesDone.join(", ") + ". "
              : ""}
            {prefetchState.progress.currentRoute
              ? "Loading: " + prefetchState.progress.currentRoute + "... "
              : ""}
            {prefetchState.progress.routesRemaining.length > 0 &&
              "Remaining: " + prefetchState.progress.routesRemaining.join(", ")}
          </div>
        </div>
      )}

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
            <strong>15-day search will take ~10-15 minutes</strong> with all 358
            agencies. Try "Today Only" first.
          </div>
        </div>
      )}

      {loading && progress.total > 0 && (
        <ProgressBar
          completed={progress.completed}
          total={progress.total}
          label={`Checking ${progress.checked} / ${agencies.length} agencies — ${progress.completed}/${progress.total} batches`}
        />
      )}

      {statusMsg && !loading && (
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
          {statusMsg}
        </div>
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

      {/* Results only shown if we have data */}
      {displayResult && (
        <>
          <div className="d-flex align-items-center gap-2 mb-3">
            {/* ... your existing header ... */}
          </div>

          <div className="row mb-4">
            <BestPriceCard
              windowDays={windowDays}
              bestPriceWindow={displayResult.windows}
              top3={displayResult.windows?.["15_day"]?.top_5 || []}
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
                    header: "Price",
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

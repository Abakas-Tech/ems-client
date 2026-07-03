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
        className="card border-0"
        style={{
          borderRadius: "14px",
          boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <div
          style={{
            height: "3px",
            background:
              "linear-gradient(90deg, " + ac.color + ", " + ac.color + "88)",
          }}
        />
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            {/* LEFT — route */}
            <div className="col-md-3">
              <div className="d-flex align-items-center gap-2">
                <span
                  style={{
                    width: "34px",
                    height: "34px",
                    borderRadius: "8px",
                    background: ac.color + "15",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i
                    className="bi bi-geo-alt-fill"
                    style={{ fontSize: "16px", color: ac.color }}
                  />
                </span>
                <div style={{ lineHeight: 1.3 }}>
                  <div
                    className="fw-bold text-dark"
                    style={{ fontSize: "13px" }}
                  >
                    ADD {"\u2192"} {p.destination || "???"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    <i
                      className={"bi " + ac.icon}
                      style={{ color: ac.color, marginRight: "3px" }}
                    />
                    {wl} · {count} tkt{count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* CENTER — price + flight */}
            <div className="col-md-5">
              {best ? (
                <div>
                  <div className="d-flex align-items-baseline gap-1 mb-1">
                    <span
                      className="fw-bold"
                      style={{
                        fontSize: "28px",
                        color: "#0f172a",
                        lineHeight: 1,
                      }}
                    >
                      {best.total_price.toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: "#64748b",
                      }}
                    >
                      ETB
                    </span>
                  </div>
                  <div
                    className="d-flex flex-wrap align-items-center gap-2"
                    style={{ fontSize: "12px" }}
                  >
                    {best.airline_logo && (
                      <img
                        src={best.airline_logo}
                        alt=""
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "3px",
                        }}
                      />
                    )}
                    <span className="fw-medium text-dark">{best.airline}</span>
                    {best.flight_number && (
                      <>
                        <span style={{ color: "#cbd5e1" }}>·</span>
                        <span style={{ color: "#64748b" }}>
                          {best.flight_number}
                        </span>
                      </>
                    )}
                    <span style={{ color: "#cbd5e1" }}>·</span>
                    <span style={{ color: "#64748b" }}>
                      {new Date(best.departure_date).toLocaleDateString(
                        "en-GB",
                        { weekday: "short", day: "numeric", month: "short" },
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        background: ac.color + "12",
                        color: ac.color,
                        padding: "2px 7px",
                        borderRadius: "5px",
                        fontWeight: 500,
                      }}
                    >
                      {best.agency_name}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="placeholder-glow">
                  <span
                    className="placeholder col-8"
                    style={{
                      height: "22px",
                      borderRadius: "6px",
                      display: "block",
                    }}
                  />
                  <span
                    className="placeholder col-5 mt-1"
                    style={{
                      height: "11px",
                      borderRadius: "4px",
                      display: "block",
                    }}
                  />
                </div>
              )}
            </div>

            {/* RIGHT — alternatives list */}
            <div className="col-md-4">
              {top3.length > 0 ? (
                <div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                      fontWeight: 600,
                      marginBottom: "2px",
                    }}
                  >
                    Also from
                  </div>
                  {top3.slice(0, 3).map((t, i) => (
                    <div
                      key={t.id}
                      className="d-flex align-items-center justify-content-between py-1"
                      style={{
                        borderBottom: i < 2 ? "1px solid #f1f5f9" : "none",
                      }}
                    >
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <span
                          style={{
                            color: "#94a3b8",
                            fontWeight: 600,
                            fontSize: "11px",
                            width: "14px",
                          }}
                        >
                          {i + 1}.
                        </span>
                        {t.airline_logo && (
                          <img
                            src={t.airline_logo}
                            alt=""
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "3px",
                            }}
                          />
                        )}
                        <span
                          className="fw-medium text-truncate"
                          style={{ fontSize: "12px" }}
                        >
                          {t.airline}
                        </span>
                      </div>
                      <span
                        className="fw-semibold ms-2"
                        style={{ whiteSpace: "nowrap", fontSize: "12px" }}
                      >
                        {t.total_price.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  No alternatives
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
  const [departureDate, setDepartureDate] = useState(function () {
    return new Date().toISOString().slice(0, 10);
  });
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
  const [prefetchState, setPrefetchState] = useState(function () {
    return getPrefetchStatus();
  });
  const cancelledRef = useRef(false);
  const backgroundRefreshRef = useRef(false);

  var airports = [
    { value: "JED", label: "Jeddah (JED)" },
    { value: "RUH", label: "Riyadh (RUH)" },
    { value: "DMM", label: "Dammam (DMM)" },
    { value: "MED", label: "Medina (MED)" },
  ];

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

  return (
    <div>
      {prefetchState.status === "running" && (
        <div
          className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3"
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            fontSize: "13px",
            color: "#1d4ed8",
          }}
        >
          <i
            className="bi bi-arrow-repeat"
            style={{ fontSize: "15px", animation: "spin 1.5s linear infinite" }}
          />
          <div>
            <strong>Background data is loading</strong>
            {" — "}
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
              borderRadius: "10px",
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

      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Ticket Optimiser</h2>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Compare prices across {agencies.length || "all"} travel agencies.
          </p>
          {dataSource === "fresh-idb" && (
            <span
              style={{
                fontSize: "11px",
                background: "#d1fae5",
                color: "#065f46",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              ⚡ Pre-fetched
            </span>
          )}
          {dataSource === "stale-idb" && (
            <span
              style={{
                fontSize: "11px",
                background: "#fef9c3",
                color: "#92400e",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              {refreshing ? "🔄 Refreshing..." : "⏳ Refreshing soon..."}
            </span>
          )}
          {dataSource === "memory" && (
            <span
              style={{
                fontSize: "11px",
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              📋 Recent search
            </span>
          )}
          {dataSource === "live" && !loading && (
            <span
              style={{
                fontSize: "11px",
                background: "#eff6ff",
                color: "#1d4ed8",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              🔍 Live results
            </span>
          )}
        </div>
      </div>

      <div className={"card shadow-sm mb-4 " + styles["filters-card"]}>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-2">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "12px" }}
              >
                Destination
              </label>
              <select
                className={"form-select " + styles.input}
                value={destination}
                onChange={function (e) {
                  setDestination(e.target.value);
                }}
              >
                {airports.map(function (o) {
                  return (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-md-2">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "12px" }}
              >
                Date
              </label>
              <input
                type="date"
                className={"form-control " + styles.input}
                value={departureDate}
                onChange={function (e) {
                  setDepartureDate(e.target.value);
                }}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="col-md-2">
              <label
                className="form-label fw-semibold mb-1"
                style={{ fontSize: "12px" }}
              >
                Window
              </label>
              <select
                className={"form-select " + styles.input}
                value={windowDays}
                onChange={function (e) {
                  handleWindowChange(e.target.value);
                }}
              >
                <option value={1}>Today Only (~1 min)</option>
                <option value={3}>3 Days (~4 min)</option>
                <option value={7}>7 Days (~8 min)</option>
                <option value={15}>15 Days (~15 min)</option>
              </select>
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button
                type="button"
                className={"btn btn-main text-white " + styles["search-btn"]}
                onClick={handleSearch}
                disabled={loading}
                style={{ flex: 1, minWidth: "180px" }}
              >
                {loading ? (
                  <>
                    <button
                      type="button"
                      className={
                        "btn btn-main text-white " + styles["search-btn"]
                      }
                      style={{ flex: 1, minWidth: "180px" }}
                    >
                      Searching...
                    </button>
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

      {show15Warning && !loading && (
        <div
          className="d-flex align-items-start gap-2 mb-3 p-3 rounded-3"
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "10px",
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
          label={
            "Checking " +
            progress.checked +
            " / " +
            agencies.length +
            " agencies — " +
            progress.completed +
            "/" +
            progress.total +
            " batches"
          }
        />
      )}

      {statusMsg && !loading && (
        <div
          className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3"
          style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
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
            borderRadius: "10px",
            color: "#991b1b",
            fontSize: "13px",
          }}
        >
          <i className="bi bi-exclamation-triangle" />
          {error}
        </div>
      )}

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
                ? allTickets.length + " tickets | more..."
                : allTickets.length + " tickets"}
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
                {isStale && !refreshing && "Stale — "}
                {refreshing ? "Refreshing..." : formatFetchedAt(fetchedAt)}
              </span>
            )}
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
                    render: function (row) {
                      return (
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
                      );
                    },
                  },
                  { header: "Flight", accessor: "flight_number" },
                  {
                    header: "Date",
                    render: function (row) {
                      return new Date(row.departure_date).toLocaleDateString(
                        "en-GB",
                        { day: "2-digit", month: "short" },
                      );
                    },
                  },
                  {
                    header: "Price (ETB)",
                    render: function (row) {
                      return (
                        <span className="fw-semibold">
                          {row.total_price?.toLocaleString()}
                        </span>
                      );
                    },
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
                onPageChange={function (p) {
                  setListPage(p);
                }}
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

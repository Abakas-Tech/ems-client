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

// The number of alternative offers displayed by the best-price card.
const ALT_LIST_LIMIT = 10;

const WINDOW_ESTIMATED_MS = {
  1: 60 * 1000,
  3: 4 * 60 * 1000,
  7: 8 * 60 * 1000,
  15: 15 * 60 * 1000,
};

function getDateLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const difference = (target - today) / 86400000;

  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";
  if (difference === -1) return "Yesterday";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function getWindowLabel(days, departureDate) {
  if (days === 1) return getDateLabel(departureDate);

  const start = getDateLabel(departureDate);
  const endDate = new Date(departureDate);
  endDate.setDate(endDate.getDate() + days - 1);

  const end = getDateLabel(endDate.toISOString().slice(0, 10));
  return `${start} – ${end}`;
}

// ────────────────────────────────────────────
// Best-Price Card
// ────────────────────────────────────────────

const BestPriceCard = function (props) {
  const availableWindows = [
    { key: "3_day", ...WINDOWS["3_day"] },
    { key: "7_day", ...WINDOWS["7_day"] },
    { key: "15_day", ...WINDOWS["15_day"] },
  ];

  const activeConfig =
    availableWindows.find(
      (windowConfig) => windowConfig.days >= (props.windowDays || 1),
    ) || availableWindows[0];

  const best = props.bestPriceWindow?.[activeConfig.key]?.best;
  const count = props.bestPriceWindow?.[activeConfig.key]?.count || 0;
  const windowLabel = getWindowLabel(
    props.windowDays || 1,
    props.departureDate,
  );

  const topAlternatives = (
    props.bestPriceWindow?.[activeConfig.key]?.top_5 || []
  ).slice(0, ALT_LIST_LIMIT);

  const Perforation = ({ className = "" }) => (
    <div
      className={className}
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

  return (
    <div className="col-12">
      <style>{`
        .best-price-card-layout {
          flex-wrap: nowrap !important;
          overflow-x: auto;
        }

        .best-price-card-alternatives {
          margin-left: auto;
          flex-shrink: 0;
        }

        @media (max-width: 767.98px) {
          .best-price-card-layout {
            flex-wrap: wrap !important;
            overflow-x: visible;
          }

          .best-price-card-alternatives {
            flex-basis: 100%;
            width: 100%;
            margin-left: 0;
          }

          .best-price-card-alt-divider {
            display: none;
          }
        }
      `}</style>

      <div
        className="best-price-card-layout"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "22px",
          padding: "18px 24px 18px 20px",
          borderRadius: "16px",
          borderTop: "1px solid #eef1f5",
          borderRight: "1px solid #eef1f5",
          borderBottom: "1px solid #eef1f5",
          borderLeft: `4px solid ${activeConfig.color}`,
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
              background: `${activeConfig.color}14`,
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
                color: activeConfig.color,
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
              {props.destination || "???"}
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
              <i
                className={`bi ${activeConfig.icon}`}
                style={{ color: activeConfig.color }}
              />
              <span>
                {windowLabel} · {count} ticket{count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <Perforation />

        {/* Best price */}
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
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: activeConfig.color,
                }}
              />

              <div
                style={{
                  fontSize: "10px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  color: activeConfig.color,
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
              className="best-price-card-details"
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
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "5px",
                  }}
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
                  color: activeConfig.color,
                  background: `${activeConfig.color}12`,
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
            className="best-price-card-details"
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
                background: activeConfig.color,
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

        {/* Alternatives stay at the far right on desktop. */}
        {topAlternatives.length > 0 && (
          <>
            <Perforation className="best-price-card-alt-divider" />

            <div
              className="best-price-card-alternatives"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
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
                {topAlternatives.map((ticket, index) => (
                  <div
                    key={`${ticket.airline || "airline"}-${
                      ticket.flight_number || index
                    }-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      padding: "4px 0",
                      borderBottom:
                        index < topAlternatives.length - 1
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
                          background: `${activeConfig.color}16`,
                          color: activeConfig.color,
                          fontWeight: 700,
                          fontSize: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </span>

                      {ticket.airline_logo && (
                        <img
                          src={ticket.airline_logo}
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
                        {ticket.airline}
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
                      {ticket.total_price.toLocaleString()}
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
                ))}
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
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between mb-1">
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>
          {label}
        </span>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {percentage}%
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
            width: `${percentage}%`,
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
// Route status pill
// ────────────────────────────────────────────

const routePillTone = {
  done: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  loading: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  pending: { bg: "#f8fafc", color: "#94a3b8", border: "#e2e8f0" },
};

const RoutePill = ({ route, tone }) => {
  const colors = routePillTone[tone];

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
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
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
  const [fakeProgress, setFakeProgress] = useState(0);
  const [show15Warning, setShow15Warning] = useState(false);
  const [dataSource, setDataSource] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [listPage, setListPage] = useState(1);
  const [prefetchState, setPrefetchState] = useState(() => getPrefetchStatus());

  const requestIdRef = useRef(0);
  const backgroundRefreshRef = useRef(false);
  const fakeProgressTimerRef = useRef(null);
  const fakeProgressStartRef = useRef(null);
  const fakeProgressWindowRef = useRef(windowDays);

  const airports = [
    { value: "JED", label: "Jeddah (JED)" },
    { value: "RUH", label: "Riyadh (RUH)" },
    { value: "DMM", label: "Dammam (DMM)" },
    { value: "MED", label: "Medina (MED)" },
  ];

  useEffect(() => {
    return onPrefetchUpdate((state) => {
      setPrefetchState(state);
    });
  }, []);

  useEffect(() => {
    if (loading) {
      fakeProgressWindowRef.current = windowDays;
      fakeProgressStartRef.current = Date.now();
      setFakeProgress(4);

      const estimatedMs =
        WINDOW_ESTIMATED_MS[fakeProgressWindowRef.current] ||
        WINDOW_ESTIMATED_MS[1];
      const tau = estimatedMs / 3;

      fakeProgressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - fakeProgressStartRef.current;
        const percentage = 100 * (1 - Math.exp(-elapsed / tau));
        setFakeProgress(Math.min(percentage, 97));
      }, 150);
    } else {
      clearInterval(fakeProgressTimerRef.current);
      setFakeProgress(0);
    }

    return () => clearInterval(fakeProgressTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const triggerBackgroundRefresh = async (dest, date, days) => {
    if (backgroundRefreshRef.current) return;

    backgroundRefreshRef.current = true;
    setRefreshing(true);

    try {
      const agencyList = await fetchAgencies();
      const batches = [];

      for (
        let index = 0;
        index < agencyList.length;
        index += AGENCIES_PER_BATCH
      ) {
        batches.push(agencyList.slice(index, index + AGENCIES_PER_BATCH));
      }

      let all = [];

      for (
        let roundIndex = 0;
        roundIndex < batches.length;
        roundIndex += MAX_CONCURRENT
      ) {
        const tasks = batches
          .slice(roundIndex, roundIndex + MAX_CONCURRENT)
          .map((batch) => async () => {
            try {
              return normaliseResults(
                await fetchFlightData(
                  buildMegaQuery(batch, dest, date, 1, CONTRACT_ID),
                ),
                batch,
                [date],
              );
            } catch {
              return [];
            }
          });

        const settled = await Promise.allSettled(tasks.map((task) => task()));

        settled.forEach((item) => {
          if (item.status === "fulfilled" && Array.isArray(item.value)) {
            all = all.concat(item.value);
          }
        });
      }

      if (all.length) {
        const finalResult = optimise(all, new Date(date), "price");
        const key = `${dest}-${date}-${days}`;

        cacheSet(key, finalResult, CACHE_TTL_MS);
        await saveResult(key, finalResult, CACHE_TTL_MS);

        if (dest === destination && date === departureDate) {
          setResult(finalResult);
          setDataSource("fresh-idb");
          setFetchedAt(Date.now());
          setIsStale(false);
        }
      }
    } catch (refreshError) {
      console.warn("Bg refresh:", refreshError.message);
    } finally {
      backgroundRefreshRef.current = false;
      setRefreshing(false);
    }
  };

  const handleWindowChange = (value) => {
    const days = Number(value);
    setWindowDays(days);
    setShow15Warning(days === 15);
  };

  const handleCancel = () => {
    requestIdRef.current += 1;
    setLoading(false);
  };

  const handleSearch = async () => {
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
      const key = `${destination}-${departureDate}-${windowDays}`;
      const storedResult = await getResult(key);

      if (requestId !== requestIdRef.current) return;

      if (storedResult) {
        setResult(storedResult.data);
        setFetchedAt(storedResult.fetchedAt);
        setDataSource(storedResult.fresh ? "fresh-idb" : "stale-idb");
        setLoading(false);

        if (!storedResult.fresh) {
          setIsStale(true);
          triggerBackgroundRefresh(destination, departureDate, windowDays);
        }
        return;
      }

      const memoryResult = cacheGet(key);

      if (memoryResult) {
        setResult(memoryResult);
        setDataSource("memory");
        setFetchedAt(Date.now());
        setLoading(false);
        return;
      }

      setDataSource("live");
      const agencyList = await fetchAgencies();

      if (requestId !== requestIdRef.current) return;
      setAgencies(agencyList);

      const dates = [];
      for (let index = 0; index < windowDays; index += 1) {
        const date = new Date(departureDate);
        date.setDate(date.getDate() + index);
        dates.push(date.toISOString().slice(0, 10));
      }

      const batches = [];
      for (
        let index = 0;
        index < agencyList.length;
        index += AGENCIES_PER_BATCH
      ) {
        batches.push(agencyList.slice(index, index + AGENCIES_PER_BATCH));
      }

      const tasks = [];
      dates.forEach((date) => {
        batches.forEach((batch) => {
          tasks.push(async () => {
            if (requestId !== requestIdRef.current) return [];

            try {
              return normaliseResults(
                await fetchFlightData(
                  buildMegaQuery(batch, destination, date, 1, CONTRACT_ID),
                ),
                batch,
                [date],
              );
            } catch {
              return [];
            }
          });
        });
      });

      let all = [];

      for (let index = 0; index < tasks.length; index += MAX_CONCURRENT) {
        if (requestId !== requestIdRef.current) break;

        const round = await Promise.allSettled(
          tasks.slice(index, index + MAX_CONCURRENT).map((task) => task()),
        );

        round.forEach((item) => {
          if (item.status === "fulfilled" && Array.isArray(item.value)) {
            all = all.concat(item.value);
          }
        });

        if (all.length) {
          setLiveResult(optimise(all, new Date(departureDate), "price"));
        }
      }

      if (requestId !== requestIdRef.current) return;

      if (!all.length) {
        setError(`No flights found for ${destination} on ${departureDate}`);
        setLoading(false);
        return;
      }

      const finalResult = optimise(all, new Date(departureDate), "price");
      const now = Date.now();

      cacheSet(key, finalResult, CACHE_TTL_MS);

      try {
        await saveResult(key, finalResult, CACHE_TTL_MS);
      } catch {
        // IndexedDB failure should not prevent displaying live results.
      }

      setResult(finalResult);
      setLiveResult(finalResult);
      setFetchedAt(now);
      setDataSource("live");
    } catch (searchError) {
      if (requestId === requestIdRef.current) {
        setError(searchError.message || "Error");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (destination && departureDate) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, departureDate, windowDays]);

  const displayResult = result || liveResult;
  const rawTickets = displayResult?.all_tickets || [];

  const allTickets = useMemo(() => {
    return [...rawTickets].sort((first, second) => {
      const firstPrice = Number.isFinite(first?.total_price)
        ? first.total_price
        : Infinity;
      const secondPrice = Number.isFinite(second?.total_price)
        ? second.total_price
        : Infinity;

      return firstPrice - secondPrice;
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
            Compare prices across {agencies.length || "all"} travel agencies.
          </p>
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

      {prefetchState.status === "running" &&
        (() => {
          const doneRoutes = prefetchState.progress.routesDone || [];
          const currentRoute = prefetchState.progress.currentRoute;
          const remainingRoutes = (
            prefetchState.progress.routesRemaining || []
          ).filter((route) => route !== currentRoute);

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
                  {doneRoutes.map((route) => (
                    <RoutePill key={route} route={route} tone="done" />
                  ))}
                  {currentRoute && (
                    <RoutePill route={currentRoute} tone="loading" />
                  )}
                  {remainingRoutes.map((route) => (
                    <RoutePill key={route} route={route} tone="pending" />
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
            , so it can take 10–15 minutes. Try a single day first if you are
            not sure yet.
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
                ? `${allTickets.length} tickets found so far`
                : `${allTickets.length} tickets found`}
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
                onPageChange={(page) => setListPage(page)}
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

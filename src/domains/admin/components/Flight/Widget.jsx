/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import {
  FaPlane,
  FaChevronDown,
  FaChevronUp,
  FaSyncAlt,
  FaSearch,
  FaTrophy,
} from "react-icons/fa";
import { scanDatePrice } from "../../api/flight.api";
import useResponse from "../../../../context/Response/useResponse";

//brands and colors
const BRAND = "#47BCD2";
const BRAND_DARK = "#2d9ab5";
const BRAND_LIGHT = "#e8f8fb";
const BRAND_MID = "#b3e6ef";

// Destination config
// eslint-disable-next-line react-refresh/only-export-components
export const WIDGET_DESTINATIONS = [
  { code: "JED", name: "Jeddah", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "RUH", name: "Riyadh", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "MED", name: "Madinah", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "DXB", name: "Dubai", country: "UAE", flag: "🇦🇪" },
  { code: "AUH", name: "Abu Dhabi", country: "UAE", flag: "🇦🇪" },
  { code: "SHJ", name: "Sharjah", country: "UAE", flag: "🇦🇪" },
  { code: "DOH", name: "Doha", country: "Qatar", flag: "🇶🇦" },
  { code: "KWI", name: "Kuwait City", country: "Kuwait", flag: "🇰🇼" },
  { code: "BAH", name: "Bahrain", country: "Bahrain", flag: "🇧🇭" },
  { code: "MCT", name: "Muscat", country: "Oman", flag: "🇴🇲" },
  { code: "AMM", name: "Amman", country: "Jordan", flag: "🇯🇴" },
  { code: "CAI", name: "Cairo", country: "Egypt", flag: "🇪🇬" },
  { code: "IST", name: "Istanbul", country: "Turkey", flag: "🇹🇷" },
  { code: "KRT", name: "Khartoum", country: "Sudan", flag: "🇸🇩" },
  { code: "BEY", name: "Beirut", country: "Lebanon", flag: "🇱🇧" },
];

const DEST_BY_CODE = Object.fromEntries(
  WIDGET_DESTINATIONS.map((d) => [d.code, d]),
);

const DEST_GROUPED = WIDGET_DESTINATIONS.reduce((acc, d) => {
  (acc[d.country] = acc[d.country] || []).push(d);
  return acc;
}, {});

// date utils
const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

const toISODate = (date) => date.toISOString().split("T")[0];

const daysFromNow = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
};

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const todayStr = toISODate(new Date());
  const tomorrowStr = toISODate(addDays(new Date(), 1));
  return {
    dayFull: DAY_FULL[d.getDay()],
    date: d.getDate(),
    month: MONTH_ABBR[d.getMonth()],
    isToday: dateStr === todayStr,
    isTomorrow: dateStr === tomorrowStr,
  };
};

// rank badges
const RANKS = [
  { bg: "#fef9c3", border: "#fbbf24" },
  { bg: "#f1f5f9", border: "#94a3b8" },
  { bg: "#fef3c7", border: "#f59e0b" },
];

// component
const Widget = ({ agencies, onPickDate }) => {
  const { addMessage } = useResponse();

  const [collapsed, setCollapsed] = useState(false);
  const [destCode, setDestCode] = useState("JED");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const abortRef = useRef(false);

  const destInfo = DEST_BY_CODE[destCode] || {
    code: destCode,
    name: destCode,
    flag: "✈️",
  };

  useEffect(() => {
    if (!agencies?.length) return;
    setSelectedDate(null);
    runScan(destCode);
    return () => {
      abortRef.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destCode, agencies]);

  const runScan = async (destination) => {
    const agencyId = agencies[0]?.labour_id;
    if (!agencyId) {
      addMessage(false, "No travel agency available.");
      return;
    }

    abortRef.current = false;
    setScanning(true);
    setResults([]);
    setScanProgress(0);
    setSelectedDate(null);

    const today = new Date();
    const dayResults = [];

    for (let i = 0; i < 7; i++) {
      if (abortRef.current) break;
      if (i > 0) await new Promise((r) => setTimeout(r, 800));
      if (abortRef.current) break;

      const dateStr = toISODate(addDays(today, i));

      try {
        const result = await scanDatePrice({
          destination,
          departureDate: dateStr,
          travelAgency: agencyId,
        });
        if (result) dayResults.push({ date: dateStr, ...result });
      } catch (_) {
        // silently skip failed days
      }

      setScanProgress(i + 1);
    }

    if (!abortRef.current) {
      const sorted = [...dayResults].sort((a, b) => a.minPrice - b.minPrice);
      setResults(sorted);
      setScanning(false);
      if (sorted.length > 0) setSelectedDate(sorted[0].date);
    }
  };

  const handlePickDate = (r) => {
    setSelectedDate(r.date);
    onPickDate?.({ date: r.date, destination: destCode });
  };

  const top3 = results.slice(0, 3);

  return (
    <div className="card border-0 rounded-4 overflow-hidden shadow-sm">
      <div
        className="card-header d-flex align-items-center gap-2 py-3 px-3"
        style={{
          background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND} 100%)`,
          cursor: "pointer",
        }}
        onClick={() => setCollapsed((c) => !c)}
        role="button"
        aria-expanded={!collapsed}
      >
        <FaPlane className="text-white" size={15} />

        <div className="flex-grow-1">
          <div className="fw-bold text-white" style={{ fontSize: 14 }}>
            Flight Deals
          </div>
          <div
            className="text-white"
            style={{ fontSize: 10, letterSpacing: ".04em" }}
          >
            Best departure dates
          </div>
        </div>

        {!collapsed && results.length > 0 && (
          <span
            className="badge rounded-pill me-1 text-white d-flex align-items-center gap-1"
            style={{
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {results[0].currency} {results[0].minPrice.toLocaleString()}
          </span>
        )}

        {collapsed ? (
          <FaChevronDown size={12} className="text-white-50" />
        ) : (
          <FaChevronUp size={12} className="text-white-50" />
        )}
      </div>

      {!collapsed && (
        <div className="card-body p-0">
          {/* Route bar */}
          <div
            className="d-flex align-items-center gap-2 px-3 py-2 border-bottom"
            style={{ background: BRAND_LIGHT }}
          >
            <div className="d-flex align-items-center gap-1 flex-grow-1">
              <span className="text-muted" style={{ fontSize: 10 }}>
                Addis Ababa
              </span>
            </div>

            <FaPlane size={12} style={{ color: BRAND, flexShrink: 0 }} />

            <div className="d-flex align-items-center gap-1 justify-content-end flex-grow-1">
              <span
                className="text-muted"
                style={{
                  fontSize: 10,
                  maxWidth: 70,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {destInfo.name}
              </span>
            </div>
          </div>

          {/* Destination selector */}
          <div className="d-flex align-items-center gap-2 px-3 py-2 border-bottom">
            <FaPlane size={11} style={{ color: BRAND, flexShrink: 0 }} />
            <label
              className="text-muted fw-semibold mb-0 text-nowrap"
              style={{ fontSize: 11 }}
            >
              Fly to
            </label>
            <select
              className="form-select form-select-sm"
              style={{
                fontSize: 12,
                fontWeight: 500,
                background: BRAND_LIGHT,
                borderColor: BRAND_MID,
              }}
              value={destCode}
              onChange={(e) => setDestCode(e.target.value)}
            >
              {Object.entries(DEST_GROUPED).map(([country, dests]) => (
                <optgroup key={country} label={country}>
                  {dests.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Scan progress */}
          {scanning && (
            <div className="px-3 py-2 border-bottom">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <small className="fw-semibold" style={{ color: BRAND }}>
                  Scanning prices…
                </small>
                <small className="text-muted">{scanProgress} / 7 days</small>
              </div>
              <div className="progress mb-2" style={{ height: 4 }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${(scanProgress / 7) * 100}%`,
                    background: `linear-gradient(90deg, ${BRAND_DARK}, ${BRAND})`,
                    transition: "width .5s ease",
                  }}
                />
              </div>
              <div className="d-flex gap-2 justify-content-center">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-circle"
                    style={{
                      width: 7,
                      height: 7,
                      background: i < scanProgress ? BRAND : BRAND_MID,
                      transition: "background .3s",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {!scanning && top3.length > 0 && (
            <div className="px-3 pt-3 pb-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span
                  className="fw-bold d-flex align-items-center gap-1"
                  style={{ fontSize: 12 }}
                >
                  Best Dates to Fly
                </span>
                <span
                  className="fw-semibold"
                  style={{ fontSize: 11, color: BRAND }}
                >
                  {destInfo.name}
                </span>
              </div>

              {top3.map((r, idx) => {
                const df = formatDate(r.date);
                const daysAway = daysFromNow(r.date);
                const label = df.isToday
                  ? "Today"
                  : df.isTomorrow
                    ? "Tomorrow"
                    : `in ${daysAway}d`;
                const isActive = selectedDate === r.date;
                const rs = RANKS[idx];

                return (
                  <button
                    key={r.date}
                    type="button"
                    onClick={() => handlePickDate(r)}
                    className="btn w-100 text-start mb-2 border rounded-3 d-flex align-items-start gap-2"
                    style={{
                      padding: "9px 11px",
                      background: isActive
                        ? BRAND
                        : idx === 0
                          ? BRAND_LIGHT
                          : "#f8fafb",
                      borderColor: isActive
                        ? BRAND
                        : idx === 0
                          ? BRAND_MID
                          : "#e2eaec",
                      boxShadow: isActive ? `0 4px 14px ${BRAND}55` : "none",
                      transition: "all .15s",
                      height: "6rem",
                    }}
                  >
                    {/* Info */}
                    <div className="flex-grow-1 min-w-0 px-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span
                          className="fw-bold"
                          style={{
                            fontSize: 13,
                            color: isActive ? "#fff" : "#0f172a",
                          }}
                        >
                          {df.dayFull}
                        </span>
                        <span
                          className="badge rounded-pill ms-1"
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            background: isActive
                              ? "rgba(255,255,255,.22)"
                              : BRAND_LIGHT,
                            color: isActive ? "#fff" : BRAND_DARK,
                          }}
                        >
                          {label}
                        </span>
                      </div>

                      <div className="d-flex align-items-center gap-2 mt-1">
                        <small
                          style={{
                            color: isActive
                              ? "rgba(255,255,255,.75)"
                              : "#64748b",
                            fontSize: 11,
                          }}
                        >
                          {df.date} {df.month} · {r.date}
                        </small>
                        {r.flightCount > 0 && (
                          <span
                            className="badge rounded-pill"
                            style={{
                              fontSize: 9,
                              background: isActive
                                ? "rgba(255,255,255,.15)"
                                : "#f1f5f9",
                              color: isActive
                                ? "rgba(255,255,255,.8)"
                                : "#94a3b8",
                            }}
                          >
                            {r.flightCount} flt{r.flightCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {r.carrierName && (
                        <div className="d-flex align-items-center gap-1 mt-1">
                          {r.carrierLogo ? (
                            <img
                              src={r.carrierLogo}
                              alt={r.carrierName}
                              width={14}
                              height={14}
                              style={{
                                objectFit: "contain",
                              }}
                            />
                          ) : (
                            <FaPlane
                              size={10}
                              style={{
                                color: isActive
                                  ? "rgba(255,255,255,.6)"
                                  : BRAND,
                              }}
                            />
                          )}
                          <small
                            className="fw-semibold"
                            style={{
                              fontSize: 11,
                              color: isActive
                                ? "rgba(255,255,255,.9)"
                                : "#334155",
                            }}
                          >
                            {r.carrierName}
                          </small>
                          {r.carrierCode && (
                            <small
                              style={{
                                fontSize: 10,
                                color: isActive
                                  ? "rgba(255,255,255,.55)"
                                  : "#94a3b8",
                              }}
                            >
                              ({r.carrierCode})
                            </small>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-end flex-shrink-0">
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: ".06em",
                          textTransform: "uppercase",
                          color: isActive ? "rgba(255,255,255,.6)" : "#94a3b8",
                        }}
                      >
                        {r.currency}
                      </div>
                      <div
                        className="fw-bold"
                        style={{
                          fontSize: 15,
                          letterSpacing: "-.02em",
                          color: isActive ? "#fff" : BRAND_DARK,
                        }}
                      >
                        {r.minPrice.toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          marginTop: 2,
                          color: isActive ? "rgba(255,255,255,.6)" : BRAND,
                        }}
                      >
                        {isActive ? "Viewing ✓" : "Switch →"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!scanning && top3.length === 0 && (
            <div className="text-center py-4 px-3 text-muted">
              <FaSearch size={22} style={{ color: BRAND_MID }} />
              <div
                className="fw-semibold mt-2"
                style={{ fontSize: 13, color: "#475569" }}
              >
                No fares found for this route.
              </div>
              <small>Try a different destination</small>
            </div>
          )}

          {/* Footer */}
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top bg-light">
            {!scanning && (
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center gap-1 fw-bold"
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  color: BRAND_DARK,
                  background: BRAND_LIGHT,
                  border: `1.5px solid ${BRAND_MID}`,
                  borderRadius: 8,
                }}
                onClick={() => runScan(destCode)}
              >
                <FaSyncAlt size={10} />
                Refresh
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Widget;

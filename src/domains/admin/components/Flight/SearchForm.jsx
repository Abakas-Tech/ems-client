import { useState, useEffect } from "react";
import useResponse from "../../../../context/Response/useResponse";

const BRAND = "#47BCD2";
const BRAND_DARK = "#2d9ab5";
const BRAND_LIGHT = "#eafbfd";
const BRAND_MID = "#b3e6ef";

const destinations = [
  { code: "JED", name: "Jeddah", country: "Saudi Arabia" },
  { code: "RUH", name: "Riyadh", country: "Saudi Arabia" },
  { code: "MED", name: "Madinah", country: "Saudi Arabia" },
  { code: "DXB", name: "Dubai", country: "UAE" },
  { code: "AUH", name: "Abu Dhabi", country: "UAE" },
  { code: "SHJ", name: "Sharjah", country: "UAE" },
  { code: "DOH", name: "Doha", country: "Qatar" },
  { code: "KWI", name: "Kuwait City", country: "Kuwait" },
  { code: "BAH", name: "Bahrain", country: "Bahrain" },
  { code: "MCT", name: "Muscat", country: "Oman" },
  { code: "AMM", name: "Amman", country: "Jordan" },
  { code: "BEY", name: "Beirut", country: "Lebanon" },
  { code: "CAI", name: "Cairo", country: "Egypt" },
  { code: "IST", name: "Istanbul", country: "Turkey" },
  { code: "KRT", name: "Khartoum", country: "Sudan" },
];

const groupedDestinations = destinations.reduce((acc, dest) => {
  if (!acc[dest.country]) acc[dest.country] = [];
  acc[dest.country].push(dest);
  return acc;
}, {});

const INITIAL_FILTERS = {
  agency_id: "",
  destination: "",
  departure_date: "",
  return_date: "",
  trip_type: "one_way",
  passengers: "1",
  cabin_class: "economy",
};

const INPUT_HEIGHT = 38;

const SearchForm = ({ agencies = [], onSearch, initialFilters = {} }) => {
  const { addMessage } = useResponse();

  const [filters, setFilters] = useState({
    ...INITIAL_FILTERS,
    ...initialFilters,
  });

  useEffect(
    () => {
      if (initialFilters && Object.keys(initialFilters).length > 0) {
        setFilters((prev) => ({ ...prev, ...initialFilters }));
      }
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [
      initialFilters?.agency_id,
      initialFilters?.destination,
      initialFilters?.departure_date,
    ],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const setTripType = (type) => {
    setFilters((prev) => ({ ...prev, trip_type: type, return_date: "" }));
  };

  // Validate one field at a time, top to bottom — stop at first failure
  const validateSequential = () => {
    if (!filters.agency_id) {
      addMessage(false, "Please select a travel agency.");
      return false;
    }
    if (!filters.destination) {
      addMessage(false, "Please select a destination.");
      return false;
    }
    if (!filters.departure_date) {
      addMessage(false, "Please select a departure date.");
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(filters.departure_date) < today) {
      addMessage(false, "Departure date cannot be in the past.");
      return false;
    }
    if (
      filters.trip_type === "round_trip" &&
      filters.return_date &&
      filters.return_date <= filters.departure_date
    ) {
      addMessage(false, "Return date must be after the departure date.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSequential()) return;
    onSearch?.(filters);
  };

  const handleClear = () => {
    setFilters(INITIAL_FILTERS);
  };

  const inputStyle = { height: INPUT_HEIGHT, fontSize: 13, borderRadius: 8 };

  const labelStyle = {
    fontSize: 11,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    fontWeight: 600,
    marginBottom: 5,
    display: "block",
    color: "#64748b",
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
      {/* ── Header ── */}
      <div
        className="card-header d-flex align-items-center gap-2 py-3 px-4"
        style={{
          background: `linear-gradient(135deg, ${BRAND_DARK} 0%, ${BRAND} 100%)`,
          borderBottom: "none",
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center rounded-3"
          style={{
            width: 34,
            height: 34,
            background: "rgba(255,255,255,0.18)",
            flexShrink: 0,
          }}
        >
          <i className="bi bi-airplane text-white" style={{ fontSize: 15 }} />
        </div>
        <div className="flex-grow-1">
          <div className="fw-bold text-white" style={{ fontSize: 14 }}>
            Search Flights
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
            Find the best flights from Addis Ababa
          </div>
        </div>

        {/* Trip type pill toggle */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.15)",
            borderRadius: 20,
            padding: 3,
            gap: 2,
          }}
        >
          {["one_way", "round_trip"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTripType(type)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 14px",
                borderRadius: 16,
                border: "none",
                cursor: "pointer",
                transition: "all .15s",
                background: filters.trip_type === type ? "#fff" : "transparent",
                color:
                  filters.trip_type === type
                    ? BRAND_DARK
                    : "rgba(255,255,255,0.85)",
              }}
            >
              {type === "one_way" ? "One Way" : "Round Trip"}
            </button>
          ))}
        </div>
      </div>

      <div className="card-body p-4">
        <form onSubmit={handleSubmit} noValidate>
          {/* ── Row 1: Agency ── */}
          <div className="mb-3">
            <label style={labelStyle}>
              Travel Agency <span style={{ color: BRAND }}>*</span>
            </label>
            <select
              name="agency_id"
              value={filters.agency_id}
              onChange={handleChange}
              className="form-select"
              style={inputStyle}
            >
              <option value="">— Select agency —</option>
              {agencies.map((a) => (
                <option key={a.labour_id} value={a.labour_id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* ── Row 2: Route + Passengers + Class ── */}
          <div className="row g-2 mb-3 align-items-end">
            {/* From */}
            <div className="col">
              <label style={labelStyle}>From</label>
              <div
                className="d-flex align-items-center gap-1 border"
                style={{
                  ...inputStyle,
                  background: "#f8fafc",
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderColor: "#dee2e6",
                  color: "#64748b",
                }}
              >
                <i
                  className="bi bi-geo-alt-fill"
                  style={{ fontSize: 12, color: BRAND_MID }}
                />
                <span style={{ fontSize: 13 }}>Addis Ababa</span>
                <span
                  className="ms-1 fw-normal"
                  style={{
                    fontSize: 10,
                    background: BRAND_LIGHT,
                    color: BRAND_DARK,
                    borderRadius: 4,
                    padding: "1px 6px",
                  }}
                >
                  ADD
                </span>
              </div>
            </div>

            {/* Swap */}
            <div className="col-auto" style={{ paddingBottom: 2 }}>
              <div
                className="d-flex align-items-center justify-content-center border rounded-circle"
                style={{
                  width: 28,
                  height: 28,
                  background: BRAND_LIGHT,
                  borderColor: BRAND_MID,
                  color: BRAND,
                }}
              >
                <i
                  className="bi bi-arrow-left-right"
                  style={{ fontSize: 11 }}
                />
              </div>
            </div>

            {/* To */}
            <div className="col">
              <label style={labelStyle}>
                To <span style={{ color: BRAND }}>*</span>
              </label>
              <select
                name="destination"
                value={filters.destination}
                onChange={handleChange}
                className="form-select"
                style={inputStyle}
              >
                <option value="">— Select destination —</option>
                {Object.entries(groupedDestinations).map(([country, dests]) => (
                  <optgroup key={country} label={country}>
                    {dests.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.code} — {d.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Passengers */}
            <div className="col">
              <label style={labelStyle}>Passengers</label>
              <select
                name="passengers"
                value={filters.passengers}
                onChange={handleChange}
                className="form-select"
                style={inputStyle}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={String(n)}>
                    {n} Pax{n > 1 ? "." : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div className="col">
              <label style={labelStyle}>Class</label>
              <select
                name="cabin_class"
                value={filters.cabin_class}
                onChange={handleChange}
                className="form-select"
                style={inputStyle}
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>

          {/* ── Row 3: Dates + Actions ── */}
          <div className="row g-2 align-items-end">
            {/* Departure */}
            <div className="col">
              <label style={labelStyle}>
                Departure <span style={{ color: BRAND }}>*</span>
              </label>
              <input
                type="date"
                name="departure_date"
                value={filters.departure_date}
                onChange={handleChange}
                className="form-control"
                style={inputStyle}
              />
            </div>

            {/* Return (round trip only) */}
            {filters.trip_type === "round_trip" && (
              <div className="col">
                <label style={labelStyle}>Return</label>
                <input
                  type="date"
                  name="return_date"
                  value={filters.return_date}
                  onChange={handleChange}
                  className="form-control"
                  style={inputStyle}
                />
              </div>
            )}

            {/* Actions */}
            <div className="col-auto d-flex gap-2">
              <button
                type="button"
                onClick={handleClear}
                title="Clear"
                className="btn d-flex align-items-center justify-content-center"
                style={{
                  height: INPUT_HEIGHT,
                  width: INPUT_HEIGHT,
                  padding: 0,
                  borderRadius: 8,
                  border: `1.5px solid ${BRAND_MID}`,
                  background: BRAND_LIGHT,
                  color: BRAND_DARK,
                  flexShrink: 0,
                }}
              >
                <i className="bi bi-x-lg" style={{ fontSize: 14 }} />
              </button>
              <button
                type="submit"
                className="btn d-flex align-items-center gap-2 fw-semibold text-white"
                style={{
                  height: INPUT_HEIGHT,
                  fontSize: 13,
                  paddingLeft: 20,
                  paddingRight: 20,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${BRAND_DARK}, ${BRAND})`,
                  border: "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Search Flights
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;

import React from "react";
import styles from "./TicketFilter.module.css";

const TicketFilter = ({
  destination,
  setDestination,
  departureDate,
  setDepartureDate,
  windowDays,
  handleWindowChange,
  onSearch,
  onCancel,
  loading,
}) => {
  const airports = [
    { value: "JED", label: "Jeddah (JED)" },
    { value: "RUH", label: "Riyadh (RUH)" },
    { value: "DMM", label: "Dammam (DMM)" },
    { value: "MED", label: "Medina (MED)" },
  ];

  return (
    <div className={"card shadow-sm mb-4 " + styles["filters-card"]}>
      <div className="card-body">
        <div className="row g-3 align-items-end">
          {/* Destination */}
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
              disabled={loading}
            >
              {airports.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
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
              disabled={loading}
            />
          </div>

          {/* Window */}
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
              disabled={loading}
            >
              <option value={1}>Today Only (~1 min)</option>
              <option value={3}>3 Days (~4 min)</option>
              <option value={7}>7 Days (~8 min)</option>
              <option value={15}>15 Days (~15 min)</option>
            </select>
          </div>

          {/* Button Group */}
          <div className="col-md-3 d-flex gap-2 align-items-end">
            <button
              type="button"
              className={"btn btn-main text-white " + styles["search-btn"]}
              onClick={onSearch}
              disabled={loading}
              style={{ backgroundColor: "#47BCD2" }}
            >
              {loading ? (
                <span> Searching...</span>
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
                className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketFilter;

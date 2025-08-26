import React from "react";

const AppointmentsFilters = ({ filters, onChange }) => {
  return (
    <div className="card shadow-sm p-3 mb-4">
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Status</label>
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value)}
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="col-md-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={filters.startDate}
            onChange={(e) => onChange("startDate", e.target.value)}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={filters.endDate}
            onChange={(e) => onChange("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default AppointmentsFilters;

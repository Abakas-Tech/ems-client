import React from "react";
import styles from "../../workers/WorkerFilter/WorkerFilter.module.css";

const InvoiceFilters = ({ filters, onFilterChange, onClear }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search (invoice # or customer name) */}
          <div className="col-md-2">
            <input
              type="text"
              name="search"
              className={`form-control ${styles.input}`}
              placeholder="Search invoice # or customer"
              value={filters.search}
              onChange={onFilterChange}
            />
          </div>

          {/* Status */}
          <div className="col-md-2">
            <select
              name="status"
              className={`form-select ${styles.input}`}
              value={filters.status}
              onChange={onFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="issued">Issued</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment status (simple paid / not paid view) */}
          <div className="col-md-2">
            <select
              name="payment_status"
              className={`form-select ${styles.input}`}
              value={filters.payment_status}
              onChange={onFilterChange}
            >
              <option value="">Any Payment Status</option>
              <option value="paid">Paid</option>
              <option value="not_paid">Not Paid</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="col-md-2">
            <div className="input-group">
              <span className={`input-group-text bg-light ${styles.dateLabel}`}>
                From
              </span>
              <input
                type="date"
                name="date_from"
                className={`form-control ${styles.input}`}
                value={filters.date_from}
                onChange={onFilterChange}
              />
            </div>
          </div>

          {/* End Date */}
          <div className="col-md-2">
            <div className="input-group">
              <span className={`input-group-text bg-light ${styles.dateLabel}`}>
                To
              </span>
              <input
                type="date"
                name="date_to"
                className={`form-control ${styles.input}`}
                value={filters.date_to}
                onChange={onFilterChange}
              />
            </div>
          </div>

          {/* Clear */}
          <div className="col-md-2 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              onClick={onClear}
              disabled={
                !filters.search &&
                !filters.status &&
                !filters.payment_status &&
                !filters.date_from &&
                !filters.date_to
              }
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFilters;

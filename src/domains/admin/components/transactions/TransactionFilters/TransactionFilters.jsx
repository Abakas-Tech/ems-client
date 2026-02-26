import React from "react";
import styles from "./TransactionFilters.module.css"; // Using the same style logic

const TransactionFilters = ({ filters, onFilterChange, onClear }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Category Dropdown */}
          <div className="col-md-3">
            <select
              name="category"
              className={`form-select ${styles.input}`}
              value={filters.category}
              onChange={onFilterChange}
            >
              <option value="">All Categories</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="commission">Commission</option>
              <option value="vat">VAT</option>
            </select>
          </div>

          {/* Start Date with Label */}
          <div className="col-md-3">
            <div className="input-group">
              <span className={`input-group-text bg-light ${styles.dateLabel}`}>
                Start
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

          {/* End Date with Label */}
          <div className="col-md-3">
            <div className="input-group">
              <span className={`input-group-text bg-light ${styles.dateLabel}`}>
                End
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

          {/* Clear Button */}
          <div className="col-md-1 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles.clearBtn}`}
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;

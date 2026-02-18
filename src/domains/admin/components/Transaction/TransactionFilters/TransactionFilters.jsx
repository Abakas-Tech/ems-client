import React from "react";
import styles from "./FinanceFilters.module.css";

const FinanceFilters = ({ filters, onFilterChange, onClear }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          <div className="col-md-3">
            <select
              name="category"
              className="form-select"
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
          <div className="col-md-3">
            <input
              type="date"
              name="date_from"
              className="form-control"
              value={filters.date_from}
              onChange={onFilterChange}
              placeholder="Date From"
            />
          </div>
          <div className="col-md-3">
            <input
              type="date"
              name="date_to"
              className="form-control"
              value={filters.date_to}
              onChange={onFilterChange}
              placeholder="Date To"
            />
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button
              className="btn btn-outline-secondary w-100"
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

export default FinanceFilters;

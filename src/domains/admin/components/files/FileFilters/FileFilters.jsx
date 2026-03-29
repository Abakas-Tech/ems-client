import React from "react";
import styles from "./FileFilters.module.css"; // modular css

const FileFilters = ({ filters, onFilterChange, onClear }) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* File name search */}
          <div className="col-md-4">
            <input
              type="text"
              name="fileName"
              className={`form-control ${styles.input}`}
              placeholder="Search by File Name"
              value={filters.fileName}
              onChange={onFilterChange}
            />
          </div>

          {/* File type dropdown */}
          <div className="col-md-3">
            <select
              name="file_type"
              className={`form-select dropend  ${styles.input}`}
              value={filters.file_type}
              onChange={onFilterChange}
            >
              <option value="">All Types</option>
              <option value="Image">Image</option>
              <option value="PDF">PDF</option>
              <option value="Video">Video</option>
              <option value="Audio">Audio</option>
              <option value="Word">Word</option>
              <option value="Excel">Excel</option>
              <option value="txt">Text</option>
              <option value="JSON">JSON</option>
              <option value="CSV">CSV</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Category dropdown */}
          <div className="col-md-3">
            <select
              name="category"
              className={`form-select ${styles.input}`}
              value={filters.category}
              onChange={onFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Licenses">Licenses</option>
              <option value="agreement">Agreements</option>
              <option value="report">Reports</option>
              <option value="policy">Policies</option>
              <option value="CV">CVs</option>
              <option value="Contract">Contracts</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Clear button */}
          <div className="col-md-2 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              onClick={onClear}
              disabled={
                !filters.fileName && !filters.file_type && !filters.category
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

export default FileFilters;

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
              name="fileType"
              className={`form-select dropend  ${styles.input}`}
              value={filters.fileType}
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
              <option value="Contracts">Contracts</option>
              <option value="Photos">Photos</option>
              <option value="Floor Plans">Floor Plans</option>
              <option value="Reports">Reports</option>
              <option value="Marketing Materials">Marketing Materials</option>
              <option value="Correspondence">Correspondence</option>
            </select>
          </div>

          {/* Clear button */}
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

export default FileFilters;

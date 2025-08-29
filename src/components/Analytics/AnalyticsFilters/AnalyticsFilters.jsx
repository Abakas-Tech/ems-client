// src/components/Analytics/AnalyticsFilters/AnalyticsFilters.jsx
import PropTypes from "prop-types";
import styles from "./AnalyticsFilters.module.css";

const AnalyticsFilters = ({
  filters,
  onFilterChange,
  onDateChange,
  onClear,
}) => {
  return (
    <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
      <div className="card-body">
        <div className="row g-3 align-items-end">
          {/* Title Search */}
          <div className="col-md-3">
            <label htmlFor="title" className="form-label fw-semibold">
              Seach by Title
            </label>
            <input
              type="text"
              name="title"
              className={`form-control ${styles.input}`}
              placeholder="Enter Title"
              value={filters.title}
              onChange={onFilterChange}
            />
          </div>

          {/* Start Date */}
          <div className="col-md-3">
            <label htmlFor="startDate" className="form-label fw-semibold">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              className={`form-control ${styles.input}`}
              value={filters.startDate}
              onChange={onDateChange}
            />
          </div>

          {/* End Date */}
          <div className="col-md-3">
            <label htmlFor="endDate" className="form-label fw-semibold">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              className={`form-control ${styles.input}`}
              value={filters.endDate}
              onChange={onDateChange}
            />
          </div>

          {/* Sort By */}
          <div className="col-md-2">
            <label htmlFor="sortBy" className="form-label fw-semibold">
              Sort By
            </label>
            <select
              name="sortBy"
              className={`form-select ${styles.input}`}
              value={filters.sortBy}
              onChange={onFilterChange}
            >
              <option value="createdAt">Newest</option>
              <option value="viewCount">Most Viewed</option>
            </select>
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

AnalyticsFilters.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default AnalyticsFilters;

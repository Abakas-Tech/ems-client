import styles from "../../workers/WorkerFilter/WorkerFilter.module.css";

const FilterComplaint = ({ filters, onFilterChange, onClear }) => {
  const isDisabled = Object.values(filters).every((v) => !v);

  return (
    <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-md-5">
            <input
              type="text"
              name="search"
              className="form-control form-control-sm py-2"
              style={{ height: "42px" }}
              placeholder="Search employee or employer name"
              value={filters.search || ""}
              onChange={onFilterChange}
            />
          </div>

          {/* Status */}
          <div className="col-md-3">
            <select
              name="status"
              className={`form-select ${styles.input}`}
              style={{ height: "42px" }}
              value={filters.status || ""}
              onChange={onFilterChange}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Clear */}
          <div className="col-md-2 d-grid">
            <button
              type="button"
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              style={{ height: "42px" }}
              onClick={onClear}
              disabled={isDisabled}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterComplaint;

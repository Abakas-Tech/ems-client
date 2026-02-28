const FilterUser = ({ filters, onFilterChange, onClear }) => {
  const isDisabled = Object.values(filters).every((v) => !v);

  return (
    <div className="card shadow-sm mb-4 rounded-3 border border-light">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-md-4">
            <input
              type="text"
              name="search"
              className="form-control form-control-sm py-2"
              style={{ height: "42px" }}
              placeholder="Search name, email or phone"
              value={filters.search || ""}
              onChange={onFilterChange}
            />
          </div>

          {/* Role */}
          <div className="col-md-3">
            <select
              name="role_id"
              className="form-select form-select-sm py-2"
              style={{ height: "42px" }}
              value={filters.role_id || ""}
              onChange={onFilterChange}
            >
              <option value="">All Roles</option>
              <option value="2">Employee</option>
              <option value="3">Partner</option>
              <option value="5">Employer</option>
            </select>
          </div>

          {/* Status */}
          <div className="col-md-3">
            <select
              name="is_active"
              className="form-select form-select-sm py-2"
              style={{ height: "42px" }}
              value={filters.is_active || ""}
              onChange={onFilterChange}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Clear */}
          <div className="col-md-2 d-grid">
            <button
              type="button"
              className="btn btn-outline-secondary"
              style={{ height: "42px" }}
              onClick={onClear}
              disabled={isDisabled}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterUser;

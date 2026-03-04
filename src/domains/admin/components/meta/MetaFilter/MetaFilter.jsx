const MetaFilter = ({ filter = {}, onFilterChange, onClear }) => {
  const isDisabled = Object.values(filter).every((v) => !v);

  return (
    <div className="card shadow-sm mb-4 rounded-3 border border-light">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Search */}
          <div className="col-md-4">
            <input
              type="text"
              name="name"
              className="form-control form-control-sm py-2"
              style={{ height: "42px" }}
              placeholder="Search by name"
              value={filter.name || ""}
              onChange={onFilterChange}
            />
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

export default MetaFilter;

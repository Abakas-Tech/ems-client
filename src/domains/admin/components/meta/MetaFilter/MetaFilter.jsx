import styles from "../../workers/WorkerFilter/WorkerFilter.module.css";
const MetaFilter = ({ filter = {}, onFilterChange, onClear, extraField }) => {
  const isDisabled = Object.values(filter).every((v) => !v);

  // Determine input widths dynamically based on extraField
  const nameCol = extraField ? 5 : 10; // Name input
  const extraCol = extraField ? 5 : 0; // Extra field
  const buttonCol = 2; // Clear button

  return (
    <div className="card shadow-sm mb-4 rounded-3 border border pe-md-3">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* Name Search */}
          <div className={`col-12 col-md-${nameCol}`}>
            <input
              type="text"
              name="name"
              className="form-control form-control-sm py-2 rounded-2"
              style={{ height: "42px" }}
              placeholder="Search by name"
              value={filter.name || ""}
              onChange={onFilterChange}
            />
          </div>

          {/* Extra Field (optional) */}
          {extraField && extraField.type === "select" && (
            <div className={`col-12 col-md-${extraCol}`}>
              <select
                name={extraField.name}
                className="form-control form-control-sm py-2 rounded-2"
                style={{ height: "42px" }}
                value={filter[extraField.name] || ""}
                onChange={onFilterChange}
              >
                <option value="">Select {extraField.label}</option>
                {extraField.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Button */}
          <div className={`col-12 col-md-${buttonCol} d-grid`}>
            <button
              type="button"
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
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

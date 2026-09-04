import styles from "./AnalyticsFilter.module.css"; // Reuse your existing styling
import { MONTH_WEEKS } from "../../../../../utils/week.utils";

const AnalyticsFilters = ({ filters, onFilterChange, onClear, months }) => {
  // The week picker is meaningful only for the weekly period, and the
  // month picker applies to BOTH monthly and weekly (weeks live inside
  // a month); only the yearly summary hides it.
  const monthlyPickerDisabled = filters.period === "yearly";

  return (
    <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* View Type dropdown */}
          <div className="col-md-3">
            <select
              name="period"
              className={`form-select ${styles.input}`}
              value={filters.period}
              onChange={onFilterChange}
            >
              <option value="yearly">Yearly Summary</option>
              <option value="monthly">Monthly Summary</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>

          {/* Select Week - constant weeks 1-4 inside the month; only for
              the weekly period */}
          <div className="col-md-3">
            <select
              name="week"
              className={`form-select ${styles.input}`}
              disabled={filters.period !== "weekly"}
              value={filters.week}
              onChange={onFilterChange}
              style={{ opacity: filters.period !== "weekly" ? 0.5 : 1 }}
            >
              {MONTH_WEEKS.map((week) => (
                <option key={week.value} value={week.value}>
                  {week.label}
                </option>
              ))}
            </select>
          </div>

          {/* Select Month - used by monthly AND weekly periods */}
          <div className="col-md-2">
            <select
              name="month"
              className={`form-select ${styles.input}`}
              disabled={monthlyPickerDisabled}
              value={filters.month}
              onChange={onFilterChange}
              style={{ opacity: monthlyPickerDisabled ? 0.5 : 1 }}
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year Input */}
          <div className="col-md-2">
            <input
              type="number"
              name="year"
              className={`form-control ${styles.input}`}
              placeholder="Year"
              value={filters.year}
              onChange={onFilterChange}
            />
          </div>

          {/* Clear button */}
          <div className="col-md-2 d-grid">
            <button
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              onClick={onClear}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;

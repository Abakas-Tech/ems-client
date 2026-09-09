import React from "react";
import styles from "../../workers/WorkerFilter/WorkerFilter.module.css";

const LOGIN_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

const AUDIT_ACTIONS = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "status_change", label: "Status Change" },
];

const ActivityFilter = ({ type, filters, users, onFilterChange, onClear }) => {
  const handleChange = (field) => (e) => {
    onFilterChange({ [field]: e.target.value });
  };

  const isCleared = Object.values(filters).every((v) => !v);

  return (
    <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
      <div className="card-body">
        <div className="row g-3 align-items-center">
          {/* {type === "audit" && (
            <div className="col-md-4">
              <input
                type="text"
                name="search"
                className={`form-control ${styles.input}`}
                placeholder="Search audit messages"
                value={filters.search}
                onChange={handleChange("search")}
              />
            </div>
          )} */}

          <div className="col-md-3">
            <select
              className={`form-select ${styles.input}`}
              value={filters.person_id}
              onChange={handleChange("person_id")}
            >
              <option value="">
                {type === "login" ? "All Users" : "All Staff"}
              </option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>

          {type === "login" ? (
            <div className="col-md-3">
              <select
                className={`form-select ${styles.input}`}
                value={filters.status}
                onChange={handleChange("status")}
              >
                {LOGIN_STATUSES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="col-md-3">
              <select
                className={`form-select ${styles.input}`}
                value={filters.action}
                onChange={handleChange("action")}
              >
                {AUDIT_ACTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-md-2">
            <input
              type="date"
              className={`form-control ${styles.input}`}
              value={filters.from_date}
              onChange={handleChange("from_date")}
            />
          </div>

          <div className="col-md-2">
            <input
              type="date"
              className={`form-control ${styles.input}`}
              value={filters.to_date}
              onChange={handleChange("to_date")}
            />
          </div>

          <div className="col-md-2 d-grid ms-auto">
            <button
              type="button"
              className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
              onClick={onClear}
              disabled={isCleared}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityFilter;

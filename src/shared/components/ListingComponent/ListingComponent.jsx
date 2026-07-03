/* eslint-disable no-unused-vars */
import { useState } from "react";
import ActionButtons from "../ActionButtons/ActionButtons";
import BottomPagination from "../BottomPagination/BottomPagination";
import ProfileCell from "../ProfileCell/ProfileCell";
import styles from "./ListingComponent.module.css";

const ListingComponent = ({
  data = [],
  columns = [],
  actions = [],
  filtersComponent,
  emptyState,
  pagination,
  onPageChange,
  showAvater = false,
  fewColumns = false,
  isSelectionMode = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  onRowDoubleClick,
  showCount = true,
}) => {
  const [editing, setEditing] = useState({ rowId: null, accessor: null });
  const [tempValue, setTempValue] = useState("");
  const [pendingRenameHandler, setPendingRenameHandler] = useState(null);

  const startRename = (row, accessor, actionHandler) => {
    setEditing({ rowId: row.id, accessor });
    setTempValue(row[accessor]);
    setPendingRenameHandler(() => actionHandler);
  };

  const cancelRename = () => {
    setEditing({ rowId: null, accessor: null });
    setPendingRenameHandler(null);
    setTempValue("");
  };

  const saveRename = (row, accessor) => {
    const originalValue = row[accessor];
    if (
      pendingRenameHandler &&
      tempValue.trim() !== "" &&
      tempValue.trim() !== String(originalValue).trim()
    ) {
      pendingRenameHandler(row, tempValue.trim());
    }
    cancelRename();
  };

  // Safe and reliable auto-date formatting helper across all data pages
  const formatCellValue = (val) => {
    if (val === null || val === undefined || val === "") return "—";

    // Format if it's a string/number that represents a valid date, skipping brief text values or pure ID strings
    if (
      typeof val === "string" &&
      val.length >= 10 &&
      !isNaN(Date.parse(val)) &&
      isNaN(Number(val)) // Prevents purely numerical IDs from accidentally qualifying
    ) {
      const dateObj = new Date(val);
      return dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }); // Always outputs clean format: e.g. "01 January 2026"
    }

    return String(val);
  };

  const renderTable = () => (
    <table
      className="table border-bottom mb-0"
      style={{ tableLayout: "auto", whiteSpace: "nowrap" }}
    >
      <thead className="table-light">
        <tr>
          {isSelectionMode && (
            <th className="ps-3" style={{ width: "50px" }}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={data.length > 0 && selectedIds.length === data.length}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
          )}
          {showAvater && <th className="p-0" />}
          {columns.map((col) => (
            <th key={col.header} className={fewColumns ? "px-5" : ""}>
              {col.header}
            </th>
          ))}
          {actions.length > 0 && (
            <th className={fewColumns ? "px-5" : ""}>Action</th>
          )}
        </tr>
      </thead>

      <tbody>
        {data.map((row, rowIndex) => {
          const isSelected = selectedIds.includes(row.id);

          return (
            <tr
              key={row.id}
              onDoubleClick={() => onRowDoubleClick?.(row)}
              className={`${isSelected ? "table-primary-light" : ""} ${rowIndex % 2 === 0 ? styles.zebraEven : styles.zebraOdd}`}
              style={{ cursor: "pointer" }}
            >
              {isSelectionMode && (
                <td className="ps-3 align-middle">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={isSelected}
                    onChange={() => onSelectRow(row.id)}
                  />
                </td>
              )}
              {showAvater && (
                <td className="p-0 align-middle">
                  <ProfileCell
                    profile={{
                      firstName:
                        row.full_name || row.candidate_name || row.name || "?",
                      image: row.profile_photo_url || "",
                    }}
                  />
                </td>
              )}

              {columns.map((col, index) => {
                const isEditing =
                  editing.rowId === row.id && editing.accessor === col.accessor;
                return (
                  <td
                    key={index}
                    className={`align-middle ${fewColumns ? "px-5" : ""}`}
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {isEditing ? (
                      <input
                        className="form-control form-control-sm"
                        autoFocus
                        style={{
                          height: "100%",
                          padding: "0 0.5rem",
                          fontSize: "1rem",
                          boxSizing: "border-box",
                        }}
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onBlur={() => saveRename(row, col.accessor)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename(row, col.accessor);
                          if (e.key === "Escape") cancelRename();
                        }}
                      />
                    ) : col.render ? (
                      col.render(row)
                    ) : (
                      formatCellValue(row[col.accessor])
                    )}
                  </td>
                );
              })}

              {actions.length > 0 && (
                <td
                  className={`align-middle ${fewColumns ? "px-5" : ""}`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <ActionButtons
                    actions={actions
                      .filter((action) => {
                        if (action.showOn === undefined) return true;
                        if (typeof action.showOn === "function")
                          return action.showOn(row);
                        return Boolean(row.is_active) === action.showOn;
                      })
                      .map((action) => {
                        if (action.type === "rename") {
                          const renameableCol = columns.find(
                            (col) => col.renameable,
                          );
                          if (!renameableCol) return action;
                          return {
                            ...action,
                            onClick: () =>
                              startRename(
                                row,
                                renameableCol.accessor,
                                action.onClick,
                              ),
                          };
                        }
                        return action;
                      })}
                    row={row}
                  />
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="container-fluid px-0">
      {filtersComponent}

      {data.length === 0 ? (
        <div className="text-center mt-5">
          <p className="text-muted">
            {emptyState?.title || "No records found"}
          </p>
          {emptyState?.subtitle && (
            <p className="text-muted small">{emptyState.subtitle}</p>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {/* Count display */}
          {showCount && pagination && pagination.total > 0 && (
            <span
              className="badge rounded-pill mb-2  d-inline-block"
              style={{
                backgroundColor: "#ddd6fe",
                color: "#7c3aed",
                fontWeight: "700",
                fontSize: "0.8rem",
                padding: "6px 14px",
                letterSpacing: "0.03em",
              }}
            >
              {(pagination.page - 1) * pagination.limit + 1}–
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total}
            </span>
          )}
          <div className={styles.tableScroll}>{renderTable()}</div>

          {pagination && pagination.total > pagination.limit && (
            <BottomPagination
              pagination={{
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
              }}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ListingComponent;

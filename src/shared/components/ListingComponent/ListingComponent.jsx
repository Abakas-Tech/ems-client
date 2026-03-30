import { useState } from "react";
import ActionButtons from "../ActionButtons/ActionButtons";
import BottomPagination from "../BottomPagination/BottomPagination";
import ProfileCell from "../ProfileCell/ProfileCell";

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
  // New Selection Props
  isSelectionMode = false,
  selectedIds = [],
  onSelectRow,
  onSelectAll,
  onRowDoubleClick,
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

  const saveRename = (row) => {
    if (pendingRenameHandler && tempValue.trim() !== "") {
      pendingRenameHandler(row, tempValue);
    }
    cancelRename();
  };

  // renderTable as arrow function
  const renderTable = () => (
    <table
      className={`table border-bottom ${fewColumns ? "mb-0" : ""}`}
      style={
        fewColumns
          ? { tableLayout: "auto", width: "max-content", minWidth: "100%" }
          : { tableLayout: "auto" }
      }
    >
      <thead className="table-light">
        <tr>
          {/* Checkbox Header */}
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
        {data.map((row) => {
          const isSelected = selectedIds.includes(row.id);
          return (
            <tr
              key={row.id}
              onDoubleClick={() => onRowDoubleClick(row)}
              className={isSelected ? "table-primary-light" : ""}
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
                      firstName: row.full_name || "?",
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
                    className={`align-middle text-nowrap ${fewColumns ? "px-5" : ""}`}
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
                      (row[col.accessor] ?? "—")
                    )}
                  </td>
                );
              })}

              {actions.length > 0 && (
                <td
                  className={`align-middle text-nowrap ${fewColumns ? "px-5" : ""}`}
                >
                  <ActionButtons
                    actions={actions
                      .filter((action) => {
                        // 1. If no showOn is defined, show the button
                        if (action.showOn === undefined) return true;

                        // 2. NEW: If showOn is a function, let the function decide (THIS IS THE KEY)
                        if (typeof action.showOn === "function")
                          return action.showOn(row);

                        // 3. Otherwise, keep your original logic for true/false
                        return Boolean(row.is_active) === action.showOn;
                      })
                      // Preserve rename logic
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
    <div className="container">
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
        <div className={fewColumns ? "mt-4" : "table-responsive mt-4"}>
          {fewColumns ? (
            <div
              className="table-responsive"
              style={{ width: "fit-content", maxWidth: "100%" }}
            >
              {renderTable()}
            </div>
          ) : (
            renderTable()
          )}

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

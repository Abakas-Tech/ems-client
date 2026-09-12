import { useEffect, useState, useRef } from "react";
import ActionButtons from "../ActionButtons/ActionButtons";
import BottomPagination from "../BottomPagination/BottomPagination";
import ProfileCell from "../ProfileCell/ProfileCell";
import styles from "./ListingComponent.module.css";

const CLICK_DEBOUNCE_MS = 230;

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
  onRowClick,
  resetSelectionSignal,
  showCount = true,
  selectionRevealed: selectionRevealedProp,
  onSelectionRevealedChange,
}) => {
  const [editing, setEditing] = useState({ rowId: null, accessor: null });
  const [tempValue, setTempValue] = useState("");
  const [pendingRenameHandler, setPendingRenameHandler] = useState(null);

  const isRevealControlled = selectionRevealedProp !== undefined;
  const [internalSelectionRevealed, setInternalSelectionRevealed] =
    useState(false);
  const selectionRevealed = isRevealControlled
    ? selectionRevealedProp
    : internalSelectionRevealed;

  const setSelectionRevealed = (value) => {
    onSelectionRevealedChange?.(value);
    if (!isRevealControlled) setInternalSelectionRevealed(value);
  };

  const showSelectionColumn = isSelectionMode && selectionRevealed;

  useEffect(() => {
    if (!isSelectionMode) setSelectionRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelectionMode]);

  const isFirstResetSignalRender = useRef(true);
  useEffect(() => {
    if (isFirstResetSignalRender.current) {
      isFirstResetSignalRender.current = false;
      return;
    }
    setSelectionRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSelectionSignal]);

  const clickTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
    };
  }, []);

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

  const handleRowDoubleClick = (row) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    if (onSelectRow) {
      setSelectionRevealed(true);
      if (isSelectionMode) {
        onSelectRow(row.id);
      }
    }
    onRowDoubleClick?.(row);
  };

  const handleRowClick = (row) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      onRowClick?.(row);
    }, CLICK_DEBOUNCE_MS);
  };

  const renderTable = () => (
    <table
      className={`table border-bottom mb-0 ${styles.table}`}
      style={{ tableLayout: "auto", whiteSpace: "nowrap" }}
    >
      <thead>
        <tr className={styles.headRow}>
          {isSelectionMode && (
            <th className="ps-3" style={{ width: "50px" }}>
              <input
                type="checkbox"
                className={styles.checkbox}
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
              onClick={() => handleRowClick(row)}
              onDoubleClick={() => handleRowDoubleClick(row)}
              className={`${isSelected ? "table-primary-light" : ""} ${
                rowIndex % 2 === 0 ? styles.zebraEven : styles.zebraOdd
              }`}
              style={{ cursor: "pointer" }}
            >
              {showSelectionColumn && (
                <td
                  className="ps-3 align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className={styles.checkbox}
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
                    onClick={isEditing ? (e) => e.stopPropagation() : undefined}
                  >
                    {isEditing ? (
                      <input
                        className={`form-control form-control-sm ${styles.renameInput}`}
                        autoFocus
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
                  onClick={(e) => e.stopPropagation()}
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
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="bi bi-inbox" />
          </div>
          <p className={styles.emptyTitle}>
            {emptyState?.title || "No records found"}
          </p>
          {emptyState?.subtitle && (
            <p className={styles.emptySubtitle}>{emptyState.subtitle}</p>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {/* Count display */}
          {showCount && pagination && pagination.total > 0 && (
            <span className={`${styles.countBadge} d-inline-block`}>
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

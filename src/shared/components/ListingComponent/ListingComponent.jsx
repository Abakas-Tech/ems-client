import ActionButtons from "../ActionButtons/ActionButtons";
import BottomPagination from "../BottomPagination/BottomPagination";
import ProfileCell from "../ProfileCell/ProfileCell";

const ListingComponent = ({
  data = [],
  columns = [],
  actions,
  filtersComponent,
  emptyState,
  pagination,
  showAvater = false,
}) => {
  return (
    <div className="container">
      {/* Filters */}
      {filtersComponent}

      {/* Empty state */}
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
        <div className="table-responsive mt-4">
          <table
            className="table border-bottom"
            style={{ tableLayout: "auto" }}
          >
            <thead className="table-light">
              <tr>
                {/* Only render first column if showAvater is true */}
                {showAvater && <th className="p-0" />}

                {columns.map((col) => (
                  <th key={col.header}>{col.header}</th>
                ))}

                {actions && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  {/* Profile Cell as first column */}
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

                  {columns.map((col, index) => (
                    <td key={index} className="align-middle text-nowrap">
                      {col.render
                        ? col.render(row)
                        : (row[col.accessor] ?? "—")}
                    </td>
                  ))}

                  {actions && (
                    <td className="align-middle text-nowrap">
                      <ActionButtons
                        actions={actions?.filter((action) => {
                          // If no condition → show always
                          if (typeof action.showOn === "undefined") return true;

                          // Match boolean status
                          return action.showOn == row.is_active;
                        })}
                        row={row}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination && pagination.total > pagination.limit && (
            <BottomPagination
              pagination={{
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
              }}
              onPageChange={pagination.onPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ListingComponent;

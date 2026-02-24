import ActionButtons from "../ActionButtons/ActionButtons";
import BottomPagination from "../BottomPagination/BottomPagination";

const ListingComponent = ({
  data = [],
  columns = [],
  actions,
  filtersComponent,
  emptyState,
  pagination,
}) => {
  return (
    <>
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
            <table className="table border-bottom">
              <thead className="table-light">
                <tr>
                  {columns.map((col) => (
                    <th key={col.header}>{col.header}</th>
                  ))}
                  {actions && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {data.map((row) => (
                  <tr key={row.id}>
                    {columns.map((col, index) => (
                      <td key={index}>
                        {col.render
                          ? col.render(row)
                          : (row[col.accessor] ?? "—")}
                      </td>
                    ))}

                    {actions && (
                      <td>
                        <ActionButtons actions={actions} row={row} />
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
    </>
  );
};

export default ListingComponent;

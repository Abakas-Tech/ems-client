import React from "react";

const AppointmentsTable = ({
  data,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Title</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Description</th>
            <th style={{ width: "150px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.map((row) => (
              <tr key={row.id}>
                <td>{row.title}</td>
                <td>{new Date(row.start_time).toLocaleString()}</td>
                <td>{new Date(row.end_time).toLocaleString()}</td>
                <td>{row.status}</td>
                <td>{row.description || "-"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => onEdit(row)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(row)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No appointments found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <span>
          Page {pagination.page} of{" "}
          {Math.ceil(pagination.total / pagination.limit) || 1}
        </span>
        <div>
          <button
            className="btn btn-sm btn-outline-primary me-2"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            Prev
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={
              pagination.page >= Math.ceil(pagination.total / pagination.limit)
            }
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsTable;

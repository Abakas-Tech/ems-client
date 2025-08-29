import React from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import BottomPagination from "../../../components/properties/bottomPagination";
import styles from "./AppointmentsTable.module.css";

const AppointmentsTable = ({
  data,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onView, // 🔹 NEW handler for detail view
}) => {
  return (
    <div>
      <div className="table-responsive">
        <table
          className={`table table-hover align-middle ${styles.appointmentsTable}`}
        >
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-5">
                  <i className="lni lni-calendar fs-2 d-block mb-2"></i>
                  No appointments found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className={styles.appointmentRow}>
                  <td className="fw-bold">{row.title}</td>
                  <td>{new Date(row.start_time).toLocaleString()}</td>
                  <td>{new Date(row.end_time).toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        row.status === "confirmed"
                          ? "bg-success"
                          : row.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className={`text-center ${styles.actionsCell}`}>
                    <div className={styles.actionsIcons}>
                      <FaEye
                        className={`${styles.actionIcon} text-info`}
                        title="View Details"
                        onClick={() => onView(row)}
                      />
                      <FaEdit
                        className={`${styles.actionIcon} text-primary`}
                        title="Edit"
                        onClick={() => onEdit(row)}
                      />
                      <FaTrash
                        className={`${styles.actionIcon} text-danger`}
                        title="Delete"
                        onClick={() => onDelete(row)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > pagination.limit && (
        <BottomPagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default AppointmentsTable;

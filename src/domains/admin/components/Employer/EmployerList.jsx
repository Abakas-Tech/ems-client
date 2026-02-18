import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import styles from "./EmployerList.module.css"; 

const EmployerList = ({ employers, onUpdate, onDelete }) => {
  return (
    <div>
      <div className="table-responsive">
        <table
          className={`table table-hover align-middle ${styles.employerTable}`}
        >
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Country</th>
              <th>Address</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employers?.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-5">
                  <i className="lni lni-users fs-2 d-block mb-2"></i>
                  No employers found
                </td>
              </tr>
            ) : (
              employers?.map((employer) => (
                <tr key={employer.id} className={styles.employerRow}>
                  <td className="fw-bold">{employer.full_name}</td>
                  <td>{employer.phone_number}</td>
                  <td>{employer.country}</td>
                  <td>{employer.address || "-"}</td>
                  <td className={`text-center ${styles.actionsCell}`}>
                    <div className={styles.actionsIcons}>
                      <FaEdit
                        className={`${styles.actionIcon} text-primary`}
                        title="Update"
                        onClick={() => onUpdate(employer)}
                      />
                      <FaTrash
                        className={`${styles.actionIcon} text-danger`}
                        title="Delete"
                        onClick={() => onDelete(employer.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployerList;

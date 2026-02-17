import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import styles from "./UserList.module.css";

const UserList = ({ users, onUpdate, onDelete }) => {
  return (
    <div>
      <div className="table-responsive">
        <table className={`table table-hover align-middle ${styles.userTable}`}>
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-5">
                  <i className="lni lni-users fs-2 d-block mb-2"></i>
                  No users found
                </td>
              </tr>
            ) : (
              users?.map((user) => (
                <tr key={user.id} className={styles.userRow}>
                  <td className="fw-bold">{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {user.role_id === 2 ? "Employee" : "Partner"}
                    </span>
                  </td>
                  <td>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className={`text-center ${styles.actionsCell}`}>
                    <div className={styles.actionsIcons}>
                      <FaEdit
                        className={`${styles.actionIcon} text-primary`}
                        title="Update"
                        onClick={() => onUpdate(user)}
                      />
                      <FaTrash
                        className={`${styles.actionIcon} text-danger`}
                        title="Delete"
                        onClick={() => onDelete(user.id)}
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

export default UserList;

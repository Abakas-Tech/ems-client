// FileList.jsx
import React, { useState } from "react";
import { FaEdit, FaTrash, FaPencilAlt, FaDownload } from "react-icons/fa";
import BottomPagination from "../../../../../shared/components/BottomPagination/BottomPagination";
import styles from "./FileList.module.css";

const FileList = ({
  files,
  pagination,
  onPageChange,
  onUpdate,
  onDelete,
  onRename,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");

  const startRename = (file) => {
    setEditingId(file.id);
    setNewName(file.file_name);
  };

  const cancelRename = () => {
    setEditingId(null);
    setNewName("");
  };

  const confirmRename = () => {
    if (newName.trim()) {
      onRename(editingId, newName.trim());
      cancelRename();
    }
  };

  const handleDownload = (file) => {
    if (!file.file_url) return;
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name || "download";
    link.target = "_blank";
    link.click();
  };

  return (
    <div>
      <div className="table-responsive">
        <table className={`table table-hover align-middle ${styles.fileTable}`}>
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Category</th>
              <th>Uploaded</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files?.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-muted py-5">
                  <i className="lni lni-files fs-2 d-block mb-2"></i>
                  No files found
                </td>
              </tr>
            ) : (
              files?.map((file) => (
                <tr key={file.id} className={styles.fileRow}>
                  <td className="fw-bold">
                    {editingId === file.id ? (
                      <div className="d-flex align-items-center flex-wrap gap-1">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="form-control form-control-sm"
                          style={{ maxWidth: "160px", minWidth: "120px" }}
                          autoFocus
                        />
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={confirmRename}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={cancelRename}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      file.file_name
                    )}
                  </td>
                  <td>{file.file_type}</td>
                  <td>{file.category || "-"}</td>
                  <td>{new Date(file.created_at).toLocaleDateString()}</td>
                  <td className={`text-center ${styles.actionsCell}`}>
                    <div className={styles.actionsIcons}>
                      <FaEdit
                        className={`${styles.actionIcon} text-primary`}
                        title="Update"
                        onClick={() => onUpdate(file)}
                      />
                      {/* <FaPencilAlt
                        className={`${styles.actionIcon} text-secondary`}
                        title="Rename"
                        onClick={() => startRename(file)}
                      /> */}
                      <FaDownload
                        className={`${styles.actionIcon} text-success`}
                        title="Download"
                        onClick={() => handleDownload(file)}
                      />
                      <FaTrash
                        className={`${styles.actionIcon} text-danger`}
                        title="Delete"
                        onClick={() => onDelete(file.id)}
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

export default FileList;

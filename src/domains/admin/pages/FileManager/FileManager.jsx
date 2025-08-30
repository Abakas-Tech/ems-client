import React, { useState, useEffect, useRef } from "react";
import FileList from "../../components/Files/FileList/FileList";
import FileModalForm from "../../components/Files/FileUploadForm/FileUploadForm";
import {
  fetchFiles,
  uploadFile,
  updateFile,
  renameFile,
  deleteFile,
} from "../../api/file.api";
import FileFilters from "../../components/Files/FileFilters/FileFilters";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";

const FileManager = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [filesData, setFilesData] = useState({ data: [], total: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    fileType: "",
    category: "",
    fileName: "",
  });
  const [editingFile, setEditingFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  const isFirstLoad = useRef(true); // 👈 only show success once

  // 🔹 Fetch files
  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        const files = await fetchFiles(filters);
        setFilesData(files);

        if (isFirstLoad.current) {
          addMessage("success", files?.message || "Files loaded successfully!");
          isFirstLoad.current = false;
        }
      } catch (err) {
        const message =
          typeof err.message === "string"
            ? err.message
            : "Failed to load files!";
        addMessage("error", message);
      } finally {
        hideLoader();
      }
    };
    fetchData();
  }, [filters]);

  // 🔹 Filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      fileType: "",
      category: "",
      file_name: "",
    });
  };

  // 🔹 Pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // 🔹 CRUD Handlers
  const handleSubmit = async (fileData) => {
    showLoader();
    try {
      if (editingFile) {
        const updatedFile = await updateFile(editingFile.id, fileData);
        addMessage(
          "success",
          updatedFile?.message || "File updated successfully!"
        );
      } else {
        const uploadedFile = await uploadFile(fileData);
        addMessage(
          "success",
          uploadedFile?.message || "File uploaded successfully!"
        );
      }
      setEditingFile(null);
      setIsModalOpen(false);

      const updatedFiles = await fetchFiles(filters);
      setFilesData(updatedFiles);
    } catch (err) {
      addMessage("error", err.message || "File operation failed!");
    } finally {
      hideLoader();
    }
  };

  const handleUpdate = (file) => {
    setEditingFile(file);
    setIsModalOpen(true);
  };

  const handleRename = async (id, newFileName) => {
    showLoader();
    try {
      const renamed = await renameFile(id, newFileName);
      addMessage("success", renamed?.message || "File renamed successfully!");
      const updatedFiles = await fetchFiles(filters);
      setFilesData(updatedFiles);
    } catch (err) {
      addMessage("error", err.message || "Failed to rename file!");
    } finally {
      hideLoader();
    }
  };

  const handleDelete = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const confirmDeleteFile = async () => {
    showLoader();
    try {
      const deleted = await deleteFile(confirmDelete.id);
      addMessage("success", deleted?.message || "File deleted successfully!");
      const updatedFiles = await fetchFiles(filters);
      setFilesData(updatedFiles);
    } catch (err) {
      addMessage("error", err.message || "Failed to delete file!");
    } finally {
      hideLoader();
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="dashboard-wraper container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <span className="text-primary fs-3">📂</span>
            File Manager
          </h2>
          <p className="text-muted mb-0">
            Organize and manage your files — upload, update, rename, delete, or
            download.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <button
            className="sm-py-2 btn btn-primary px-4 py-2 rounded-3 shadow-sm fw-semibold"
            onClick={() => {
              setEditingFile(null);
              setIsModalOpen(true);
            }}
          >
            + Upload File
          </button>
        </div>
      </div>

      {/* Filters */}
      <FileFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* File List */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          <FileList
            files={filesData?.files || []}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRename={handleRename}
            pagination={filesData?.pagination || {}}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Pagination */}
      {filesData.total > filters.limit && (
        <div className="d-flex justify-content-center align-items-center gap-3">
          <button
            className="btn btn-outline-primary fw-bold px-4"
            disabled={filters.page === 1}
            onClick={() => handlePageChange(filters.page - 1)}
          >
            Previous
          </button>
          <span className="fw-bold">
            Page {filters.page} of {Math.ceil(filesData.total / filters.limit)}
          </span>
          <button
            className="btn btn-outline-primary fw-bold px-4"
            disabled={filters.page * filters.limit >= filesData.total}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        show={confirmDelete.show}
        onCancel={() => setConfirmDelete({ show: false, id: null })}
        onConfirm={confirmDeleteFile}
        title="Delete File"
        message="Are you sure you want to delete this file?"
      />

      {/* Modal for Upload / Update */}
      {isModalOpen && (
        <FileModalForm
          show={isModalOpen}
          handleClose={() => setIsModalOpen(false)}
          handleSubmit={handleSubmit}
          initialData={editingFile}
        />
      )}
    </div>
  );
};

export default FileManager;

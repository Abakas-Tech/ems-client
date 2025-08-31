import React, { useState, useEffect } from "react";
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

  //  Fetch files
  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        // Prepare filters for API
        const cleanFilters = {};
        if (filters.page) cleanFilters.page = parseInt(filters.page, 10);
        if (filters.limit) cleanFilters.limit = parseInt(filters.limit, 10);
        if (filters.fileType) cleanFilters.fileType = filters.fileType;
        if (filters.category) cleanFilters.category = filters.category;
        if (filters.file_name) cleanFilters.file_name = filters.file_name;

        const files = await fetchFiles(cleanFilters);
        setFilesData(files);
      } catch (err) {
        addMessage("error", err.message);
      } finally {
        hideLoader();
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  //  Filters
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

  //  Pagination
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  //  CRUD Handlers
  const handleSubmit = async (fileData) => {
    showLoader();
    try {
      let response;

      if (editingFile) {
        response = await updateFile(editingFile.id, fileData);
        addMessage(
          "success",
          response?.message || "File updated successfully!"
        );
      } else {
        response = await uploadFile(fileData);
        addMessage(
          "success",
          response?.message || "File uploaded successfully!"
        );
      }

      setEditingFile(null);
      setIsModalOpen(false);

      const updatedFiles = await fetchFiles(filters);
      setFilesData(updatedFiles);
    } catch (err) {
      addMessage("error", err.message);
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
      const response = await renameFile(id, newFileName);
      addMessage("success", response?.message || "File renamed successfully!");
      const updatedFiles = await fetchFiles(filters);
      setFilesData(updatedFiles);
    } catch (err) {
      addMessage("error", err.message);
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
      const response = await deleteFile(confirmDelete.id);
      addMessage("success", response?.message || "File deleted successfully!");
      const updatedFiles = await fetchFiles(filters);
      setFilesData(updatedFiles);
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="dashboard-wraper  ">
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

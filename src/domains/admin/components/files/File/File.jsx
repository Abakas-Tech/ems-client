import React, { useState, useEffect } from "react";
import FileUpload from "../FileUpload/FileUpload";
import {
  fetchFiles,
  uploadFile,
  updateFile,
  deleteFile,
} from "../../../api/file.api";
import FileFilters from "../FileFilters/FileFilters";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";
import { useConfirmDelete } from "../../../../../context/Delete/UseDelete";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";

const File = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useConfirmDelete();

  // --- View Control ---
  // 'list' = Table + Filters
  // 'create' = Upload Form
  // 'edit' = Update Form
  const [view, setView] = useState("list");

  const [filesData, setFilesData] = useState({
    files: [],
    total: 0,
    pagination: {},
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    fileName: "",
    category: "",
    file_type: "",
  });
  const [editingFile, setEditingFile] = useState(null);

  // Fetch files whenever filters change or we return to the list view
  useEffect(() => {
    if (view === "list") {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, view]);

  const fetchData = async () => {
    showLoader();
    try {
      const cleanFilters = {
        page: filters.page,
        limit: filters.limit,
        file_type: filters.file_type,
        category: filters.category,
        search: filters.fileName, // mapping state to API expected key
      };

      const response = await fetchFiles(cleanFilters);

      // Ensure we match the data structure returned by your API
      setFilesData({
        files: response.files || [],
        total: response.pagination.total || 0,
        pagination: response.pagination || {},
      });
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
    }
  };

  // --- Handlers ---

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      file_type: "",
      category: "",
      fileName: "",
    });
  };

  const handleFormSubmit = async (formData) => {
    showLoader();
    try {
      let response;
      if (view === "edit") {
        response = await updateFile(editingFile.id, formData);
        addMessage("success", "File details updated successfully!");
      } else {
        response = await uploadFile(formData);
        addMessage("success", "File uploaded successfully!");
      }
      setView("list");
      setEditingFile(null);
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDelete = (id) => {
    openModal(async () => {
      showLoader();
      try {
        await deleteFile(id);
        addMessage("success", "File deleted successfully!");
        fetchData();
      } catch (err) {
        addMessage("error", err.message);
      } finally {
        hideLoader();
      }
    });
  };

  return (
    <div className="dashboard-wraper">
      {view !== "list" ? (
        <FileUpload
          isEditMode={view === "edit"}
          initialData={editingFile}
          onSuccess={handleFormSubmit}
          onCancel={() => {
            setView("list");
            setEditingFile(null);
          }}
        />
      ) : (
        <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
            <div>
              <h2 className="fw-bold text-dark mb-2">File Manager</h2>
              <p className="text-muted mb-0">
                Organize and manage your files — upload, update, delete, or
                download.
              </p>
            </div>
            <div className="mt-3 mt-md-0 ">
              <button
                className="btn btn-main px-4 py-2 rounded-3 shadow-sm fw-semibold text-white"
                onClick={() => {
                  setEditingFile(null);
                  setView("create");
                }}
              >
                + Upload File
              </button>
            </div>
          </div>

          <ListingComponent
            filtersComponent={
              <FileFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            }
            data={filesData.files}
            columns={[
              { header: "Name", accessor: "file_name" },
              {
                header: "Type",
                accessor: "file_type",
              },
              {
                header: "Uploaded",
                render: (row) => new Date(row.created_at).toLocaleDateString(),
              },
              { header: "Category", accessor: "category" },
            ]}
            actions={[
              {
                type: "rename", // Changed from 'rename' to match standard ActionButtons
                onClick: (row) => {
                  setEditingFile(row);
                  setView("edit");
                },
              },
              {
                type: "download",
                onClick: (row) => handleDownload(row),
              },
              {
                type: "delete",
                onClick: (row) => handleDelete(row.id),
              },
            ]}
            emptyState={{
              title: "No files found",
              subtitle: "Try adjusting the filters above or check back later.",
            }}
            pagination={{
              page: filters.page,
              limit: filters.limit,
              total: filesData.total,
              onPageChange: (page) => setFilters((prev) => ({ ...prev, page })),
            }}
          />
        </>
      )}
    </div>
  );
};

export default File;

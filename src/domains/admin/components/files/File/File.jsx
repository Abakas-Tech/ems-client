import React, { useState, useEffect } from "react";
import FileUpload from "../FileUpload/FileUpload";
import {
  fetchFiles,
  uploadFile,
  updateFile,
  deleteFile,
} from "../../../api/file.api";
import FileFilters from "../FileFilters/FileFilters";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import Badge from "../../../../../shared/components/Badge/Badge";
import useProfile from "../../../../../context/Profile/useProfile";

const File = () => {
  const { profile } = useProfile();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

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
    if (view === "list" && profile) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, view, profile]);

  const fetchData = async () => {
    if (!profile) return;
    showLoader();
    try {
      const cleanFilters = {
        page: filters.page,
        limit: filters.limit,
        file_type: filters.file_type,
        category: filters.category,
        search: filters.fileName,
      };

      const response = await fetchFiles(cleanFilters);
      const rawFiles = response?.data.files || [];

      const processedFiles = rawFiles.map((file) => {
        const isAdmin = Number(profile.role_id) === 1;
        const isOwner = Number(file.uploaded_by) === Number(profile.id);

        return {
          ...file,
          // We keep this true so the ListingComponent filter lets it pass
          is_active: !!(isAdmin || isOwner),
        };
      });
      setFilesData({
        files: processedFiles,
        total: response?.data.pagination?.total || 0,
        pagination: response?.data.pagination || {},
      });
    } catch  {
console.error("Failed to fetch files:")
    } finally {
      hideLoader();
    }
  };

  //  Handlers

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
        addMessage(
          response.success,
          response.Message || "File details updated successfully!",
        );
      } else {
        response = await uploadFile(formData);
        addMessage(
          response.success,
          response.Message || "File uploaded successfully!",
        );
      }
      setView("list");
      setEditingFile(null);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDownload = async (file) => {
    if (!file.file_url) return;

    showLoader(); // Optional: show loader while fetching the file
    try {
      const response = await fetch(file.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Use the original filename or fallback
      link.download = file.file_name || "download";

      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch  {
      addMessage(false, "Failed to download file");
    } finally {
      hideLoader();
    }
  };

  const handleDelete = (id) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteFile(id);
          addMessage(
            response.success,
            response.Message || "File deleted successfully!",
          );
          fetchData();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this file?",
        confirmText: "Delete",
      },
    );
  };
  const handleViewDetail = (file) => {
    console.log(file)
    if (!file.file_url) return;
    const link = document.createElement("a");
    link.href = file.file_url;
    link.download = file.file_name || "download";
    link.target = "_blank";
    link.click();
  };
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const isInternalUser = profile?.role_id <= 2;

  return (
    <div className="dashboard-wraper">
      {/* Handle Create/Edit View */}
      {(view === "create" || view === "edit") && (
        <FileUpload
          isEditMode={view === "edit"}
          initialData={editingFile}
          onSuccess={handleFormSubmit}
          onCancel={() => {
            setView("list");
            setEditingFile(null);
          }}
        />
      )}
      {view === "list" && (
        <>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
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
              isInternalUser && {
                header: "Visibility",
                render: (row) =>
                  row.is_private ? (
                    <Badge content="Private" color="red" icon="bi-lock-fill" />
                  ) : (
                    <Badge content="Public" color="blue" icon="bi-globe" />
                  ),
              },
              {
                header: "Type",
                accessor: "file_type",
              },
              {
                header: "Uploaded",
                render: (row) => new Date(row.created_at).toLocaleDateString(),
              },
              { header: "Category", accessor: "category" },
            ].filter(Boolean)}
            actions={[
              {
                type: "view",
                onClick: (row) => handleViewDetail(row),
              },
              {
                type: "edit",
                onClick: (row) => {
                  setEditingFile(row);
                  setView("edit");
                },
                showOn: true,
                bypassRole: true,
              },
              {
                type: "download",
                onClick: (row) => handleDownload(row),
              },

              {
                type: "delete",
                onClick: (row) => handleDelete(row.id),
                showOn: true,
                bypassRole: true,
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
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default File;

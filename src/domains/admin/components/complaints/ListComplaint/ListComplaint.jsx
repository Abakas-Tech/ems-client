import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  getComplaints,
  getComplaintById,
  deleteComplaint,
  updateComplaintStatus,
} from "../../../api/complaint.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import FilterComplaint from "../FilterComplaint/FilterComplaint";
import Badge from "../../../../../shared/components/Badge/Badge";
import RoleButton from "../../../../../shared/components/RoleButton/RoleButton";
import {
  generateComplaintReportPdf,
  generateComplaintReportsPdf,
} from "../ComplaintReport/complaintReport.generator";

const STATUS_MAP = {
  open: "Open",
  investigating: "Investigating",
  resolved: "Resolved",
};
const STATUS_COLOR = {
  open: "yellow",
  investigating: "blue",
  resolved: "green",
};

const ListComplaint = () => {
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Selection mode (mirrors ListUser's bulk-select pattern)
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedComplaintIds, setSelectedComplaintIds] = useState([]);

  const fetchComplaints = async (page = 1) => {
    showLoader();
    try {
      const cleanFilters = {};
      if (filters.search) cleanFilters.search = filters.search;
      if (filters.status) cleanFilters.status = filters.status;

      cleanFilters.page = page;
      cleanFilters.limit = pagination.limit;

      const response = await getComplaints(cleanFilters);
      setComplaints(response?.data || []);
      setPagination({
        page: response?.pagination?.page || 1,
        limit: response?.pagination?.limit || 10,
        total: response?.pagination?.total || 0,
        pages: response?.pagination?.pages || 1,
      });
    } catch {
      console.error("Failed to fetch complaints");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchComplaints(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handlePageChange = (newPage) => {
    fetchComplaints(newPage);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", status: "" });
  };

  // First double-click enters selection mode and selects that row (same UX as ListUser)
  const handleRowDoubleClick = (row) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedComplaintIds([row.id]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedComplaintIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedComplaintIds(checked ? complaints.map((c) => c.id) : []);
  };

  const handleExitSelection = () => {
    setIsSelectionMode(false);
    setSelectedComplaintIds([]);
  };

  // Bulk report generation -> one combined multi-page PDF
  const handleBulkGenerateReports = async () => {
    if (selectedComplaintIds.length === 0) return;
    showLoader();
    try {
      await generateComplaintReportsPdf(selectedComplaintIds);
    } catch (err) {
      addMessage(false, err.message || "Failed to generate reports");
    } finally {
      hideLoader();
    }
  };

  const handleGenerateReport = async (row) => {
    showLoader();
    try {
      await generateComplaintReportPdf(row.id);
    } catch (err) {
      addMessage(false, err.message || "Failed to generate report");
    } finally {
      hideLoader();
    }
  };

  const handleView = (row) => {
    navigate(`/admin/complaints/view/${row.id}`);
  };

  const handleCreateComplaint = () => {
    navigate("/admin/complaints/create-complaint");
  };

  // Fetch the full complaint (complainants, resolution attempts, etc.) before
  // handing it to the form, since list rows only carry summary fields.
  const handleEdit = async (row) => {
    showLoader();
    try {
      const res = await getComplaintById(row.id);
      const complaintData = res?.data || res;
      navigate("/admin/complaints/create-complaint", {
        state: { isEditMode: true, complaintData },
      });
    } catch (err) {
      addMessage(false, err.message || "Failed to load complaint");
    } finally {
      hideLoader();
    }
  };

  const handleStatusChange = (row, status) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await updateComplaintStatus(row.id, status);
          addMessage(response?.success, response?.message);
          fetchComplaints(pagination.page);
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: `Mark this complaint as "${STATUS_MAP[status]}"?`,
        confirmText: "Confirm",
      },
    );
  };

  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteComplaint(row.id);
          addMessage(response?.success, response?.message);
          fetchComplaints(pagination.page);
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this complaint?",
        confirmText: "Delete",
      },
    );
  };

  const columns = [
    {
      header: "Employee",
      accessor: "employee_full_name",
      render: (row) => (
        <span className="fw-bold">
          {row.employee_full_name}
          {row.worker_id ? (
            <Badge content="Linked" color="green" className="ms-2" />
          ) : null}
        </span>
      ),
    },
    {
      header: "Employer",
      accessor: "employer_full_name",
      render: (row) => row.employer_full_name || "—",
    },
    {
      header: "Received",
      accessor: "received_date",
      render: (row) =>
        row.received_date
          ? new Date(row.received_date).toLocaleDateString()
          : "—",
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <Badge
          content={STATUS_MAP[row.status] || row.status}
          color={STATUS_COLOR[row.status] || "gray"}
        />
      ),
    },
  ];

  const actions = [
    { type: "view", onClick: handleView },
    { type: "edit", onClick: handleEdit },
    {
      type: "report",
      label: "Generate Report",
      onClick: handleGenerateReport,
    },
    {
      type: "investigate",
      label: "Mark Investigating",
      onClick: (row) => handleStatusChange(row, "investigating"),
      showOn: (row) => row.status === "open",
    },
    {
      type: "resolve",
      label: "Mark Resolved",
      onClick: (row) => handleStatusChange(row, "resolved"),
      showOn: (row) => row.status !== "resolved",
    },
    { type: "delete", onClick: handleDelete },
  ];

  const emptyState = {
    title: "No complaints found",
    subtitle: "Complaints submitted against employers will appear here",
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h2 className="fw-bold text-dark mb-2">Complaint Management</h2>
          <p className="text-muted mb-0">
            Track, resolve, and report on worker complaints. Double-click a row
            to select multiple and generate reports in bulk.
          </p>
        </div>
        <RoleButton
          visibleTo={[2, 1]}
          className="btn btn-main"
          style={{ whiteSpace: "nowrap" }}
          onClick={handleCreateComplaint}
        >
          Log Complaint
        </RoleButton>
      </div>

      {isSelectionMode && (
        <>
          <style>{`
            .bulk-bar {
              background: linear-gradient(135deg, #eaf3fc, #dcedfb);
              border: 1px solid rgba(26, 86, 176, 0.15);
              box-shadow: 0 4px 20px rgba(26, 86, 176, 0.12), inset 0 1px 0 rgba(255,255,255,0.5);
            }
            .bulk-icon-wrap {
              background: linear-gradient(135deg, rgba(30, 122, 52, 0.12), rgba(30, 122, 52, 0.05));
              border: 1px solid rgba(30, 122, 52, 0.15);
            }
            .action-btn {
              position: relative;
              transition: transform 0.2s cubic-bezier(.2,.9,.3,1.3), box-shadow 0.2s ease;
              letter-spacing: 0.02em;
            }
            .action-btn:hover:not(:disabled) {
              transform: translateY(-2px) scale(1.03);
            }
            .action-btn:active:not(:disabled) {
              transform: translateY(0) scale(0.98);
            }
            .action-btn:disabled {
              opacity: 0.4;
              cursor: not-allowed;
            }
          `}</style>

          <div
            className="bulk-bar d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 animate__animated animate__fadeInDown sticky-top px-3 px-md-4 py-2"
            style={{
              zIndex: 1050,
              top: "60px",
              maxWidth: "1300px",
              margin: "0 auto",
              width: "100%",
              borderRadius: "16px",
              transition: "all 0.3s ease",
            }}
          >
            <div className="d-flex align-items-center mb-3 mb-md-0 w-100 w-md-auto justify-content-start">
              <div
                className="bulk-icon-wrap rounded-circle d-flex align-items-center justify-content-center me-3"
                style={{ minWidth: "38px", height: "38px", color: "#1e7a34" }}
              >
                <i className="bi bi-file-earmark-pdf-fill fs-6"></i>
              </div>
              <div>
                <h6
                  className="mb-0 fw-bold"
                  style={{ fontSize: "0.9rem", color: "#1a4d2b" }}
                >
                  Bulk Action Mode
                </h6>
                <p
                  className="mb-0 small fw-medium"
                  style={{ color: "rgba(26, 77, 43, 0.65)" }}
                >
                  <span className="fw-bold" style={{ color: "#1e7a34" }}>
                    {selectedComplaintIds.length}
                  </span>{" "}
                  {selectedComplaintIds.length === 1
                    ? "complaint"
                    : "complaints"}{" "}
                  selected
                </p>
              </div>
            </div>

            <div
              className="d-flex flex-row gap-2 w-100 w-md-auto justify-content-md-end align-items-center"
              style={{ fontSize: "13px" }}
            >
              <button
                type="button"
                className="btn btn-outline-main btn-sm rounded-pill px-4 py-3 fw-bold text-nowrap action-btn"
                disabled={selectedComplaintIds.length === 0}
                onClick={handleBulkGenerateReports}
                style={{ fontSize: "16px" }}
              >
                Generate Reports
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill px-4 py-3 fw-bold text-nowrap action-btn"
                onClick={handleExitSelection}
                style={{ fontSize: "16px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      <ListingComponent
        data={complaints}
        columns={columns}
        actions={isSelectionMode ? [] : actions}
        emptyState={emptyState}
        isSelectionMode={isSelectionMode}
        selectedIds={selectedComplaintIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        onRowDoubleClick={handleRowDoubleClick}
        filtersComponent={
          <FilterComplaint
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        }
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
        }}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ListComplaint;

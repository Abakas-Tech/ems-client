import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  listWorkers,
  listWorkersForPartners,
  deleteWorker,
  restoreWorker, // ADDED — merged in from ArchivedWorkers
} from "../../../api/worker.api";

import ActiveWorkersFilters from "../WorkerFilter/WorkerFilter";

import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";

import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import useProfile from "../../../../../context/Profile/useProfile";
import { generateVisaApplicationPdf } from "../../Application/VisaApplicationPdfGenerator";
import VisaApplicationTemplate from "../../Application/VisaApplicationTemplate";
import { printInsuranceParticulars } from "../../Insurance/InsuranceReport";

const ActiveWorkers = () => {
  const navigate = useNavigate();

  const { openModal } = useDelete();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const { profile } = useProfile();
  const role = profile?.role_id;

  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({});

  // ADDED — the archived page is retired; is_active now doubles as the
  // active/archived toggle in this single list. "false" = archived view.
  const isArchivedView = filters.is_active === "false";

  //  Selection Mode States
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);

  // Visa Application Preview State
  const [visaPreview, setVisaPreview] = useState(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch Workers
  const fetchWorkers = useCallback(async () => {
    showLoader();

    try {
      // FIXED — always send an explicit is_active filter instead of only
      // spreading `filters`. Before this fix, the Active view left
      // is_active unset, so a worker who was just archived (is_active ->
      // false) could still be returned by this same query and appear to
      // "not leave" the Active list on refresh. Restore worked correctly
      // because the Archived view always sent an explicit
      // is_active: "false", which correctly excludes a worker as soon as
      // its is_active flips back to true. Defaulting to "true" here makes
      // the Active view behave the same way — explicit, not implicit.
      const params = {
        ...filters,
        is_active: filters.is_active !== undefined ? filters.is_active : "true",
        page,
        limit,
      };

      let res;

      if (Number(role) === 3) {
        res = await listWorkersForPartners(params);
      } else {
        res = await listWorkers(params);
      }
      setWorkers(res?.data?.items || []);
      setTotalItems(res?.data?.meta?.total_items || 0);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page, limit, role]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Record Transaction Handler
  const handleRecordTransaction = (row) => {
    navigate("/admin/finances", {
      state: {
        userId: row.id,
        userName: row.full_name,
        userRole: "employee",
      },
    });
  };

  // Edit Handler
  const handleEdit = (row) => {
    navigate(`/admin/employees/edit/${row.id}`, { state: row });
  };

  const handleViewCv = (row) => {
    if (Number(role) === 3 && !row.has_cv_access) {
      addMessage(false, "This worker's CV has not been shared with you yet");
      return;
    }

    const basePath = Number(role) === 3 ? "/partner" : "/admin";
    navigate(`${basePath}/employees/${row.id}/cv`, { state: row });
  };

  // Bulk Insurance Print Handler
  const handlePrintInsurance = async () => {
    if (selectedWorkerIds.length === 0) return;

    showLoader();

    try {
      const missingIds = await printInsuranceParticulars(selectedWorkerIds);

      if (missingIds.length > 0) {
        addMessage(
          false,
          `No insurance data found for worker ID(s): ${missingIds.join(", ")}`,
        );
      }
    } catch (err) {
      addMessage(false, err.message || "Failed to generate insurance report");
    } finally {
      hideLoader();
    }
  };

  // --- Selection Handlers ---

  const canUseBulkSelection = role === 1 || role === 2;

  const handleRowDoubleClick = (row) => {
    if (!canUseBulkSelection) return;
    if (!row?.id) return;

    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedWorkerIds([row.id]);
    }
  };

  const handleSelectRow = (id) => {
    if (!id) return;

    setSelectedWorkerIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      }

      return [...prev, id];
    });
  };

  const handleSelectAll = (checked) => {
    const currentPageIds = workers
      .map((worker) => worker.id)
      .filter((id) => id !== undefined && id !== null);

    setSelectedWorkerIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...currentPageIds]));
      }

      return prev.filter((selectedId) => !currentPageIds.includes(selectedId));
    });
  };

  const handleExitSelection = () => {
    setIsSelectionMode(false);
    setSelectedWorkerIds([]);
  };

  const handleAutofillSelected = () => {
    if (selectedWorkerIds.length === 0) return;

    navigate("/admin/autofill", {
      state: {
        workerIds: selectedWorkerIds,
        source: "active-workers",
      },
    });
  };

  // Filter handlers
  const handleFilterChange = (f) => {
    setFilters((prev) => ({ ...prev, ...f }));
    setPage(1);
  };

  const handleClear = () => {
    setFilters({});
    setPage(1);
  };

  // View, Archive, Delete handlers
  const handleView = async (id) => {
    showLoader();

    try {
      // FIXED — explicitly match is_active to the current view (Active vs
      // Archived) instead of omitting it. Once fetchWorkers started
      // defaulting to is_active: "true", an unfiltered lookup here would
      // never find an archived worker by id (the backend only returns
      // active ones by default), which is exactly why View from the
      // Archived list was always reporting "Employee profile not found".
      // Sending the same is_active the list itself is currently showing
      // makes View work identically from both lists.
      const res = await listWorkers({
        assignedWorkerIds: [id],
        is_active: isArchivedView ? "false" : "true",
        page: 1,
        limit: 1,
      });
      const workerProfile = res?.data?.items?.[0];

      if (!workerProfile) {
        addMessage(false, "Employee profile not found");
        return;
      }

      navigate(`/admin/employees/edit/${id}`, {
        state: {
          ...workerProfile,
          openInPreview: true,
          isArchived: isArchivedView,
        },
      });
    } catch (err) {
      console.error("Failed to fetch worker profile:", err);
      addMessage(false, err.message || "Failed to load employee profile");
    } finally {
      hideLoader();
    }
  };
  const handleArchive = (id) => {
    openModal(
      async () => {
        try {
          const response = await deleteWorker(id, false);

          addMessage(
            response?.success,
            response?.message || "Employee archived successfully",
          );

          await fetchWorkers(); // CHANGED: awaited so the modal's callback
          // doesn't resolve until the refreshed list has actually loaded
        } catch (err) {
          addMessage(false, err.message);
        }
      },
      {
        title: "Are you sure you want to archive this employee?",
        confirmText: "Archive",
      },
    );
  };

  const handleDelete = (id) => {
    openModal(
      async () => {
        try {
          const response = await deleteWorker(id, true);

          addMessage(
            response?.success,
            response?.message || "Employee deleted successfully",
          );

          await fetchWorkers(); // CHANGED
        } catch (err) {
          addMessage(false, err.message);
        }
      },
      {
        title: "Are you sure you want to delete this employee?",
        confirmText: "Delete",
      },
    );
  };

  const handleRestore = (id) => {
    openModal(
      async () => {
        try {
          const response = await restoreWorker(id);

          addMessage(
            response?.success,
            response?.message || "Employee restored successfully",
          );

          await fetchWorkers(); // CHANGED
        } catch (err) {
          addMessage(false, err.message || "Failed to restore employee");
        }
      },
      {
        title: "Are you sure you want to restore this employee?",
        confirmText: "Restore",
      },
    );
  };

  const handleDeleteArchived = (id) => {
    // CHANGED — reuses the same deleteWorker(id, true) call the Active
    // list's permanent-delete action uses, instead of a separate
    // deleteArchivedWorker endpoint. Same API, same code flow, for both
    // lists.
    openModal(
      async () => {
        try {
          const response = await deleteWorker(id, true);

          addMessage(
            response?.success,
            response?.message || "Employee deleted successfully",
          );

          await fetchWorkers(); // CHANGED
        } catch (err) {
          addMessage(false, err.message || "Failed to delete employee");
        }
      },
      {
        title: "Are you sure you want to delete this employee permanently?",
        confirmText: "Delete",
      },
    );
  };
  // --- Visa Application Handlers ---
  const handleDownloadVisaApplication = async (id) => {
    showLoader();

    try {
      const result = await generateVisaApplicationPdf(id, {
        autoDownload: false,
      });

      hideLoader();

      if (!result?.url) {
        addMessage(false, "Failed to generate visa application");
        return;
      }

      setVisaPreview(result);
    } catch (err) {
      hideLoader();
      console.error("Failed to generate visa application PDF:", err);

      // Required worker information is missing — instead of surfacing a
      // plain error message, send the user straight into that worker's
      // Edit mode with the exact missing fields carried along so the
      // Worker Form can flag them for completion.
      if (err?.missingFields?.length > 0) {
        navigate(`/admin/employees/edit/${err.workerId ?? id}`, {
          state: {
            openSection: err.missingFields[0]?.section,
            missingFields: err.missingFields,
          },
        });
        return;
      }

      addMessage(false, err.message || "Failed to generate visa application");
    }
  };

  const triggerVisaDownload = () => {
    if (!visaPreview) return;

    const link = document.createElement("a");
    link.href = visaPreview.url;
    link.download = visaPreview.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareVisaOnWhatsapp = async () => {
    if (!visaPreview) return;

    const { blob, fileName, fullName } = visaPreview;

    try {
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        navigator.share
      ) {
        await navigator.share({
          files: [file],
          title: "Visa Application",
          text: `Visa application for ${fullName}`,
        });
        return;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      console.warn(
        "Native file share failed, falling back to WhatsApp text link:",
        err,
      );
    }

    const message = `Visa application for ${fullName} is ready: ${fileName}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // Cancel out of the Application Generator preview and return to the list.
  const handleCancelVisaPreview = () => {
    setVisaPreview(null);
  };

  // const goBack = () => {
  //   navigate(-1);
  // };

  const actions = isArchivedView
    ? [
        { type: "view", onClick: (row) => handleView(row.id) },
        { type: "restore", onClick: (row) => handleRestore(row.id) },
        { type: "delete", onClick: (row) => handleDeleteArchived(row.id) },
      ]
    : role === 3
      ? [{ type: "viewCV", onClick: (row) => handleViewCv(row) }]
      : [
          { type: "view", onClick: (row) => handleView(row.id) },
          { type: "viewCV", onClick: (row) => handleViewCv(row) },
          { type: "edit", onClick: (row) => handleEdit(row) },
          {
            type: "transaction",
            onClick: (row) => handleRecordTransaction(row),
          },
          {
            type: "downloadVisa",
            onClick: (row) => handleDownloadVisaApplication(row.id),
          },
          { type: "archive", onClick: (row) => handleArchive(row.id) },
          { type: "delete", onClick: (row) => handleDelete(row.id) },
        ];

  return (
    <div className="dashboard-wraper position-relative">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-start gap-3">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 w-100">
          <div>
            <h2 className="fw-bold text-dark mb-2">
              {role === 5
                ? "My Employees"
                : isArchivedView
                  ? "Archived Employees"
                  : "Active Employees"}
            </h2>
            <p className="text-muted mb-0">
              {role === 5
                ? "View the employees assigned to you and access their profiles."
                : role === 3
                  ? "View active employees and access their profiles."
                  : isArchivedView
                    ? "Browse archived employees, restore records, or permanently delete them."
                    : "View and manage active employees, access detailed profiles, archive records, or remove employees when needed."}
            </p>
          </div>
          {/* In Application Generator preview mode, only Cancel/Download/Share
              should show — Add Employee is hidden while visaPreview is set. */}
          {!visaPreview && role !== 3 && (
            <button
              type="button"
              className="btn btn-main text-nowrap align-self-end"
              onClick={() => navigate("/admin/employees/add")}
            >
              Add Employee
            </button>
          )}
        </div>
        {/* 
        {role !== 3 && role !== 5 && (
          <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 w-100 w-md-auto">
            <BackButton onClick={goBack} />
          </div>
        )} */}

        {visaPreview && (
          <div
            className="d-flex flex-nowrap justify-content-end gap-2 mt-sm-0 mt-lg-5 mb-2 mb-sm-0"
            style={{ marginTop: "-1.5rem" }}
          >
            <button
              className="btn btn-outline-secondary fw-bold px-3 px-md-4"
              onClick={handleCancelVisaPreview}
            >
              Cancel
            </button>
            <button
              className="btn btn-main text-white fw-bold px-3 px-md-4"
              onClick={triggerVisaDownload}
            >
              Download
            </button>
            <button
              className="btn btn-outline-main fw-bold px-3 px-md-4"
              onClick={shareVisaOnWhatsapp}
            >
              Share
            </button>
          </div>
        )}
      </div>

      {/* Floating Selection Bar */}
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
      .action-btn-alert:hover:not(:disabled) {
        box-shadow: 0 6px 18px rgba(52, 211, 153, 0.35);
      }
      .action-btn-autofill:hover:not(:disabled) {
        box-shadow: 0 6px 18px rgba(96, 165, 250, 0.35);
      }
      .action-btn-cancel:hover:not(:disabled) {
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
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
                style={{
                  minWidth: "38px",
                  height: "38px",
                  color: "#1e7a34",
                }}
              >
                <i className="bi bi-person-check-fill fs-6"></i>
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
                    {selectedWorkerIds.length}
                  </span>{" "}
                  {selectedWorkerIds.length === 1 ? "employee" : "employees"}{" "}
                  selected
                </p>
              </div>
            </div>

            <div
              className="d-flex flex-row flex-wrap gap-2 w-100 w-md-auto justify-content-md-end align-items-center"
              style={{ fontSize: "13px" }}
            >
              <button
                type="button"
                className="btn btn-outline-success btn-sm rounded-pill px-4 py-3 fw-bold text-nowrap order-2 "
                disabled={selectedWorkerIds.length === 0}
                onClick={handleAutofillSelected}
                style={{ fontSize: "16px" }}
              >
                Autofill
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill px-4 py-3 fw-bold text-nowrap order-3 "
                disabled={selectedWorkerIds.length === 0}
                onClick={handlePrintInsurance}
                style={{ fontSize: "16px" }}
              >
                Print Insurance
              </button>

              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill px-4 py-3 fw-bold text-nowrap order-4 "
                onClick={handleExitSelection}
                style={{ fontSize: "16px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {visaPreview ? (
        <div className="d-flex">
          <div
            className="border rounded-3"
            style={{ maxWidth: "100%", overflowX: "auto" }}
          >
            <VisaApplicationTemplate
              data={visaPreview.mapped}
              logoSrc={visaPreview.logoSrc}
            />
          </div>
        </div>
      ) : (
        <ListingComponent
          showAvater={true}
          isSelectionMode={isSelectionMode}
          selectedIds={selectedWorkerIds}
          onSelectRow={handleSelectRow}
          onSelectAll={handleSelectAll}
          onRowDoubleClick={handleRowDoubleClick}
          filtersComponent={
            role !== 5 ? (
              <ActiveWorkersFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
              />
            ) : null
          }
          data={workers}
          columns={[
            {
              header: "Name",
              accessor: "full_name",
              render: (row) => <span className="fw-bold">{row.full_name}</span>,
            },
            {
              header: "Phone Number",
              accessor: "phone_number",
            },
            {
              header: "Current Status",
              accessor: "status",
            },
          ]}
          actions={actions}
          emptyState={{
            title:
              role === 5
                ? "No employees is assigned to you yet"
                : isArchivedView
                  ? "No archived employees found"
                  : "No Active employees found",
          }}
          pagination={{
            page,
            limit,
            total: totalItems,
          }}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ActiveWorkers;

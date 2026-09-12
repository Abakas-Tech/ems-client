import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteWorkerStatus,
  getWorkerStatuses,
  updateWorkerStatus,
  createWorkerStatus,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
// Validation for worker status name
const validateWorkerStatusName = (name) => {
  if (!name || !name.trim()) return "Employee status name is required";
  if (name.length < 2)
    return "Employee status name must be at least 2 characters";
  if (name.length > 100)
    return "Employee status name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name))
    return "Employee status name can only contain letters";
  return null;
};

// ADDED — these five statuses are the ones the Worker Report's status
// history logic (Application / Tasheer / Embassy / LMIS QR / LMIS Issued
// columns) matches against by keyword. Surfacing them as one-click
// suggestions here keeps the names consistent with what the report
// expects, instead of relying on everyone typing them the same way.
const SUGGESTED_STATUSES = [
  "Application",
  "Tasheer",
  "Embassy",
  "LMIS QR",
  "LMIS Issued",
];

const WorkerStatus = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const [filter, setFilter] = useState({ name: "" });
  const [workerStatuses, setWorkerStatuses] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  // ADDED — tracks which suggested statuses are mid-create so the chip can
  // show a disabled/loading state without blocking the other chips.
  const [creatingSuggestion, setCreatingSuggestion] = useState(null);
  // Go back to previous page
  const fetchWorkerStatuses = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getWorkerStatuses({
        page,
        limit,
        name: filter.name,
      });
      setWorkerStatuses(response?.data || []);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch {
      console.error("Failed to fetch employee statuses:");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchWorkerStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle renaming a worker status
  const handleRename = async (row, newName) => {
    const error = validateWorkerStatusName(newName);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await updateWorkerStatus(row.id, {
        name: newName,
      });
      addMessage(response?.success, response?.message);
      fetchWorkerStatuses();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilter({ name: "" });
  };

  // Handle deleting a worker status
  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteWorkerStatus(row.id);
          addMessage(response?.success, response?.message);
          fetchWorkerStatuses();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this employee status?",
        confirmText: "Delete",
      },
    );
  };

  const handlePageChange = (newPage) => {
    fetchWorkerStatuses(newPage, pagination.limit);
  };

  // Handle creating a new worker status
  const handleCreate = async (inputValues) => {
    const name = inputValues.name;
    const error = validateWorkerStatusName(name);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await createWorkerStatus({ name });
      addMessage(response?.success, response?.message);
      fetchWorkerStatuses();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // ADDED — one-click create for a suggested status, bypassing the modal
  // since the name is already known and pre-validated by construction.
  // Reuses createWorkerStatus directly (rather than handleCreate) so the
  // per-chip loading state only covers this one request.
  const handleCreateSuggested = async (name) => {
    setCreatingSuggestion(name);
    showLoader();
    try {
      const response = await createWorkerStatus({ name });
      addMessage(response?.success, response?.message);
      fetchWorkerStatuses();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
      setCreatingSuggestion(null);
    }
  };

  // ADDED — hide a suggestion once a status with that name already exists
  // (case-insensitive) on the currently loaded page, so admins aren't
  // offered to recreate one that's already set up.
  const existingNames = new Set(
    workerStatuses.map((s) => (s.name || "").trim().toLowerCase()),
  );
  const pendingSuggestions = SUGGESTED_STATUSES.filter(
    (name) => !existingNames.has(name.toLowerCase()),
  );

  const columns = [
    {
      header: "Employee Status Name",
      accessor: "name",
      renameable: true,
    },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [{ name: "name", label: "Employee Status Name" }];

  const emptyState = {
    title: "No employee statuses found",
    subtitle: "Add employee statuses to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-6">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
            <div className="mt-0">
              <h2 className="fw-bold text-dark mb-2">Status</h2>
              <p className="text-muted mb-0">
                Manage employee statuses — create, rename, or delete entries as
                needed.
              </p>
            </div>
            <button
              className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
              onClick={() => setShowCreateModal(true)}
              style={{ whiteSpace: "nowrap" }}
            >
              + Status
            </button>
          </div>

          {/* ADDED — suggested statuses used by the Worker Report's
              status-history columns (Application, Tasheer, Embassy,
              LMIS QR, LMIS Issued). Only shows the ones not yet created. */}
          {pendingSuggestions.length > 0 && (
            <div className="mb-4">
              <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                Suggested (used by the Worker Report):
              </p>
              <div className="d-flex flex-wrap gap-2">
                {pendingSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill"
                    disabled={creatingSuggestion === name}
                    onClick={() => handleCreateSuggested(name)}
                  >
                    {creatingSuggestion === name ? "Adding…" : `+ ${name}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ListingComponent
            data={workerStatuses}
            columns={columns}
            actions={actions}
            emptyState={emptyState}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
            }}
            onPageChange={handlePageChange}
            filtersComponent={
              <MetaFilter
                filter={filter}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            }
          />

          <CreateModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
            fields={fields}
            title="Create New Employee Status"
          />
        </div>
      </div>
    </div>
  );
};

export default WorkerStatus;

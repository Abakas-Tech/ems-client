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

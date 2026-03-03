import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteJobPosition,
  getJobPositions,
  updateJobPosition,
  createJobPosition,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import CreateMetaModal from "../CreateMetaModal/CreateMetaModal";

// Validation for job position name
const validateJobPositionName = (name) => {
  if (!name || !name.trim()) return "Job position name is required";
  if (name.length < 2) return "Job position name must be at least 2 characters";
  if (name.length > 100)
    return "Job position name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name))
    return "Job position name can only contain letters";
  return null;
};

const JobPosition = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [jobPositions, setJobPositions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchJobPositions = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getJobPositions({ page, limit });
      setJobPositions(response?.data || []);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchJobPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle renaming a job position
  const handleRename = async (row, newName) => {
    const error = validateJobPositionName(newName);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await updateJobPosition(row.id, {
        name: newName,
      });
      addMessage(response?.success, response?.message);
      fetchJobPositions();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // Handle deleting a job position
  const handleDelete = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteJobPosition(row.id);
        addMessage(response?.success, response?.message);
        fetchJobPositions();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  const handlePageChange = (newPage) => {
    fetchJobPositions(newPage, pagination.limit);
  };

  // Handle creating a new job position
  const handleCreate = async (inputValues) => {
    const name = inputValues.name;
    const error = validateJobPositionName(name);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await createJobPosition({ name });
      addMessage(response?.success, response?.message);
      fetchJobPositions();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    {
      header: "Job Position Name",
      accessor: "name",
      renameable: true,
    },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [{ name: "name", label: "Job Position Name" }];

  const emptyState = {
    title: "No job positions found",
    subtitle: "Add job positions to see them listed here",
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h2 className="fw-bold text-dark mb-2">Job Position Management</h2>
          <p className="text-muted mb-0">
            Manage job positions — create, rename, or delete entries as needed.
          </p>
        </div>

        <button
          className="btn btn-main"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Job Position
        </button>
      </div>

      <ListingComponent
        data={jobPositions}
        columns={columns}
        actions={actions}
        emptyState={emptyState}
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
        }}
        onPageChange={handlePageChange}
      />

      <CreateMetaModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        fields={fields}
        title="Create New Job Position"
      />
    </div>
  );
};

export default JobPosition;

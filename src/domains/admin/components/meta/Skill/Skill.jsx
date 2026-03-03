import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteSkill,
  getSkills,
  updateSkill,
  createSkill,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import CreateMetaModal from "../CreateMetaModal/CreateMetaModal";

// Validation for skill name
const validateSkillName = (name) => {
  if (!name || !name.trim()) return "Skill name is required";
  if (name.length < 2) return "Skill name must be at least 2 characters";
  if (name.length > 100) return "Skill name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name)) return "Skill name can only contain letters";
  return null;
};

const Skill = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [skills, setSkills] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchSkills = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getSkills({ page, limit });
      setSkills(response?.data || []);
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
    fetchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle renaming a skill
  const handleRename = async (row, newName) => {
    const error = validateSkillName(newName);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await updateSkill(row.id, { name: newName });
      addMessage(response?.success, response?.message);
      fetchSkills();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // Handle deleting a skill
  const handleDelete = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteSkill(row.id);
        addMessage(response?.success, response?.message);
        fetchSkills();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  const handlePageChange = (newPage) => {
    fetchSkills(newPage, pagination.limit);
  };

  // Handle creating a new skill
  const handleCreate = async (inputValues) => {
    const name = inputValues.name;
    const error = validateSkillName(name);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await createSkill({ name });
      addMessage(response?.success, response?.message);
      fetchSkills();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    {
      header: "Skill Name",
      accessor: "name",
      renameable: true,
    },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [{ name: "name", label: "Skill Name" }];

  const emptyState = {
    title: "No skills found",
    subtitle: "Add skills to see them listed here",
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <h2 className="fw-bold text-dark mb-2">Skill Management</h2>
          <p className="text-muted mb-0">
            Manage skills — create, rename, or delete entries as needed.
          </p>
        </div>

        <button
          className="btn btn-main"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Skill
        </button>
      </div>

      <ListingComponent
        data={skills}
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
        title="Create New Skill"
      />
    </div>
  );
};

export default Skill;

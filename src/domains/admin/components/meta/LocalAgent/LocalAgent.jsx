import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteAgent,
  getAgents,
  updateAgent,
  createAgent,
} from "../../../api/workerAgent.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";

// Validation for agent name
const validateAgentName = (name) => {
  if (!name || !name.trim()) return "Agent name is required";
  if (name.length < 2) return "Agent name must be at least 2 characters";
  if (name.length > 150) return "Agent name cannot exceed 150 characters";
  return null;
};

// Validation for agent phone
const validateAgentPhone = (phone) => {
  if (!phone || !phone.trim()) return "Agent phone is required";
  if (phone.length < 7) return "Agent phone must be at least 7 characters";
  if (phone.length > 50) return "Agent phone cannot exceed 50 characters";
  return null;
};

const LocalAgent = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const [filter, setFilter] = useState({ name: "" });
  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Go back to previous page
  const fetchAgents = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getAgents({
        page,
        limit,
        name: filter.name,
      });
      setAgents(response?.data || []);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch {
      console.error("Failed to fetch agents:");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle renaming an agent field (name or phone)
  const handleRename = async (row, newValue, field = "agent_name") => {
    const error =
      field === "agent_phone"
        ? validateAgentPhone(newValue)
        : validateAgentName(newValue);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await updateAgent(row.id, {
        [field]: newValue,
      });
      addMessage(response?.success, response?.message);
      fetchAgents();
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

  // Handle deleting an agent
  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteAgent(row.id);
          addMessage(response?.success, response?.message);
          fetchAgents();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this agent?",
        confirmText: "Delete",
      },
    );
  };

  const handlePageChange = (newPage) => {
    fetchAgents(newPage, pagination.limit);
  };

  // Handle creating a new agent
  const handleCreate = async (inputValues) => {
    const { agent_name, agent_phone } = inputValues;

    const nameError = validateAgentName(agent_name);
    if (nameError) {
      addMessage(false, nameError);
      return;
    }

    const phoneError = validateAgentPhone(agent_phone);
    if (phoneError) {
      addMessage(false, phoneError);
      return;
    }

    showLoader();
    try {
      const response = await createAgent({ agent_name, agent_phone });
      addMessage(response?.success, response?.message);
      fetchAgents();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    {
      header: "Agent Name",
      accessor: "agent_name",
      renameable: true,
    },
    {
      header: "Agent Phone",
      accessor: "agent_phone",
      renameable: true,
    },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [
    { name: "agent_name", label: "Agent Name" },
    { name: "agent_phone", label: "Agent Phone" },
  ];

  const emptyState = {
    title: "No agents found",
    subtitle: "Add agents to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-6">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
            <div className="mt-0">
              <h2 className="fw-bold text-dark mb-2">Local Agents</h2>
              <p className="text-muted mb-0">
                Manage agents — create, rename, or delete entries as needed.
              </p>
            </div>
            <button
              className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
              onClick={() => setShowCreateModal(true)}
              style={{ whiteSpace: "nowrap" }}
            >
              + Agent
            </button>
          </div>

          <ListingComponent
            data={agents}
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
            title="Create New Agent"
          />
        </div>
      </div>
    </div>
  );
};

export default LocalAgent;

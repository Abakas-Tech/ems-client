import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteWoreda,
  getWeredas,
  updateWoreda,
  createWoreda,
  getRegions,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

// Validation for Woreda name and region
const validateWoreda = (name, regionId) => {
  if (!name || !name.trim()) return "Woreda name is required";
  if (name.length < 2) return "Woreda name must be at least 2 characters";
  if (name.length > 100) return "Woreda name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name))
    return "Woreda name can only contain letters";
  if (!regionId) return "Region must be selected";
  return null;
};

const Wereda = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [filter, setFilter] = useState({ name: "", region_id: "" });
  const [Weredas, setWeredas] = useState([]);
  const [regions, setRegions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Go back to previous page
  const goBack = () => navigate(-1);

  // Fetch Weredas
  const fetchWeredas = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getWeredas({ ...filter, page, limit });
      setWeredas(response?.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || response?.data?.length || 0,
      });
    } catch {
      console.error("Failed to fetch Weredas:");
    } finally {
      hideLoader();
    }
  };

  // Fetch regions
  const fetchRegions = async () => {
    try {
      const response = await getRegions({ page: 1, limit: 100 });
      setRegions(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  useEffect(() => {
    fetchRegions();
    fetchWeredas();
  }, [filter]);

  // Rename Woreda
  const handleRename = async (row, newName) => {
    const error = validateWoreda(newName, row.region_id);
    if (error) return addMessage(false, error);

    showLoader();
    try {
      const response = await updateWoreda(row.id, {
        name: newName,
        region_id: row.region_id,
      });
      addMessage(response?.success, response?.message);
      fetchWeredas();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };
  const handleClearFilters = () => setFilter({ name: "", region_id: "" });

  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteWoreda(row.id);
          addMessage(response?.success, response?.message);
          fetchWeredas();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this woreda?",
        confirmText: "Delete",
      },
    );
  };

  const handlePageChange = (newPage) => fetchWeredas(newPage, pagination.limit);

  const handleCreate = async (inputValues) => {
    const { name, region_id } = inputValues;
    const error = validateWoreda(name, region_id);
    if (error) return addMessage(false, error);

    showLoader();
    try {
      const response = await createWoreda({ name, region_id });
      addMessage(response?.success, response?.message);
      fetchWeredas();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    { header: "Woreda Name", accessor: "name", renameable: true },
    { header: "Region", accessor: "region_name" },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [
    {
      name: "region_id",
      label: "Region",
      type: "select",
      options: regions.map((r) => ({ value: r.id, label: r.name })),
    },
    { name: "name", label: "Woreda Name" },
  ];

  const extraField = {
    name: "region_id",
    label: "Region",
    type: "select",
    options: regions.map((r) => ({ value: r.id, label: r.name })),
  };

  const emptyState = {
    title: "No Weredas found",
    subtitle: "Add Weredas to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-8">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h2 className="fw-bold text-dark mb-2">Weredas</h2>
              <p className="text-muted mb-0">
                Manage Weredas — create, rename, or delete entries as needed.
              </p>
            </div>
            <div className="position-absolute top-0 end-0 mt-4 pt-2">
              <BackButton onClick={goBack} />
            </div>
            <button
              className="btn btn-main mt-3 mt-md-5 text-white w-45 d-flex align-items-center justify-content-center"
              onClick={() => setShowCreateModal(true)}
            >
              + Woreda
            </button>
          </div>

          <ListingComponent
            data={Weredas}
            columns={columns}
            actions={actions}
            emptyState={emptyState}
            pagination={pagination}
            onPageChange={handlePageChange}
            filtersComponent={
              <MetaFilter
                filter={filter}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                extraField={extraField}
              />
            }
          />

          <CreateModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
            fields={fields}
            title="Create New Woreda"
          />
        </div>
      </div>
    </div>
  );
};

export default Wereda;

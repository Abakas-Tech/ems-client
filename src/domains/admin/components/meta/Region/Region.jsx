import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteRegion,
  getRegions,
  updateRegion,
  createRegion,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import { useNavigate } from "react-router-dom";
import BackButton from "./../../../../../shared/components/BackButton/BackButton";

// Validation for region name
const validateRegionName = (name) => {
  if (!name || !name.trim()) return "Region name is required";
  if (name.length < 2) return "Region name must be at least 2 characters";
  if (name.length > 100) return "Region name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name))
    return "Region name can only contain letters";
  return null;
};

const Region = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const [filter, setFilter] = useState({ name: "" });
  const [regions, setRegions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Go back to previous page
  const goBack = () => {
    navigate(-1);
  };

  const fetchRegions = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getRegions({ page, limit, name: filter.name });
      setRegions(response?.data || []);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
      });
    } catch {
   console.error("Failed to fetch regions:");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchRegions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle renaming a region
  const handleRename = async (row, newName) => {
    const error = validateRegionName(newName);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await updateRegion(row.id, { name: newName });
      addMessage(response?.success, response?.message);
      fetchRegions();
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

  // Handle deleting a region
  const handleDelete = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteRegion(row.id);
        addMessage(response?.success, response?.message);
        fetchRegions();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    },
  {
    title: "Are you sure you want to delete this region?",
    confirmText: "Delete",
  });
  };

  const handlePageChange = (newPage) => {
    fetchRegions(newPage, pagination.limit);
  };

  // Handle creating a new region
  const handleCreate = async (inputValues) => {
    const name = inputValues.name;
    const error = validateRegionName(name);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await createRegion({ name });
      addMessage(response?.success, response?.message);
      fetchRegions();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    {
      header: "Region Name",
      accessor: "name",
      renameable: true,
    },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [{ name: "name", label: "Region Name" }];

  const emptyState = {
    title: "No regions found",
    subtitle: "Add regions to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-6">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h2 className="fw-bold text-dark mb-2">Regions</h2>
              <p className="text-muted mb-0">
                Manage regions — create, rename, or delete entries as needed.
              </p>
            </div>
            <div className="position-absolute top-0 end-0 mt-4 pt-2">
              <BackButton onClick={goBack} />
            </div>
            <button
              className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
              onClick={() => setShowCreateModal(true)}
            >
              + Region
            </button>
          </div>

          <ListingComponent
            data={regions}
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

          {/* Create Region Modal */}
          <CreateModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
            fields={fields}
            title="Create New Region"
          />
        </div>
      </div>
    </div>
  );
};

export default Region;

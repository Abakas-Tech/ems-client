import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteSubCity,
  getSubCities,
  updateSubCity,
  createSubCity,
  getCities,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

// Validation for Sub-City name and city
const validateSubCity = (name, cityId) => {
  if (!name || !name.trim()) return "Sub-City name is required";
  if (name.length < 2) return "Sub-City name must be at least 2 characters";
  if (name.length > 100) return "Sub-City name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name))
    return "Sub-City name can only contain letters";
  if (!cityId) return "City must be selected";
  return null;
};

const SubCity = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [filter, setFilter] = useState({ name: "", city_id: "" });
  const [subCities, setSubCities] = useState([]);
  const [cities, setCities] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Go back to previous page
  const goBack = () => navigate(-1);

  // Fetch Sub-Cities
  const fetchSubCities = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getSubCities({ ...filter, page, limit });
      setSubCities(response?.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || response?.data?.length || 0,
      });
    } catch {
      console.error("Failed to fetch sub-cities:");
    } finally {
      hideLoader();
    }
  };

  // Fetch cities for dropdown
  const fetchCities = async () => {
    try {
      const response = await getCities({ page: 1, limit: 100 });
      setCities(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchSubCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle Sub-City rename
  const handleRename = async (row, newName) => {
    const error = validateSubCity(newName, row.city_id);
    if (error) return addMessage(false, error);

    showLoader();
    try {
      const response = await updateSubCity(row.id, {
        name: newName,
        city_id: row.city_id,
      });
      addMessage(response?.success, response?.message);
      fetchSubCities();
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

  const handleClearFilters = () => setFilter({ name: "", city_id: "" });

  // Handle delete Sub-City
  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteSubCity(row.id);
          addMessage(response?.success, response?.message);
          fetchSubCities();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this sub-city?",
        confirmText: "Delete",
      },
    );
  };

  // Handle page change
  const handlePageChange = (newPage) =>
    fetchSubCities(newPage, pagination.limit);

  // Handle create Sub-City
  const handleCreate = async (inputValues) => {
    const { name, city_id } = inputValues;
    const error = validateSubCity(name, city_id);
    if (error) return addMessage(false, error);

    showLoader();
    try {
      const response = await createSubCity({ name, city_id });
      addMessage(response?.success, response?.message);
      fetchSubCities();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    { header: "Sub-City Name", accessor: "name", renameable: true },
    { header: "City", accessor: "city_name" },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [
    {
      name: "city_id",
      label: "City",
      type: "select",
      options: cities.map((c) => ({ value: c.id, label: c.name })),
    },
    { name: "name", label: "Sub-City Name" },
  ];

  const extraField = {
    name: "city_id",
    label: "City",
    type: "select",
    options: cities.map((c) => ({ value: c.id, label: c.name })),
  };

  const emptyState = {
    title: "No sub-cities found",
    subtitle: "Add sub-cities to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-8">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h2 className="fw-bold text-dark mb-2">Sub-Cities</h2>
              <p className="text-muted mb-0">
                Manage sub-cities — create, rename, or delete entries as needed.
              </p>
            </div>
            <div className="position-absolute top-0 end-0 mt-4 pt-2">
              <BackButton onClick={goBack} />
            </div>

            <button
              className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
              onClick={() => setShowCreateModal(true)}
            >
              + Sub-City
            </button>
          </div>
          <div> </div>

          <ListingComponent
            data={subCities}
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
            title="Create New Sub-City"
          />
        </div>
      </div>
    </div>
  );
};

export default SubCity;

import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteCity,
  getCities,
  updateCity,
  createCity,
  getRegions,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

// Validation for city name and region
const validateCity = (name, regionId) => {
  if (!name || !name.trim()) return "City name is required";
  if (name.length < 2) return "City name must be at least 2 characters";
  if (name.length > 100) return "City name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name)) return "City name can only contain letters";
  if (!regionId) return "Region must be selected";
  return null;
};

const City = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [filter, setFilter] = useState({ name: "", region_id: "" });
  const [cities, setCities] = useState([]);
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
  // Fetch cities
  const fetchCities = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getCities({ ...filter, page, limit });
      setCities(response?.data || []);
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
        total: response.pagination?.total || response?.data?.length || 0,
      });
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // Fetch regions for dropdown
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
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle city rename
  const handleRename = async (row, newName) => {
    const error = validateCity(newName, row.region_id);
    if (error) return addMessage(false, error);

    showLoader();
    try {
      const response = await updateCity(row.id, {
        name: newName,
        region_id: row.region_id,
      });
      addMessage(response?.success, response?.message);
      fetchCities();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => setFilter({ name: "", region_id: "" });

  // Handle delete city
  const handleDelete = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteCity(row.id);
        addMessage(response?.success, response?.message);
        fetchCities();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  // Handle page change
  const handlePageChange = (newPage) => fetchCities(newPage, pagination.limit);

  // Handle create city
  const handleCreate = async (inputValues) => {
    const { name, region_id } = inputValues;
    const error = validateCity(name, region_id);
    if (error) return addMessage(false, error);

    showLoader();
    try {
      const response = await createCity({ name, region_id });
      addMessage(response?.success, response?.message);
      fetchCities();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    { header: "City Name", accessor: "name", renameable: true },
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
    { name: "name", label: "City Name" },
  ];
  const extraField = {
    name: "region_id",
    label: "Region",
    type: "select",
    options: regions.map((r) => ({ value: r.id, label: r.name })),
  };
  const emptyState = {
    title: "No cities found",
    subtitle: "Add cities to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-8">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h2 className="fw-bold text-dark mb-2">City Management</h2>
              <p className="text-muted mb-0">
                Manage cities — create, rename, or delete entries as needed.
              </p>
            </div>
            <div className="position-absolute top-0 end-0 mt-2">
              <BackButton onClick={goBack} />
            </div>
            <button
              className="btn btn-main w-40 w-auto m-4"
              onClick={() => setShowCreateModal(true)}
            >
              + City
            </button>
          </div>

          <ListingComponent
            data={cities}
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

          {/* Create City Modal */}
          <CreateModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
            fields={fields}
            title="Create New City"
          />
        </div>
      </div>
    </div>
  );
};

export default City;

import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteCity,
  getCities,
  updateCity,
  createCity,
  getWeredas, //  changed
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

//  Validation updated
const validateCity = (name, weredaId) => {
  if (!name || !name.trim()) return "City name is required";
  if (name.length < 2) return "City name must be at least 2 characters";
  if (name.length > 100) return "City name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name)) return "City name can only contain letters";
  if (!weredaId) return "Woreda must be selected"; //  label changed
  return null;
};

const City = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  // filter updated
  const [filter, setFilter] = useState({ name: "", wereda_id: "" });

  const [cities, setCities] = useState([]);

  // renamed
  const [weredas, setWeredas] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const goBack = () => navigate(-1);

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
    } catch {
      console.error("Failed to fetch cities:");
    } finally {
      hideLoader();
    }
  };

  // Fetch weredas instead of regions
  const fetchWeredas = async () => {
    try {
      const response = await getWeredas({ page: 1, limit: 100 });
      setWeredas(response?.data || []);
    } catch (err) {
      addMessage(false, err.message);
    }
  };

  useEffect(() => {
    fetchWeredas(); // changed
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle rename
  const handleRename = async (row, newName) => {
    const error = validateCity(newName, row.wereda_id);
    if (error) return addMessage(false, error);

    showLoader();
    try {
      const response = await updateCity(row.id, {
        name: newName,
        wereda_id: row.wereda_id, // ✅ changed
      });
      addMessage(response?.success, response?.message);
      fetchCities();
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

  // clear updated
  const handleClearFilters = () => setFilter({ name: "", wereda_id: "" });

  const handleDelete = (row) => {
    openModal(
      async () => {
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
      },
      {
        title: "Are you sure you want to delete this city?",
        confirmText: "Delete",
      },
    );
  };

  const handlePageChange = (newPage) => fetchCities(newPage, pagination.limit);

  // Handle create
  const handleCreate = async (inputValues) => {
    const { name, wereda_id } = inputValues;

    const error = validateCity(name, wereda_id);
    if (error) return addMessage(false, error);

    showLoader();
    try {
      const response = await createCity({ name, wereda_id }); // changed
      addMessage(response?.success, response?.message);
      fetchCities();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  //columns updated
  const columns = [
    { header: "City Name", accessor: "name", renameable: true },
    { header: "Woreda", accessor: "wereda_name" }, // changed
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  //fields updated
  const fields = [
    {
      name: "wereda_id",
      label: "Woreda",
      type: "select",
      options: weredas.map((w) => ({
        value: w.id,
        label: w.name,
      })),
    },
    { name: "name", label: "City Name" },
  ];

  const extraField = {
    name: "wereda_id",
    label: "Woreda",
    type: "select",
    options: weredas.map((w) => ({
      value: w.id,
      label: w.name,
    })),
  };

  const emptyState = {
    title: "No cities found",
    subtitle: "Add cities to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-8">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4 gap-3">
            <div className="mt-0">
              <h2 className="fw-bold text-dark mb-2">Cities</h2>
              <p className="text-muted mb-0">
                Manage cities — create, rename, or delete entries as needed.
              </p>
            </div>

            <div className="position-absolute top-0 end-0 mt-4 pt-2">
              <BackButton onClick={goBack} />
            </div>

            <button
              className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
              onClick={() => setShowCreateModal(true)}
            >
              + City
            </button>
          </div>
          <div></div>

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

import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteCountry,
  getCountries,
  updateCountry,
  createCountry,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

// Validation for country name
const validateCountryName = (name) => {
  if (!name || !name.trim()) return "Country name is required";
  if (name.length < 3) return "Country name must be at least 3 characters";
  if (name.length > 100) return "Country name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name))
    return "Country name can only contain letters";
  return null;
};
const Country = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [filter, setFilter] = useState({ name: "" });

  const [countries, setCountries] = useState([]);
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

  const fetchCountries = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getCountries({ page, limit, name: filter.name });
      setCountries(response?.data || []);
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
    fetchCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle renaming a country
  const handleRename = async (row, newName) => {
    const error = validateCountryName(newName);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await updateCountry(row.id, { name: newName });
      addMessage(response?.success, response?.message);
      fetchCountries();
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

  // Handle deleting a country
  const handleDelete = (row) => {
    openModal(
      async () => {
        showLoader();
        try {
          const response = await deleteCountry(row.id);
          addMessage(response?.success, response?.message);
          fetchCountries();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Are you sure you want to delete this country?",
        confirmText: "Delete",
      },
    );
  };
  const handlePageChange = (newPage) => {
    fetchCountries(newPage, pagination.limit);
  };

  // Handle creating a new country
  const handleCreate = async (inputValues) => {
    const name = inputValues.name;
    const error = validateCountryName(name);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await createCountry({ name });
      addMessage(response?.success, response?.message);
      fetchCountries();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    {
      header: "Country Name",
      accessor: "name",
      renameable: true,
    },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [{ name: "name", label: "Country Name" }];
  const emptyState = {
    title: "No countries found",
    subtitle: "Add countries to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-6">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h2 className="text-dark mb-2">Country</h2>
              <p className="text-muted mb-0">
                Manage countries — create, rename, or delete entries as needed.
              </p>
            </div>
            <div className="position-absolute top-0 end-0 mt-4 pt-2">
              <BackButton onClick={goBack} />
            </div>
            <button
              className="btn btn-main mt-3 mt-md-5  text-white w-45 d-flex align-items-center justify-content-center"
              onClick={() => setShowCreateModal(true)}
            >
              + Country
            </button>
          </div>

          <ListingComponent
            data={countries}
            columns={columns}
            actions={actions}
            emptyState={emptyState}
            // fewColumns={true}
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

          {/* Create Country Modal */}
          <CreateModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreate}
            fields={fields}
            title="Create New Country"
          />
        </div>
      </div>
    </div>
  );
};

export default Country;

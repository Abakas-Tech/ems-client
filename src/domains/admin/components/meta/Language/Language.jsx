import { useState, useEffect } from "react";
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import {
  deleteLanguage,
  getLanguages,
  updateLanguage,
  createLanguage,
} from "../../../api/meta.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";
import MetaFilter from "../MetaFilter/MetaFilter";
import CreateModal from "../../../../../shared/components/CreateModal/CreateModal";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

// Validation for language name
const validateLanguageName = (name) => {
  if (!name || !name.trim()) return "Language name is required";
  if (name.length < 2) return "Language name must be at least 2 characters";
  if (name.length > 100) return "Language name cannot exceed 100 characters";
  if (!/^[A-Za-z\s]+$/.test(name))
    return "Language name can only contain letters";
  return null;
};

const Language = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const [filter, setFilter] = useState({ name: "" });
  const [languages, setLanguages] = useState([]);
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

  const fetchLanguages = async (page = 1, limit = 10) => {
    showLoader();
    try {
      const response = await getLanguages({ page, limit, name: filter.name });
      setLanguages(response?.data || []);
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
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle renaming a language
  const handleRename = async (row, newName) => {
    const error = validateLanguageName(newName);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await updateLanguage(row.id, {
        name: newName,
      });
      addMessage(response?.success, response?.message);
      fetchLanguages();
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

  // Handle deleting a language
  const handleDelete = (row) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteLanguage(row.id);
        addMessage(response?.success, response?.message);
        fetchLanguages();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  const handlePageChange = (newPage) => {
    fetchLanguages(newPage, pagination.limit);
  };

  // Handle creating a new language
  const handleCreate = async (inputValues) => {
    const name = inputValues.name;
    const error = validateLanguageName(name);
    if (error) {
      addMessage(false, error);
      return;
    }

    showLoader();
    try {
      const response = await createLanguage({ name });
      addMessage(response?.success, response?.message);
      fetchLanguages();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const columns = [
    {
      header: "Language Name",
      accessor: "name",
      renameable: true,
    },
  ];

  const actions = [
    { type: "rename", onClick: handleRename },
    { type: "delete", onClick: handleDelete },
  ];

  const fields = [{ name: "name", label: "Language Name" }];

  const emptyState = {
    title: "No languages found",
    subtitle: "Add languages to see them listed here",
  };

  return (
    <div className="row">
      <div className="col-12 col-lg-6">
        <div className="dashboard-wraper">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="flex-grow-1">
              <h2 className="fw-bold text-dark mb-2">Language</h2>
              <p className="text-muted mb-0">
                Manage languages — create, rename, or delete entries as needed.
              </p>
            </div>

            <div className="position-absolute top-0 end-0 mt-2">
              <BackButton onClick={goBack} />
            </div>
            <button
              className="btn btn-main w-40 w-auto m-4"
              onClick={() => setShowCreateModal(true)}
            >
              + Language
            </button>
          </div>

          <ListingComponent
            data={languages}
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
            title="Create New Language"
          />
        </div>
      </div>
    </div>
  );
};

export default Language;

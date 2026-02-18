import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmployerList from "../../components/Employer/EmployerList";
import EmployerFilters from "../../components/Employer/EmployerFilters";
import { getEmployers, deleteEmployer } from "../../api/employer.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useConfirmDelete } from "../../../../context/Delete/UseDelete";

const EmployersPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useConfirmDelete();
  const navigate = useNavigate();

  const [employers, setEmployers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    is_active: "",
  });

  // FETCH EMPLOYERS
  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        const cleanFilters = {};
        if (filters.search) cleanFilters.search = filters.search;
        if (filters.country) cleanFilters.country = filters.country;
        if (filters.is_active !== "")
          cleanFilters.is_active = filters.is_active === "true" ? 1 : 0;

        const response = await getEmployers(cleanFilters);
        console.log(response)
        setEmployers(response?.data || response || []);
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    };

    fetchData();
  }, [filters]);

  // FILTER HANDLERS
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      country: "",
      is_active: "",
    });
  };

  // DELETE
  const handleDelete = (id) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteEmployer(id);
        addMessage(response?.success, response?.message);

        // Refetch with current filters
        const refreshed = await getEmployers({
          ...filters,
          is_active:
            filters.is_active === ""
              ? undefined
              : filters.is_active === "true"
                ? 1
                : 0,
        });
        setEmployers(refreshed?.data || refreshed || []);
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  // EDIT
  const handleEdit = (employer) => {
    navigate("/admin/create-employer", {
      state: { isEditMode: true, employerData: employer },
    });
  };

  // NAVIGATE TO CREATE
  const handleCreateEmployer = () => {
    navigate("/admin/create-employer", { state: { isEditMode: false } });
  };

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2">Employer Management</h2>
          <p className="text-muted mb-0">
            Manage employers — filter, edit, and delete records.
          </p>
        </div>
        <div>
          <button className="btn btn-main" onClick={handleCreateEmployer}>
            + Create Employer
          </button>
        </div>
      </div>

      {/* Filters */}
      <EmployerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Employer List */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          <EmployerList
            employers={employers}
            onDelete={handleDelete}
            onUpdate={handleEdit} // pass edit handler
          />
        </div>
      </div>
    </div>
  );
};

export default EmployersPage;

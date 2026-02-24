import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserList from "../../components/Users/UserList";
import UserFilters from "../../components/Users/UserFilters";
import user from "../../api/user.api";
import  permission  from "../../api/permission.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useConfirmDelete } from "../../../../context/Delete/UseDelete";

const UsersPage = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useConfirmDelete();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    role_id: "",
    is_active: "",
  });


  // FETCH USERS
  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        const cleanFilters = {};
        if (filters.search) cleanFilters.search = filters.search;
        if (filters.role_id) cleanFilters.role_id = filters.role_id;
        if (filters.is_active !== "")
          cleanFilters.is_active = filters.is_active === "true" ? 1 : 0;

        const response = await user.getUsers(cleanFilters);
        setUsers(response?.data || response || []);
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
      role_id: "",
      is_active: "",
    });
  };


  // DELETE
  const handleDelete = (id) => {
    openModal(async () => {
      showLoader();
      try {
        const response = await user.deleteUser(id);
        addMessage(response?.success, response?.message);

        // Refetch with current filters
        const refreshed = await user.getUsers({
          ...filters,
          is_active:
            filters.is_active === ""
              ? undefined
              : filters.is_active === "true"
                ? 1
                : 0,
        });
        setUsers(refreshed?.data || refreshed || []);
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };


  // EDIT
  const handleEdit = async (user) => {
    showLoader();
    try {
      const permResponse = await permission.getPermission(user.id);
      const userDataWithPermissions = {
        ...user,
        permissions: permResponse?.data || [],
      };  
      ;
   
      navigate("/admin/create-user", {
        state: { isEditMode: true, userData: userDataWithPermissions },
      });
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // NAVIGATE TO CREATE
  const handleCreateUser = () => {
    navigate("/admin/create-user", { state: { isEditMode: false } });
  };

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-2">User Management</h2>
          <p className="text-muted mb-0">
            Manage employees and partners — filter and control users.
          </p>
        </div>
        <div>
          <button className="btn btn-main" onClick={handleCreateUser}>
            + Create User
          </button>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* User List */}
      <div className="card shadow-sm mb-4">
        <div className="card-body p-0">
          <UserList
            users={users}
            onDelete={handleDelete}
            onUpdate={handleEdit} // pass edit handler
          />
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

import React, { useState, useEffect } from "react";
import user from "../../api/user.api";
import permission from "../../api/permission.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useNavigate } from "react-router-dom";

const PERMISSIONS = [
  "manage_users",
  "manage_workers",
  "manage_partners",
  "manage_finance",
  "manage_analytics",
  "manage_system_settings",
  "manage_audit_logs",
];

const CreateUser = ({ isEditMode = false, userData = null }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const handleBack = () => {
    navigate("/admin/user-management");
  };

  // Prefill data in Update Mode
  useEffect(() => {
    if (isEditMode && userData) {
      setFullName(userData.full_name || "");
      setEmail(userData.email || "");
      setPhoneNumber(userData.phone_number || "");
      setRole(String(userData.role_id || ""));
      setCountry(userData.country || "");
      setNationalId(userData.national_id || "");
      setCity(userData.city || "");
      setAddress(userData.address || "");

      if (userData.permissions && userData.permissions.length > 0) {
        const permissionObject = userData.permissions[0];
        const activePermissions = PERMISSIONS.filter(
          (perm) => permissionObject[perm] === 1,
        );
        setSelectedPermissions(activePermissions);
        setOriginalPermissions(activePermissions); // Track original
      }
    }
  }, [isEditMode, userData]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setRole("");
    setCountry("");
    setNationalId("");
    setCity("");
    setAddress("");
    setSelectedPermissions([]);
    setSelectAll(false);
  };

  const handlePhoneChange = (value) => {
    const numericValue = value.replace(/\D/g, "");
    setPhoneNumber(numericValue);
  };

  const togglePermission = (permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(
        selectedPermissions.filter((p) => p !== permission),
      );
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPermissions([]);
      setSelectAll(false);
    } else {
      setSelectedPermissions(PERMISSIONS);
      setSelectAll(true);
    }
  };

  useEffect(() => {
    setSelectAll(selectedPermissions.length === PERMISSIONS.length);
  }, [selectedPermissions]);

  const validateFields = () => {
    if (!fullName) {
      addMessage(false, "Full name is required.");
      return false;
    }

    if (!email) {
      addMessage(false, "Email is required.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      addMessage(false, "Please enter a valid email address.");
      return false;
    }

    if (!phoneNumber) {
      addMessage(false, "Phone number is required.");
      return false;
    }

    if (!role) {
      addMessage(false, "Role is required.");
      return false;
    }

    if ((role === "3" || role === "5") && !country) {
      addMessage(false, "Country is required.");
      return false;
    }

    // Employer-specific validation
    if (role === "5") {
      if (!nationalId) {
        addMessage(false, "National ID is required for employer.");
        return false;
      }
      if (!city) {
        addMessage(false, "City is required for employer.");
        return false;
      }
      if (!address) {
        addMessage(false, "Address is required for employer.");
        return false;
      }
    }

    // Employee permission validation
    if (role === "2" && selectedPermissions.length === 0) {
      addMessage(false, "At least one permission must be selected.");
      hideLoader();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    showLoader();

    try {
      const payload = {
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        role: Number(role),
        country: role === "3" || role === "5" ? country : undefined,
        national_id: role === "5" ? nationalId : undefined,
        city: role === "5" ? city : undefined,
        address: role === "5" ? address : undefined,
      };

      let response;

      if (isEditMode) {
        response = await user.updateUser(userData.id, payload);
      } else {
        response = await user.createUser(payload);
      }

      if (!response.success) {
        addMessage(false, response.message);
        hideLoader();
        return;
      }

      const userId = isEditMode ? userData.id : response.data?.id;

      // Handle permissions only if Employee
      if (role === "2") {
        const permissionsToGrant = selectedPermissions.filter(
          (perm) => !originalPermissions.includes(perm),
        );
        const permissionsToRevoke = originalPermissions.filter(
          (perm) => !selectedPermissions.includes(perm),
        );

        if (permissionsToGrant.length > 0) {
          await permission.grantPermissions({
            user_id: userId,
            permissions: permissionsToGrant,
          });
        }

        if (permissionsToRevoke.length > 0) {
          await permission.revokePermissions({
            user_id: userId,
            permissions: permissionsToRevoke,
          });
        }

        setOriginalPermissions(selectedPermissions);
      }

      addMessage(true, response.message);
      navigate("/admin/user-management");

      if (!isEditMode) resetForm();
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="fw-bold text-dark mb-2">
              {isEditMode ? "Update User" : "Create New User"}
            </h2>
            <p className="text-muted">
              {isEditMode
                ? "Update user details and permissions."
                : "Add a new employee, partner, or employer and assign permissions."}
            </p>
          </div>

          <button
            type="button"
            onClick={handleBack}
            className="border rounded-circle d-flex align-items-center justify-content-center btn btn-main"
            style={{ width: "40px", height: "40px" }}
          >
            ←
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="submit-section">
            <div className="row">
              {/* Full Name */}
              <div className="form-group col-md-6 mb-3">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="form-group col-md-6 mb-3">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div className="form-group col-md-6 mb-3">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
              </div>

              {/* Role */}
              <div className="form-group col-md-6 mb-3">
                <label>Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="">Select Role</option>
                  <option value="2">Employee</option>
                  <option value="3">Partner</option>
                  <option value="5">Employer</option>
                </select>
              </div>

              {/* Country (Partner + Employer) */}
              {(role === "3" || role === "5") && (
                <div className="form-group col-md-6 mb-3">
                  <label>Country</label>
                  <input
                    type="text"
                    className="form-control"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              )}

              {/* Employer Fields */}
              {role === "5" && (
                <>
                  <div className="form-group col-md-6 mb-3">
                    <label>National ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                    />
                  </div>
                  <div className="form-group col-md-6 mb-3">
                    <label>City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="form-group col-md-12 mb-3">
                    <label>Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Permission Section (Only for Employee) */}
              {role === "2" && (
                <div className="col-12 mt-4">
                  <h5 className="fw-bold">Assign Permissions</h5>
                  <div className="row">
                    {PERMISSIONS.map((permission) => (
                      <div key={permission} className="col-md-4 mb-2">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedPermissions.includes(permission)}
                            onChange={() => togglePermission(permission)}
                          />
                          <label className="form-check-label">
                            {permission}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-end mt-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectAll}
                        onChange={handleSelectAll}
                      />
                      <label className="form-check-label">Check All</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="form-group col-lg-12 text-start mt-4">
                <button type="submit" className="btn btn-main px-5 rounded">
                  {isEditMode ? "Update User" : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;

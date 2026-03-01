import React, { useState, useEffect } from "react";
import { updateUser, createUser } from "../../../api/user.api";
import {
  grantPermissions,
  revokePermissions,
} from "../../../api/permission.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useNavigate } from "react-router-dom";
import BackButton from "./../../../../../shared/components/BackButton/BackButton";

const PERMISSIONS = [
  "manage_users",
  "manage_workers",
  "manage_partners",
  "manage_finance",
  "manage_analytics",
  "manage_system_settings",
  "manage_audit_logs",
];
const PERMISSION_LABELS = {
  manage_users: "Manage Users",
  manage_workers: "Manage Workers",
  manage_partners: "Manage Partners",
  manage_finance: "Manage Finance",
  manage_analytics: "Manage Analytics",
  manage_system_settings: "System Settings",
  manage_audit_logs: "Audit Logs",
};

const CreateUserForm = ({ isEditMode = false, userData = null }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("1"); // Active = 1, Inactive = 0
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

  // Prefill data in Edit Mode
  useEffect(() => {
    if (isEditMode && userData) {
      setFullName(userData.full_name || "");
      setEmail(userData.email || "");
      setPhoneNumber(userData.phone_number || "");
      setRole(String(userData.role_id || ""));
      setStatus(
        userData.is_active !== undefined ? String(userData.is_active) : "1",
      );
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
        setOriginalPermissions(activePermissions);
      }
    }
  }, [isEditMode, userData]);

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setRole("");
    setStatus("1");
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

  // Determine which fields are required based on backend schema
  const requiredFields = {
    full_name: !isEditMode,
    email: !isEditMode,
    phone_number: !isEditMode,
    role: !isEditMode,
    country: !isEditMode && (role === "3" || role === "5"),
    national_id: !isEditMode && role === "5",
    city: !isEditMode && role === "5",
    address: !isEditMode && role === "5",
  };

  const validateFields = () => {
    // Full Name: letters only, min 2, max 50
    if (fullName && !/^[A-Za-z\s]+$/.test(fullName)) {
      addMessage(false, "Full name can contain letters only.");
      return false;
    }
    if (fullName && (fullName.length < 2 || fullName.length > 50)) {
      addMessage(false, "Full name must be between 2 and 50 characters.");
      return false;
    }

   if (role !== "5" && (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
     addMessage(
       false,
       !email ? "Email is required." : "Please enter a valid email address.",
     );
     return false;
   }
    // Phone number: digits only, length 7–15
    if (phoneNumber && !/^\d+$/.test(phoneNumber)) {
      addMessage(false, "Phone number can contain digits only.");
      return false;
    }
    if (phoneNumber && (phoneNumber.length < 7 || phoneNumber.length > 15)) {
      addMessage(false, "Phone number must be between 7 and 15 digits.");
      return false;
    }

    // National ID: letters and digits only, length 5–15
    if (nationalId && !/^[A-Za-z0-9]+$/.test(nationalId)) {
      addMessage(false, "National ID can contain letters and digits only.");
      return false;
    }
    if (nationalId && (nationalId.length < 5 || nationalId.length > 15)) {
      addMessage(false, "National ID must be between 5 and 15 characters.");
      return false;
    }

    // City: letters only, max length 50
    if (city && !/^[A-Za-z\s]+$/.test(city)) {
      addMessage(false, "City can contain letters only.");
      return false;
    }
    if (city && city.length > 50) {
      addMessage(false, "City cannot exceed 50 characters.");
      return false;
    }

    // Address: max length 100
    if (address && address.length > 100) {
      addMessage(false, "Address cannot exceed 100 characters.");
      return false;
    }
    if (role === "2" && selectedPermissions.length === 0) {
      addMessage(false, "At least one permission must be selected.");
      return false;
    }
    return true;
  };

  const removeEmptyFields = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(
        // eslint-disable-next-line no-unused-vars
        ([_, value]) => value !== undefined && value !== null && value !== "",
      ),
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    showLoader();
    try {
   let payload = removeEmptyFields({
     full_name: fullName,
     email,
     phone_number: phoneNumber,
     role: Number(role),
     is_active: Number(status),
     country: role === "3" || role === "5" ? country : undefined,
     national_id: role === "5" ? nationalId : undefined,
     city: role === "5" ? city : undefined,
     address: role === "5" ? address : undefined,
   });

      let response = isEditMode
        ? await updateUser(userData.id, payload)
        : await createUser(payload);

      if (!response.success) {
        addMessage(false, response.message);
        hideLoader();
        return;
      }

      const userId = isEditMode ? userData.id : response.data?.id;

      // Employee permission handling
      if (role === "2") {
        const permissionsToGrant = selectedPermissions.filter(
          (perm) => !originalPermissions.includes(perm),
        );
        const permissionsToRevoke = originalPermissions.filter(
          (perm) => !selectedPermissions.includes(perm),
        );

        if (permissionsToGrant.length > 0) {
          await grantPermissions({
            user_id: userId,
            permissions: permissionsToGrant,
          });
        }
        if (permissionsToRevoke.length > 0) {
          await revokePermissions({
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
          <BackButton onClick={handleBack} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="submit-section">
            <div className="row">
              {/* Full Name */}
              <div className="form-group col-md-6 mb-3">
                <label>
                  Full Name{" "}
                  {requiredFields.full_name && (
                    <span className="text-danger">*</span>
                  )}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={fullName}
                  required={requiredFields.full_name}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              {/* Role */}
              <div className="form-group col-md-6 mb-3">
                <label>
                  Role{" "}
                  {requiredFields.role && (
                    <span className="text-danger">*</span>
                  )}
                </label>
                <select
                  className="form-control"
                  value={role}
                  required={requiredFields.role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isEditMode}
                >
                  <option value="">Select Role</option>
                  <option value="2">Employee</option>
                  <option value="3">Partner</option>
                  <option value="5">Employer</option>
                </select>
              </div>

              {/* Phone */}
              <div className="form-group col-md-6 mb-3">
                <label>
                  Phone Number{" "}
                  {requiredFields.phone_number && (
                    <span className="text-danger">*</span>
                  )}
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={phoneNumber}
                  required={requiredFields.phone_number}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                />
              </div>
              {/* Email */}
              <div className="form-group col-md-6 mb-3">
                <label>
                  Email{" "}
                  {role && requiredFields.email && role !== "5" && (
                    <span className="text-danger">*</span>
                  )}
                </label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Status (Edit Mode Only) */}
              {isEditMode && (
                <div className="form-group col-md-6 mb-3">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>
              )}

              {/* Country */}
              {(role === "3" || role === "5") && (
                <div className="form-group col-md-6 mb-3">
                  <label>
                    Country{" "}
                    {requiredFields.country && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={country}
                    required={requiredFields.country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              )}

              {/* Employer Fields */}
              {role === "5" && (
                <>
                  <div className="form-group col-md-6 mb-3">
                    <label>
                      National ID{" "}
                      {requiredFields.national_id && (
                        <span className="text-danger">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={nationalId}
                      required={requiredFields.national_id}
                      onChange={(e) => setNationalId(e.target.value)}
                    />
                  </div>
                  <div className="form-group col-md-6 mb-3">
                    <label>
                      City{" "}
                      {requiredFields.city && (
                        <span className="text-danger">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={city}
                      required={requiredFields.city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="form-group col-md-6 mb-3">
                    <label>
                      Address{" "}
                      {requiredFields.address && (
                        <span className="text-danger">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={address}
                      required={requiredFields.address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </>
              )}

              {/* Employee Permissions */}
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
                            {PERMISSION_LABELS[permission] || permission}
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

export default CreateUserForm;

import React, { useState, useEffect } from "react";
import {
  updateUser,
  createUser,
  uploadPartnerCvHeader,
  uploadPartnerCvHeaderTwo,
} from "../../../api/user.api";
import {
  grantPermissions,
  revokePermissions,
} from "../../../api/permission.api";
import useloader from "../../../../../context/Loader/useLoader";
import { useNavigate } from "react-router-dom";
import BackButton from "./../../../../../shared/components/BackButton/BackButton";
import useResponse from "../../../../../context/Response/useResponse";
import useProfile from "../../../../../context/Profile/useProfile";

const PERMISSIONS = [
  "manage_users",
  "manage_workers",
  "manage_finance",
  "manage_analytics",
  "manage_complaint",
];
const PERMISSION_LABELS = {
  manage_users: "Manage Users",
  manage_workers: "Manage Employees",
  manage_finance: "Manage Finance",
  manage_analytics: "Manage Analytics",
  manage_complaint: "Manage Complaints",
};

const CreateUserForm = ({ isEditMode = false, userData = null }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("1"); // Active = 1, Inactive = 0
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");

  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [partnerCvHeader, setPartnerCvHeader] = useState(null);
  const [existingPartnerCvHeader, setExistingPartnerCvHeader] = useState(null);
  const [partnerCvHeaderTwo, setPartnerCvHeaderTwo] = useState(null);
  const [existingPartnerCvHeaderTwo, setExistingPartnerCvHeaderTwo] =
    useState(null);
  const { profile } = useProfile();
  const userId = profile?.id;
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const handleBack = () => {
    navigate(-1);
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
      setAddress(userData.address || "");

      setExistingPartnerCvHeader(userData.cv_header_url || null);
      setPartnerCvHeader(null);
      setExistingPartnerCvHeaderTwo(userData.cv_header_two_url || null);
      setPartnerCvHeaderTwo(null);
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

    setPartnerCvHeader(null);
    setExistingPartnerCvHeader(null);
    setPartnerCvHeaderTwo(null);
    setExistingPartnerCvHeaderTwo(null);
    setSelectedPermissions([]);
    setSelectAll(false);
  };

  const handlePhoneChange = (value) => {
    const cleanedValue = value.replace(/[^\d+\-\s()]/g, "");
    setPhoneNumber(cleanedValue);
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
    country: !isEditMode && role === "3",
    address: !isEditMode && role === "3",
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

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addMessage(
        false,
        !email ? "Email is required." : "Please enter a valid email address.",
      );
      return false;
    }
    const phoneRegex =
      /^(?:\+?(251|254|974|966|971)[0-9]{7,12}|0[179][0-9]{8}|251[79][0-9]{8})$/;

    // Phone number: digits only, length 7–15
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      addMessage(false, "Phone number is invalid.");
      return false;
    }
    if (phoneNumber && (phoneNumber.length < 7 || phoneNumber.length > 15)) {
      addMessage(false, "Phone number must be between 7 and 15 digits.");
      return false;
    }

    if (role === "2" && selectedPermissions.length === 0) {
      addMessage(false, "At least one permission must be selected.");
      return false;
    }
    if (role === "3" && !isEditMode && !partnerCvHeader) {
      addMessage(false, "CV header image is required when creating a partner.");

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

  const handlePartnerHeaderChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPartnerCvHeader(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      addMessage(false, "CV header must be a JPG, PNG, or WEBP image.");

      event.target.value = "";
      setPartnerCvHeader(null);
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      addMessage(false, "CV header image cannot exceed 5 MB.");

      event.target.value = "";
      setPartnerCvHeader(null);
      return;
    }

    setPartnerCvHeader(file);
  };

  const handlePartnerHeaderTwoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPartnerCvHeaderTwo(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      addMessage(false, "CV header must be a JPG, PNG, or WEBP image.");

      event.target.value = "";
      setPartnerCvHeaderTwo(null);
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      addMessage(false, "CV header image cannot exceed 5 MB.");

      event.target.value = "";
      setPartnerCvHeaderTwo(null);
      return;
    }

    setPartnerCvHeaderTwo(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    setSubmitLoading(true);
    showLoader();
    try {
      let payload = removeEmptyFields({
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        role: Number(role),
        is_active: Number(status),
        country: role === "3" ? country : undefined,
        address: role === "3" ? address : undefined,
      });

      let response = isEditMode
        ? await updateUser(userData.id, payload)
        : await createUser(payload);

      if (!response.success) {
        addMessage(false, response.message);
        hideLoader();
        return;
      }

      const savedUserId = response?.data?.id;
      if (role === "3" && partnerCvHeader && savedUserId) {
        try {
          await uploadPartnerCvHeader(savedUserId, partnerCvHeader);
        } catch (headerError) {
          addMessage(
            false,
            `${
              isEditMode ? "Partner updated" : "Partner created"
            }, but the CV header upload failed: ${headerError.message}`,
          );

          /*
           * The partner account has already been saved.
           * Navigate back to prevent accidental duplicate creation.
           * The header can be retried through Edit Partner.
           */
          navigate(-1);
          return;
        }
      }
      if (role === "3" && partnerCvHeaderTwo && savedUserId) {
        try {
          await uploadPartnerCvHeaderTwo(savedUserId, partnerCvHeaderTwo);
        } catch (headerError) {
          addMessage(
            false,
            `${
              isEditMode ? "Partner updated" : "Partner created"
            }, but the second CV header upload failed: ${headerError.message}`,
          );

          navigate(-1);
          return;
        }
      }
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
            user_id: savedUserId,
            permissions: permissionsToGrant,
          });
        }
        if (permissionsToRevoke.length > 0) {
          await revokePermissions({
            user_id: savedUserId,
            permissions: permissionsToRevoke,
          });
        }
        setOriginalPermissions(selectedPermissions);
      }

      addMessage(true, response.message);
      navigate(-1);
      if (!isEditMode) resetForm();
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="fw-bold text-dark mb-2">
              {isEditMode ? "Update User" : "Create User"}
            </h2>
            <p className="text-muted">
              {isEditMode
                ? "Update user details and permissions."
                : "Add a new staff or partner and assign permissions."}
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
                  <option value="2">Staff</option>
                  <option value="3">Partner</option>
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
                  {requiredFields.email && (
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
              {isEditMode && userId !== userData?.id && (
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
              {role === "3" && (
                <div className="form-group col-md-6 mb-3">
                  <label>
                    Country{" "}
                    {requiredFields.country && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                  <select
                    className="form-control"
                    value={country}
                    required={requiredFields.country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="">Select Country</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Jordan">Jordan</option>
                  </select>
                </div>
              )}

              {role === "3" && (
                <div className="form-group col-md-6 mb-3">
                  <label>
                    Street Address{" "}
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
              )}

              {/* Partner CV Header */}
              {role === "3" && (
                <div className="form-group col-md-6 mb-3">
                  <label>
                    CV Header{" "}
                    {!isEditMode && <span className="text-danger">*</span>}
                  </label>

                  <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    required={!isEditMode}
                    onChange={handlePartnerHeaderChange}
                  />

                  {partnerCvHeader && (
                    <small className="text-muted d-block mt-1">
                      Selected: {partnerCvHeader.name}
                    </small>
                  )}

                  {isEditMode &&
                    !partnerCvHeader &&
                    existingPartnerCvHeader && (
                      <small className="d-block mt-1">
                        <a
                          href={existingPartnerCvHeader}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View current CV header
                        </a>
                      </small>
                    )}

                  {isEditMode && existingPartnerCvHeader && (
                    <small className="text-muted d-block mt-1">
                      Select a new image only if you want to replace the current
                      header.
                    </small>
                  )}
                </div>
              )}

              {/* Partner CV Header (page 2) */}
              {role === "3" && (
                <div className="form-group col-md-6 mb-3">
                  <label>CV Header (Page 2)</label>

                  <input
                    type="file"
                    className="form-control"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePartnerHeaderTwoChange}
                  />

                  {partnerCvHeaderTwo && (
                    <small className="text-muted d-block mt-1">
                      Selected: {partnerCvHeaderTwo.name}
                    </small>
                  )}

                  {isEditMode &&
                    !partnerCvHeaderTwo &&
                    existingPartnerCvHeaderTwo && (
                      <small className="d-block mt-1">
                        <a
                          href={existingPartnerCvHeaderTwo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View current CV header (page 2)
                        </a>
                      </small>
                    )}

                  {isEditMode && existingPartnerCvHeaderTwo && (
                    <small className="text-muted d-block mt-1">
                      Select a new image only if you want to replace the current
                      header.
                    </small>
                  )}
                </div>
              )}

              {/* Employee Permissions */}
              {role === "2" && (!userData || userId !== userData?.id) && (
                <div className="col-12 mt-4">
                  <h5 className="fw-bold">Assign Permissions</h5>

                  <div className="row">
                    {PERMISSIONS.map((permission) => (
                      <div key={permission} className="col-md-6 mb-2">
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
                <button
                  type="submit"
                  className="btn btn-main px-4 rounded"
                  disabled={submitLoading}
                >
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

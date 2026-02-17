import React, { useState } from "react";
import { createUser } from "../../api/user.api";
import { grantPermissions } from "../../api/permission.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";

const PERMISSIONS = [
  "manage_users",
  "manage_workers",
  "manage_partners",
  "manage_finance",
  "manage_analytics",
  "manage_system_settings",
  "manage_audit_logs",
];

const CreateUser = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhoneNumber("");
    setRole("");
    setCountry("");
    setSelectedPermissions([]);
    setSelectAll(false);
  };

  // Allow only numbers in phone input
  const handlePhoneChange = (value) => {
    const numericValue = value.replace(/\D/g, "");
    setPhoneNumber(numericValue);
  };

  // Toggle single permission
  const togglePermission = (permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions(
        selectedPermissions.filter((p) => p !== permission),
      );
    } else {
      setSelectedPermissions([...selectedPermissions, permission]);
    }
  };

  // Toggle check all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPermissions([]);
      setSelectAll(false);
    } else {
      setSelectedPermissions(PERMISSIONS);
      setSelectAll(true);
    }
  };

  // Validate fields
  const validateFields = () => {
    if (!fullName) {
      addMessage(false, "Full name is required.");
      return false;
    }

    if (fullName.length < 2) {
      addMessage(false, "Full name must be at least 2 characters.");
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

    if (phoneNumber.length < 7) {
      addMessage(false, "Phone number must be at least 7 digits.");
      return false;
    }

    if (!role) {
      addMessage(false, "Role is required.");
      return false;
    }

    if (role === "3" && !country) {
      addMessage(false, "Country is required for partner.");
      return false;
    }

    if (role === "3" && country.length < 2) {
      addMessage(false, "Country must be at least 2 characters.");
      return false;
    }

    return true;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    showLoader();
    try {
      // Step 1: Create user
      const response = await createUser({
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        role: Number(role),
        country: role === "3" ? country : undefined,
      });

      if (!response.success) {
        addMessage(false, response.message);
        hideLoader();
        return;
      }

      const userId = response.data?.id;

      // Step 2: Grant selected permissions in one call
      if (role === 2 && selectedPermissions.length > 0) {
        const permResponse = await grantPermissions({
          user_id: userId,
          permissions: selectedPermissions, // send array directly
        });

        if (!permResponse.success) {
          addMessage(permResponse.suce, permResponse.message);
          hideLoader();
          return;
        }
      }
      addMessage(true, "User created and permissions assigned successfully.");
      resetForm();
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <div>
          <h2 className="fw-bold text-dark mb-2">Create New User</h2>
          <p className="text-muted">
            Add a new employee or partner and assign permissions.
          </p>
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
                </select>
              </div>

              {/* Country */}
              {role === "3" && (
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
                  Create User
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

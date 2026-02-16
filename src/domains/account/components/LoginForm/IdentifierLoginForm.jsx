import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithPhone } from "../../api/auth.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import useAuth from "../../../../context/auth/UseAuth";

const IdentifierLoginForm = () => {
  const [role, setRole] = useState("employer");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const validateLength = (value, min, max, fieldName) => {
    if (!value) return `${fieldName} is required.`;
    if (value.length < min || value.length > max)
      return `${fieldName} must be between ${min} and ${max} characters.`;
    return null;
  };

  const validateInputs = () => {
    if (!role || !phoneNumber) {
      addMessage(false, "Role and phone number are required.");
      return false;
    }

    // Phone number length
    const phoneError = validateLength(phoneNumber, 9, 20, "Phone number");
    if (phoneError) {
      addMessage(false, phoneError);
      return false;
    }

    if (role === "employer") {
      const nationalIdError = validateLength(nationalId, 5, 30, "National ID");
      if (nationalIdError) {
        addMessage(false, nationalIdError);
        return false;
      }
    } else if (role === "worker") {
      const passportError = validateLength(
        passportNumber,
        5,
        30,
        "Passport number",
      );
      if (passportError) {
        addMessage(false, passportError);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) return;

    showLoader();
    try {
      const credentials = { role, phone_number: phoneNumber };

      if (role === "employer") credentials.national_id = nationalId;
      if (role === "worker") credentials.passport_number = passportNumber;

      const response = await loginWithPhone(credentials);

      sessionStorage.setItem("authToken", response.data.access_token);
      addMessage(response.data.success, response.data.message);
      setUser(true);
      navigate("/admin/dashboard");
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div
      className="login-page d-flex justify-content-center align-items-center rounded"
      style={{ marginTop: "30px" }}
    >
      <div
        className="login-container p-4 rounded shadow-lg my-4"
        style={{ maxWidth: "500px", width: "90%", minHeight: "400px" }}
      >
        <h2 className="text-center mb-3 fw-bold pt-0">Log In</h2>

        <form onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="employer">Employer</option>
              <option value="worker">Worker</option>
            </select>
            <label htmlFor="role">Role</label>
          </div>

          {/* Phone number */}
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              id="phoneNumber"
              placeholder="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <label htmlFor="phoneNumber">Phone Number</label>
          </div>

          {/* Conditional: National ID for Employer */}
          {role === "employer" && (
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="nationalId"
                placeholder="National ID"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                required
              />
              <label htmlFor="nationalId">National ID</label>
            </div>
          )}

          {/* Conditional: Passport number for Worker */}
          {role === "worker" && (
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                id="passportNumber"
                placeholder="Passport Number"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                required
              />
              <label htmlFor="passportNumber">Passport Number</label>
            </div>
          )}
          {/* Submit */}
          <button
            type="submit"
            className="btn btn-main fw-medium w-100 rounded-2"
          >
            Log In
          </button>
        </form>
      
      </div>
    </div>
  );
};

export default IdentifierLoginForm;

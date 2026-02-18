import React, { useState, useEffect } from "react";
import { createEmployer, updateEmployer } from "../../api/employer.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useNavigate } from "react-router-dom";

const CreateEmployer = ({ isEditMode = false, employerData = null }) => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [address, setAddress] = useState("");

  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  // Prefill form in edit mode
  useEffect(() => {
    if (isEditMode && employerData) {
      setFullName(employerData.full_name || "");
      setPhoneNumber(employerData.phone_number || "");
      setEmail(employerData.email || "");
      setCountry(employerData.country || "");
      setCity(employerData.city || "");
      setNationalId(employerData.national_id || "");
      setAddress(employerData.address || "");
    }
  }, [isEditMode, employerData]);

  const handleBack = () => {
    navigate("/admin/employer-management");
  };

  const resetForm = () => {
    setFullName("");
    setPhoneNumber("");
    setEmail("");
    setCountry("");
    setCity("");
    setNationalId("");
    setAddress("");
  };

  const handlePhoneChange = (value) => {
    const numericValue = value.replace(/\D/g, "");
    setPhoneNumber(numericValue);
  };

  const validateFields = () => {
    if (!fullName) {
      addMessage(false, "Full name is required.");
      return false;
    }
    if (!phoneNumber) {
      addMessage(false, "Phone number is required.");
      return false;
    }
    if (!country) {
      addMessage(false, "Country is required.");
      return false;
    }
    if (!nationalId) {
      addMessage(false, "National ID is required.");
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
        phone_number: phoneNumber,
        email: email || undefined,
        country,
        city: city || undefined,
        national_id: nationalId,
        address: address || undefined,
      };

      let response;
      if (isEditMode) {
        response = await updateEmployer(employerData.employer_id, payload);
      } else {
        response = await createEmployer(payload);
      }

      if (!response.success) {
        addMessage(false, response.message);
        hideLoader();
        return;
      }

      addMessage(true, response.message);
      navigate("/admin/employer-management");

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
              {isEditMode ? "Update Employer" : "Create New Employer"}
            </h2>
            <p className="text-muted">
              {isEditMode ? "Update employer details." : "Add a new employer."}
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

              {/* Phone Number */}
              <div className="form-group col-md-6 mb-3">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
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

              {/* Country */}
              <div className="form-group col-md-6 mb-3">
                <label>Country</label>
                <input
                  type="text"
                  className="form-control"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              {/* City */}
              <div className="form-group col-md-6 mb-3">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              {/* National ID */}
              <div className="form-group col-md-6 mb-3">
                <label>National ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="form-group col-md-12 mb-3">
                <label>Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="form-group col-lg-12 text-start mt-4">
                <button type="submit" className="btn btn-main px-5 rounded">
                  {isEditMode ? "Update Employer" : "Create Employer"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployer;

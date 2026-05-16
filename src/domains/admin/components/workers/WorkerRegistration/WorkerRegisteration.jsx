import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { registerWorkerCore, updateWorkerBasic } from "../../../api/worker.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

function WorkerRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  // Edit mode — caller passes location.state.basic with the worker's basic info
  const existingBasic = location.state || null;
  const isEditMode = Boolean(existingBasic);
  const isCreate = !isEditMode;

  const [formData, setFormData] = useState({
    full_name: existingBasic?.full_name || "",
    phone_number: existingBasic?.phone_number || "",
    email: existingBasic?.email || "",
    agency: existingBasic?.agency || "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const goBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nameRegex = /^[A-Za-z\s]+$/;

  const validate = ({ full_name, phone_number, email }) => {
    if (!full_name.trim()) return "Full name is required";

    const name = full_name.trim();
    if (name.length < 3 || name.length > 100)
      return "Full name must be between 3 and 100 characters";
    if (!nameRegex.test(name)) return "Full name must contain letters only";

    if (!phone_number.trim() || phone_number.length < 10)
      return "Phone number is required (10 digit minimum)";

    const phonePattern = /^(?:\+251[79]\d{8}|09\d{8}|07\d{8})$/;
    if (!phonePattern.test(phone_number.trim()))
      return "Phone number must be in Ethiopian format (+2519..., 09..., or 07...)";

    if (email && email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim().toLowerCase()))
        return "Email must be a valid email address";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate(formData);
    if (error) {
      addMessage(false, error);
      return;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim(),
        email: formData.email.trim() || null,
        agency: formData.agency || null,
      };

      let response;

      if (isEditMode) {
        response = await updateWorkerBasic(id, dataToSend);
        addMessage(
          response?.success,
          response?.message || "Employee updated successfully",
        );
      } else {
        dataToSend.is_active = true;
        response = await registerWorkerCore(dataToSend);
        addMessage(
          response?.success,
          response?.message || "Employee registered successfully",
        );
        // Reset only on create
        setFormData({ full_name: "", phone_number: "", email: "", agency: "" });
      }

      goBack();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };
  // helper function
  const renderLabel = (text, required = false) => {
    return (
      <label>
        {text} {required && <span className="text-danger">*</span>}
      </label>
    );
  };

  const title = isEditMode ? "Edit Employee Information" : "Add Employee";
  const buttonText = isEditMode ? "Update Employee" : "Register Employee";

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className="mb-4">
          <BackButton onClick={goBack} />
          <h2 className="fw-bold text-dark mb-2">{title}</h2>
          <p className="text-muted mb-0">
            {isEditMode
              ? "Update the employee's basic information below"
              : "Register a new employee by providing their full name, phone number, and email"}
          </p>
        </div>
      </div>

      <form className="form-submit" onSubmit={handleSubmit}>
        <div className="submit-section">
          <div className="row">
            <div className="form-group col-md-6">
              {renderLabel("Full Name", isCreate)}
              <input
                type="text"
                name="full_name"
                className="form-control"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group col-md-6">
              <label>{renderLabel("Phone Number", isCreate)}</label>
              <input
                type="tel"
                name="phone_number"
                className="form-control"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group col-md-6">
              <label>Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group col-md-6">
              <label>Agency</label>
              <select
                name="agency"
                className="form-control"
                value={formData.agency}
                onChange={handleChange}
              >
                <option value="">Select Agency</option>
                <option value="ethio_saudi">Ethio Saudi</option>
                <option value="jomery">Jomery</option>
              </select>
            </div>
          </div>
        </div>

        <div className="submit-section">
          <div className="form-group col-lg-12 col-md-12 mt-4">
            <button
              className="btn btn-main px-4 rounded"
              type="submit"
              disabled={submitLoading}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default WorkerRegistration;

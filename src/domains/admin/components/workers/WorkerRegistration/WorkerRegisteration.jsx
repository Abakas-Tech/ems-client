import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerWorkerCore } from "../../../api/worker.api"; 
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import BackButton from "../../../../../shared/components/BackButton/BackButton";

function WorkerRegistration() {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  // Go back to previous page
  const goBack = () => {
    navigate(-1);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nameRegex = /^[A-Za-z\s]+$/;

  const validateWorkerRegistration = ({ full_name, phone_number, email }) => {
    // Full name
    if (!full_name.trim()) {
      return "Full name is required";
    }

    const name = full_name.trim();

    if (name.length < 3 || name.length > 100) {
      return "Full name must be between 3 and 100 characters";
    }

    if (!nameRegex.test(name)) {
      return "Full name must contain letters only";
    }

    // phone_number
    if (!phone_number.trim() || phone_number.length < 10) {
      return "Phone number is required (10 digit minimum)";
    }

    const phonePattern = /^(?:\+251[79]\d{8}|09\d{8}|07\d{8})$/;
    if (!phonePattern.test(phone_number.trim())) {
      return "Phone number must be in Ethiopian format (+2519..., 09..., or 07...)";
    }

    // email
    if (email && email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim().toLowerCase())) {
        return "Email must be a valid email address";
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateWorkerRegistration(formData);
    if (error) {
      addMessage(false, error);
      return;
    }

    const { full_name, phone_number, email } = formData;

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = {
        full_name: full_name.trim(),
        phone_number: phone_number.trim(),
        email: email.trim() || null,
        is_active: true,
      };

      // Send the request using the new core registration endpoint
      const response = await registerWorkerCore(dataToSend);

      addMessage(
        response?.success,
        response?.message || "Worker registered successfully",
      );

      // Reset form
      setFormData({
        full_name: "",
        phone_number: "",
        email: "",
      });

      goBack();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className="mb-4">
          <BackButton onClick={goBack} />
          <h2 className="fw-bold text-dark mb-2">Add Worker</h2>
          <p className="text-muted mb-0">
            Register a new worker by providing their full name, phone number,
            and email
          </p>
        </div>
      </div>
      <form className="form-submit" onSubmit={handleSubmit}>
        <div className="submit-section">
          <div className="row">
            <div className="form-group col-md-6">
              <label>
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="full_name"
                className="form-control"
                value={formData.full_name}
                onChange={handleTextChange}
                required
              />
            </div>

            <div className="form-group col-md-6">
              <label>
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                name="phone_number"
                className="form-control"
                value={formData.phone_number}
                onChange={handleTextChange}
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
                onChange={handleTextChange}
              />
            </div>
          </div>
        </div>

        <div className="submit-section">
          <div className="form-group col-lg-12 col-md-12 mt-4">
            <button
              className="btn btn-main px-5 rounded"
              type="submit"
              disabled={submitLoading}
            >
              Register Worker
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default WorkerRegistration;

import React, { useState } from "react";
import { useLoader } from "../../../../../../context/LoaderContext";
import { useResponse } from "../../../../../../context/ResponseContext";

const validateContract = (form) => {
  const errors = {};

  if (!form.employerId) errors.employerId = "Employer ID is required";
  if (!form.partnerId) errors.partnerId = "Partner ID is required";
  if (!form.startDate) errors.startDate = "Start date is required";
  if (!form.endDate) errors.endDate = "End date is required";
  if (!form.status) errors.status = "Status is required";

  return errors;
};

const Contract = () => {
  const { showLoader, hideLoader } = useLoader();
  const { showResponse } = useResponse();

  const [form, setForm] = useState({
    employerId: "",
    partnerId: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateContract(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    showLoader();

    // API call placeholder (will connect later)
    setTimeout(() => {
      hideLoader();
      showResponse("Contract saved (demo mode)", "success");
    }, 800);
  };

  return (
    <div className="container py-4">
      <h2>Contract Management</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Employer ID</label>
          <input
            type="text"
            name="employerId"
            className="form-control"
            value={form.employerId}
            onChange={handleChange}
          />
          {errors.employerId && (
            <div className="text-danger">{errors.employerId}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Partner ID</label>
          <input
            type="text"
            name="partnerId"
            className="form-control"
            value={form.partnerId}
            onChange={handleChange}
          />
          {errors.partnerId && (
            <div className="text-danger">{errors.partnerId}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            name="startDate"
            className="form-control"
            value={form.startDate}
            onChange={handleChange}
          />
          {errors.startDate && (
            <div className="text-danger">{errors.startDate}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">End Date</label>
          <input
            type="date"
            name="endDate"
            className="form-control"
            value={form.endDate}
            onChange={handleChange}
          />
          {errors.endDate && (
            <div className="text-danger">{errors.endDate}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Status</label>
          <select
            name="status"
            className="form-select"
            value={form.status}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && <div className="text-danger">{errors.status}</div>}
        </div>

        <button type="submit" className="btn btn-primary">
          Save Contract
        </button>
      </form>
    </div>
  );
};

export default Contract;
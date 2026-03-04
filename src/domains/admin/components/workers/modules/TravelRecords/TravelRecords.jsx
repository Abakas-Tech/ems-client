import React, { useState } from "react";
import { useLoader } from "../../../../../../context/LoaderContext";
import { useResponse } from "../../../../../../context/ResponseContext";

const validateTravelRecords = (form) => {
  const errors = {};

  if (!form.ticketNumber) errors.ticketNumber = "Ticket number is required";
  if (!form.departureDate) errors.departureDate = "Departure date is required";
  if (!form.agentName) errors.agentName = "Agent name is required";

  return errors;
};

const TravelRecords = () => {
  const { showLoader, hideLoader } = useLoader();
  const { showResponse } = useResponse();

  const [form, setForm] = useState({
    ticketNumber: "",
    departureDate: "",
    agentName: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateTravelRecords(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    showLoader();

    try {
      // API call placeholder (will connect later)
      showResponse("Travel record saved successfully", "success");
    } catch (error) {
      showResponse(error.message || "Error saving record", "error");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="container mt-4">
      <h2>Travel Records</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Ticket Number</label>
          <input
            type="text"
            name="ticketNumber"
            className="form-control"
            value={form.ticketNumber}
            onChange={handleChange}
            required
          />
          {errors.ticketNumber && (
            <span className="text-danger">{errors.ticketNumber}</span>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Departure Date</label>
          <input
            type="date"
            name="departureDate"
            className="form-control"
            value={form.departureDate}
            onChange={handleChange}
            required
          />
          {errors.departureDate && (
            <span className="text-danger">{errors.departureDate}</span>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Agent Name</label>
          <input
            type="text"
            name="agentName"
            className="form-control"
            value={form.agentName}
            onChange={handleChange}
            required
          />
          {errors.agentName && (
            <span className="text-danger">{errors.agentName}</span>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Save
        </button>
      </form>
    </div>
  );
};

export default TravelRecords;
import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useLoader from "../../../../../../context/Loader/useLoader";
import useResponse from "../../../../../../context/Response/useResponse";
import BackButton from "../../../../../../shared/components/BackButton/BackButton";
import { createTravel, updateTravel } from "../../../../api/worker.api";

// helper function
const renderLabel = (text, required = false) => {
  return (
    <label>
      {text} {required && <span className="text-danger">*</span>}
    </label>
  );
};

function Travel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const existingTravel = location.state?.travel?.[0] || null;
  const isEditMode = Boolean(existingTravel);
  const isCreate = !isEditMode;

  const [formData, setFormData] = useState({
    ticket_number: existingTravel?.ticket_number || "",
    departure_date: existingTravel?.departure_date || "",
    arrival_date: existingTravel?.arrival_date || "",
    departure_location: existingTravel?.departure_location || "",
    arrival_location: existingTravel?.arrival_location || "",
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const goBack = () => navigate(-1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateTravel = () => {
    // String length validations
    if (formData.ticket_number && formData.ticket_number.length > 100)
      return "Ticket number cannot exceed 100 characters";

    // Date validations
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const departureDate = formData.departure_date
      ? new Date(formData.departure_date)
      : null;

    const arrivalDate = formData.arrival_date
      ? new Date(formData.arrival_date)
      : null;

    /* Arrival cannot exist without departure */
    if (!departureDate && arrivalDate) {
      return "Departure date must be provided if arrival date is set";
    }

    /* Validate departure if provided */
    if (departureDate) {
      if (isNaN(departureDate.getTime()))
        return "Departure date must be a valid date";

      departureDate.setHours(0, 0, 0, 0);

      if (departureDate < now) return "Departure date cannot be in the past";
    }

    /* Validate arrival if provided */
    if (arrivalDate) {
      if (isNaN(arrivalDate.getTime()))
        return "Arrival date must be a valid date";

      arrivalDate.setHours(0, 0, 0, 0);
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateTravel();
    if (error) {
      addMessage(false, error);
      return;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key]) dataToSend.append(key, formData[key]);
      });
      const response = isEditMode
        ? await updateTravel(id, dataToSend)
        : await createTravel(id, dataToSend);

      addMessage(
        response?.success,
        response?.message ||
          (isEditMode
            ? "Travel information updated successfully"
            : "Travel information created successfully"),
      );

      navigate(-1);
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  const title = isEditMode
    ? "Edit Travel Information"
    : "Add Travel Information";
  const buttonText = isEditMode ? "Update Travel" : "Add Travel";
  return (
    <section className="dashboard-wraper">
      <BackButton onClick={goBack} />

      <form className="form-submit" onSubmit={handleSubmit}>
        <h2 className="fw-bold text-dark mb-3">{title}</h2>

        <div className="row">
          <div className="form-group col-md-6">
            {renderLabel("Ticket Number", isCreate)}
            <input
              type="text"
              name="ticket_number"
              className="form-control"
              required
              value={formData.ticket_number}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>Departure Date</label>
            <input
              type="date"
              name="departure_date"
              className="form-control"
              value={formData.departure_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>Arrival Date</label>
            <input
              type="date"
              name="arrival_date"
              className="form-control"
              value={formData.arrival_date}
              onChange={handleChange}
            />
          </div>

            <div className="form-group col-md-6">
            <label>Departure Location</label>
            <input
              type="text"
              name="departure_location"
              className="form-control"
              value={formData.departure_location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group col-md-6">
            <label>Arrival Location</label>
            <input
              type="text"
              name="arrival_location"
              className="form-control"
              value={formData.arrival_location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="submit-section">
          <button
            type="submit"
            className="btn btn-main px-4 rounded"
            disabled={submitLoading}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Travel;

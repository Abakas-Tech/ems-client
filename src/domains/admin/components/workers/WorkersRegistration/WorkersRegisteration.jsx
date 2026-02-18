// WorkersRegistration.jsx
import React, { useState, useEffect } from "react";
import { createWorker, getWorkerStatuses } from "../../../api/worker.api";
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/response/UseResponse";

function WorkersRegistration() {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    personal_information: { sex: "", status_id: "" },
  });

  const [statuses, setStatuses] = useState(null);
  const [statusesError, setStatusesError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Photo states
  const [photo3x4, setPhoto3x4] = useState(null);
  const [photoStanding, setPhotoStanding] = useState(null);

  // Fetch worker statuses on mount
  useEffect(() => {
    const loadStatuses = async () => {
      showLoader();
      try {
        const data = await getWorkerStatuses();
        setStatuses(Array.isArray(data?.data) ? data.data : data || []);
        setStatusesError(null);
      } catch (err) {
        console.error(err);
        setStatuses([]);
        setStatusesError("Could not load worker statuses");
        addMessage(false, "Could not load worker statuses. Please try again.");
      } finally {
        hideLoader();
      }
    };

    loadStatuses();
  }, []);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("personal_")) {
      const field = name.replace("personal_", "");
      setFormData((prev) => ({
        ...prev,
        personal_information: { ...prev.personal_information, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      if (name === "photo_3x4_url") setPhoto3x4(files[0]);
      if (name === "photo_standing_url") setPhotoStanding(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { full_name, phone_number, personal_information, email } = formData;

    // Client-side validation
    if (!full_name.trim()) return addMessage(false, "Full name is required");
    const phonePattern = /^(?:\+251[79]\d{8}|09\d{8})$/;
    if (!phonePattern.test(phone_number.trim())) {
      return addMessage(
        false,
        "Phone number must be in Ethiopian format (+2519... or 09...)",
      );
    }
    if (!phone_number.trim())
      return addMessage(false, "Phone number is required");
    if (!personal_information.sex) return addMessage(false, "Sex is required");
    if (!personal_information.status_id)
      return addMessage(false, "Please select a worker status");

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = new FormData();
      dataToSend.append("full_name", full_name.trim());
      dataToSend.append("phone_number", phone_number.trim());
      if (email.trim()) dataToSend.append("email", email.trim());
      dataToSend.append("is_active", "true");

      // Flat nested fields using bracket notation — this is what worked in Postman
      dataToSend.append("personal_information[sex]", personal_information.sex);
      dataToSend.append(
        "personal_information[status_id]",
        personal_information.status_id,
      );

      if (photo3x4) dataToSend.append("photo_3x4_url", photo3x4);
      if (photoStanding) dataToSend.append("photo_standing_url", photoStanding);

      await createWorker(dataToSend);

      addMessage(true, "Worker registered successfully!");

      // Reset form
      setFormData({
        full_name: "",
        phone_number: "",
        email: "",
        personal_information: { sex: "", status_id: "" },
      });
      setPhoto3x4(null);
      setPhotoStanding(null);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to register worker";
      addMessage(false, msg);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  return (
    <section className="bg-light">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="dashboard-wraper">
              <form className="form-submit" onSubmit={handleSubmit}>
                <h4>Worker Registration</h4>

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

                    <div className="form-group col-md-6">
                      <label>
                        Sex <span className="text-danger">*</span>
                      </label>
                      <select
                        name="personal_sex"
                        className="form-control"
                        value={formData.personal_information.sex}
                        onChange={handleTextChange}
                        required
                      >
                        <option value="">Select sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>

                    <div className="form-group col-md-6">
                      <label>
                        Worker Status <span className="text-danger">*</span>
                      </label>

                      {statuses === null ? (
                        <div className="form-control text-muted">
                          Loading statuses...
                        </div>
                      ) : statusesError ? (
                        <div className="form-control text-danger">
                          {statusesError}
                        </div>
                      ) : statuses.length === 0 ? (
                        <div className="form-control text-muted">
                          No statuses available
                        </div>
                      ) : (
                        <select
                          name="personal_status_id"
                          className="form-control"
                          value={formData.personal_information.status_id}
                          onChange={handleTextChange}
                          required
                        >
                          <option value="">Select status</option>
                          {statuses.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="form-group col-md-6">
                      <label>Photo 3x4</label>
                      <input
                        type="file"
                        name="photo_3x4_url" // ← fixed to match backend
                        accept="image/*"
                        className="form-control"
                        onChange={handleFileChange}
                      />
                    </div>

                    <div className="form-group col-md-6">
                      <label>Photo Standing</label>
                      <input
                        type="file"
                        name="photo_standing_url" // ← fixed to match backend
                        accept="image/*"
                        className="form-control"
                        onChange={handleFileChange}
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
                      {submitLoading ? "Registering..." : "Register Worker"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkersRegistration;

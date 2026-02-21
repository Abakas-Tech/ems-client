import React, { useState, useEffect } from "react";
import { createWorker } from "../../../api/worker.api";
import { getWorkerStatuses } from "../../../api/meta.api";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { full_name, phone_number, personal_information, email } = formData;

    // Client-side validation
    const name = full_name.trim();
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return addMessage(false, "Full name must contain letters only");
    }

    const phonePattern = /^(?:\+251[79]\d{8}|09\d{8})$/;
    if (!phonePattern.test(phone_number.trim())) {
      return addMessage(
        false,
        "Phone number must be in Ethiopian format (+2519... or 09...)",
      );
    }

    setSubmitLoading(true);
    showLoader();

    try {
      const dataToSend = {
        full_name: name,
        phone_number: phone_number.trim(),
        email: email.trim() || null,
        is_active: true,
        personal_information: {
          sex: personal_information.sex,
          status_id: personal_information.status_id,
        },
      };

      // Send the request
      await createWorker(dataToSend);

      addMessage(true, "Worker registered successfully!");

      // Reset form
      setFormData({
        full_name: "",
        phone_number: "",
        email: "",
        personal_information: { sex: "", status_id: "" },
      });
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

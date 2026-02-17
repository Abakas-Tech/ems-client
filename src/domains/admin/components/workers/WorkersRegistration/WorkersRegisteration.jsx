import React, { useState } from "react";
import { createWorker } from "../../../api/worker.api";
import useResponse from "../../../../../context/response/UseResponse";

function WorkersRegistration() {
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        is_active: true,
      };

      if (formData.email) {
        payload.email = formData.email;
      }

      await createWorker(payload);

      addMessage(true, "Worker account created successfully!");

      setFormData({
        full_name: "",
        phone_number: "",
        email: "",
      });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create worker account";

      addMessage(false, message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-light">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 col-md-12">
            <div className="dashboard-wraper">
              <form className="form-submit" onSubmit={handleSubmit}>
                <h4>Worker Account Registration</h4>

                <div className="submit-section">
                  <div className="row">
                    {/* Full Name */}
                    <div className="form-group col-md-6">
                      <label>
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        className="form-control"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="form-group col-md-6">
                      <label>
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone_number"
                        className="form-control"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Email */}
                    <div className="form-group col-md-6">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="form-group col-lg-12 col-md-12 mt-4">
                      <button
                        type="submit"
                        className="btn btn-main px-5 rounded"
                        disabled={loading}
                      >
                        {loading ? "Creating..." : "Create Worker Account"}
                      </button>
                    </div>
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

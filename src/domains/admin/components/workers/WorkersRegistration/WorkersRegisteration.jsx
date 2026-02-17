import React, { useState } from "react";
import { createWorker } from "../../../api/worker.api";

function WorkersRegistration() {
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
    setError(null);
    setSuccess(null);

    try {
      // Payload includes is_active by default
      const payload = { ...formData, is_active: true };
      await createWorker(payload);

      setSuccess("Worker account created successfully!");
      setFormData({
        full_name: "",
        phone_number: "",
        email: "",
      });
    } catch (err) {
      setError(err.message || "Failed to create worker account");
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

                {success && (
                  <div className="alert alert-success">{success}</div>
                )}
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="submit-section">
                  <div className="row">
                    {/* Full Name */}
                    <div className="form-group col-md-6">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="full_name"
                        className="form-control"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="form-group col-md-6">
                      <label>Phone Number *</label>
                      <input
                        type="text"
                        name="phone_number"
                        className="form-control"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
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

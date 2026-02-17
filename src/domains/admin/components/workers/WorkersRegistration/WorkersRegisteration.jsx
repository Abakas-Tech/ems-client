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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Simple validation before submitting
  const isValid = () => {
    const { full_name, phone_number, email } = formData;

    if (!full_name.trim() || full_name.trim().length < 3) {
      addMessage(false, "Full name must be at least 3 characters.");
      return false;
    }

    const phoneRegex = /^(?:\+251[79]\d{8}|09\d{8})$/;
    if (!phoneRegex.test(phone_number.trim())) {
      addMessage(false, "Phone number format is invalid");
      return false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      addMessage(false, "Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid()) return; 

    setLoading(true);
    try {
      const payload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        is_active: true,
      };
      if (formData.email) payload.email = formData.email;

      await createWorker(payload);

      addMessage(true, "Worker account created successfully!");

      setFormData({ full_name: "", phone_number: "", email: "" });
    } catch (err) {
      addMessage(
        false,
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create worker account",
      );
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
                        disabled={loading}
                        required
                      />
                    </div>

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
                        disabled={loading}
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
                        disabled={loading}
                      />
                    </div>

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

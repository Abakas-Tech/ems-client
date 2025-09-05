import React, { useState, useEffect } from "react";
import { sendContactRequest } from "../../api/contact.api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import useResponse from "../../../../context/response/UseResponse";
import { useProfile } from "../../../../context/Profile/ProfileProvider";

const MySwal = withReactContent(Swal);

const Contact = () => {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { addMessage } = useResponse();

  // Defaults in case profile context is empty
  const [agentData, setAgentData] = useState({
    agent_name: "Hussen Agent",
    agent_email: "support@agent.com",
    agent_phone: "0918241535",
    address: "Addis Ababa, Ethiopia",
  });

  useEffect(() => {
    if (profile?.agent_name) {
      setAgentData({
        agent_name: profile.agent_name || "Hussen Agent",
        agent_email: profile.agent_email || "support@agent.com",
        agent_phone: profile.agent_phone || "0918241535",
        address: profile.address || "Addis Ababa, Ethiopia",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone and message
    if (!formData.phone.trim() || !formData.message.trim()) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Phone and message are required!",
      });
      return;
    }
    try {
      setLoading(true);

      // Send formData, ensuring email is undefined if empty
      const response = await sendContactRequest({
        name: formData.name || undefined,
        email: formData.email || undefined, // Explicitly send undefined if empty
        phone: formData.phone,
        message: formData.message,
      });

      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: response.message || "Form submitted successfully!",
        showConfirmButton: true,
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Failed!",
        text: error.message || "Failed to submit form. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="container">
        <div className="row">
          {/* Contact Form */}
          <h2 className="fw-bold">Contact Me</h2>
          <div className="col-lg-7 col-md-7">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control simple"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6">
                  <div className="form-group">
                    <label>Email (optional)</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control simple"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>
                  Phone <span className="text-danger fw-bold">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control simple"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Message <span className="text-danger fw-bold">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-control simple"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <button
                  className="btn btn-light-main px-5 rounded"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info */}
          <div className="col-lg-5 col-md-5">
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>
                Hello, I'm{" "}
                <span
                  className="fw-bold"
                  style={{ fontSize: "1.2rem", color: "var(--maincolor)" }}
                >
                  {agentData?.agent_name}
                </span>
                , I'm here to help you with any questions about buying, selling,
                or renting properties. Whether you're looking for advice,
                scheduling a viewing, or need more details about a listing, feel
                free to reach out anytime.
              </p>

              {/* Location */}
              <div className="d-flex align-items-center mb-3 mt-4">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#ECF4FE",
                    color: "var(--maincolor)",
                  }}
                >
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <div>
                  <h5 className="mb-0">Reach Me</h5>
                  <p className="mb-0">{agentData?.address}</p>
                </div>
              </div>

              {/* Email */}
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#ECF4FE",
                    color: "var(--maincolor)",
                  }}
                >
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <div>
                  <h5 className="mb-0">Drop A Mail</h5>
                  <p className="mb-0">{agentData?.agent_email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#ECF4FE",
                    color: "var(--maincolor)",
                  }}
                >
                  <i className="fa-solid fa-phone"></i>
                </div>
                <div>
                  <h5 className="mb-0">Call Me</h5>
                  <p className="mb-0">{agentData?.agent_phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

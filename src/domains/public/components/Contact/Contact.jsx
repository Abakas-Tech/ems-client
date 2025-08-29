import React, { useState, useEffect } from "react";
import {
  sendContactRequest,
  fetchAgentProfile,
} from "../../api/contact.api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [agentData, setAgentData] = useState({
    agent_name: "Hussen Agent",
    agent_email: "support@agent.com",
    agent_phone: "0918241535",
    address: "Addiss Ababa, Ethiopia",
  });

  useEffect(() => {
    const loadAgentProfile = async () => {
      const profile = await fetchAgentProfile();
      if (profile) {
        setAgentData({
          agent_name: profile.agent_name,
          agent_email: profile.agent_email,
          agent_phone: profile.agent_phone,
          address: profile.address,
        });
      }
    };
    loadAgentProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.message || !formData.email) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Email and message are required!",
      });
      return;
    }

    try {
      setLoading(true);
      await sendContactRequest(formData);
      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Form submitted successfully!",
        // timer: 2000,
        showConfirmButton: true,
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error("Submission failed:", error);
      MySwal.fire({
        icon: "error",
        title: "Failed!",
        text: "Form submission failed. Please try again.",
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
          <h2>Contact Me</h2>
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
                    <label>
                      Email <span className="text-danger fw-bold">*</span>{" "}
                    </label>
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
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control simple"
                />
              </div>

              <div className="form-group">
                <label>
                  Message <span className="text-danger fw-bold">*</span>{" "}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-control simple"
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <button
                  className="btn btn-main px-5 rounded"
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
                Hello I'm{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    color: "#FF5722",
                  }}
                >
                  {agentData.agent_name}
                </span>
                , I’m here to help you with any questions about buying, selling,
                or renting properties. Whether you’re looking for advice,
                scheduling a viewing, or need more details about a listing, feel
                free to reach out anytime.
              </p>

              <div className="cn-info-detail">
                <div className="cn-info-icon">
                  <i className="fa-solid fa-house"></i>
                </div>
                <div className="cn-info-content">
                  <h4 className="cn-info-title">Reach Me</h4>
                  {agentData.address}
                </div>
              </div>

              <div className="cn-info-detail">
                <div className="cn-info-icon">
                  <i className="fa-solid fa-envelope-circle-check"></i>
                </div>
                <div className="cn-info-content">
                  <h4 className="cn-info-title">Drop A Mail</h4>
                  {agentData.agent_email}
                </div>
              </div>

              <div className="cn-info-detail">
                <div className="cn-info-icon">
                  <i className="fa-solid fa-phone-volume"></i>
                </div>
                <div className="cn-info-content">
                  <h4 className="cn-info-title">Call Me</h4>
                  {agentData.agent_phone}
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

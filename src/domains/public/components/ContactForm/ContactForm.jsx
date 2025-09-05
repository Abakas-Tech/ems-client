import React, { useState, useEffect } from "react";
import { sendContactRequest } from "../../api/contact.api";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useProfile } from "../../../../context/Profile/ProfileProvider";

const MySwal = withReactContent(Swal);

const ContactForm = ({ id }) => {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

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
        agent_name: profile?.agent_name || "Hussen Agent",
        agent_email: profile?.agent_email || "support@agent.com",
        agent_phone: profile?.agent_phone || "0918241535",
        address: profile?.address || "Addis Ababa, Ethiopia",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Phone required, Email optional
    if (!formData.phone || !formData.message) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Phone and message are required!",
      });
      return;
    }

    try {
      setLoading(true);
      // add id as a propertyId to formData
      formData.propertyId = id;

      const response = await sendContactRequest(formData);

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
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="sides-widget-header bg-main">
        <div className="agent-photo">
          <img src={agentData?.profile_image_url} alt="" />
        </div>
        <div className="sides-widget-details">
          <h4>
            <a href="#">{agentData?.agent_name}</a>
          </h4>
          <p>
            <i className="lni-phone-handset"></i>
            {agentData?.agent_phone}
          </p>
        </div>
        <div className="clearfix"></div>
      </div>

      <form className="sides-widget-body simple-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email (optional)</label>
          <input
            type="text"
            name="email"
            className="form-control"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>
            Phone No.<span className="text-danger fw-bold">*</span>
          </label>
          <input
            type="text"
            name="phone"
            className="form-control"
            placeholder="Your Phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>
            Message <span className="text-danger fw-bold">*</span>
          </label>
          <textarea
            name="message"
            className="form-control"
            placeholder="Your message"
            value={formData.message}
            onChange={handleChange}
          />
        </div>

        <button
          className="btn btn-light-main fw-medium rounded full-width"
          type="submit"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </>
  );
};

export default ContactForm;

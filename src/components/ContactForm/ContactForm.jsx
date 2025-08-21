import { useState } from "react";
import { sendContactMessage } from "../../api/public/contact.api"; // external API function

const ContactForm = ({ profile }) => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!contactForm.email) newErrors.email = "Email is required";
    if (!contactForm.message) newErrors.message = "Message is required";
    return newErrors;
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      // Pass to external API function
      await sendContactMessage(contactForm);
      alert("Message sent successfully!");
      setContactForm({ name: "", email: "", phone: "", message: "" }); // reset
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="sides-widget-header bg-main">
        <div className="agent-photo">
          <img src={profile.profile_image_url} alt="" />
        </div>
        <div className="sides-widget-details">
          <h4>
            <a href="#">{profile.agent_name}</a>
          </h4>
          <span>
            <i className="lni-phone-handset"></i>
            {profile.agent_phone}
          </span>
        </div>
        <div className="clearfix"></div>
      </div>

      <form className="sides-widget-body simple-form" onSubmit={submitForm}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Your Name"
            value={contactForm.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="text"
            name="email"
            className="form-control"
            placeholder="Your Email"
            value={contactForm.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-danger">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Phone No.</label>
          <input
            type="text"
            name="phone"
            className="form-control"
            placeholder="Your Phone"
            value={contactForm.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Message *</label>
          <textarea
            name="message"
            className="form-control"
            placeholder="Your message"
            value={contactForm.message}
            onChange={handleChange}
          />
          {errors.message && <p className="text-danger">{errors.message}</p>}
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

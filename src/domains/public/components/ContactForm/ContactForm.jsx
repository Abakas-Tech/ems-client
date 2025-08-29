import { useState, useEffect } from "react";
import { sendContactRequest } from "../../api/contact.api"; // external API function
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);

const ContactForm = ({ profile, id }) => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    propertyId: "", // start empty
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  //  Set propertyId
  useEffect(() => {
    if (id) {
      setContactForm((prev) => ({ ...prev, propertyId: id }));
    }
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!contactForm.message || !contactForm.email) {
      MySwal.fire({
        icon: "error",
        title: "Oops...",
        text: "Email and message are required!",
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await sendContactRequest(contactForm);
      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Form submitted successfully!",
        // timer: 2000,
        showConfirmButton: true,
      });
      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        propertyId: id, // keep propertyId intact after reset
      });
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
          <label>
            Email <span className="text-danger fw-bold">*</span>
          </label>
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
          <label>
            Message <span className="text-danger fw-bold">*</span>
          </label>
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

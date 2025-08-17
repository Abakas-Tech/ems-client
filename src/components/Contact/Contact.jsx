import React, { useState } from "react";
import { sendContactRequest } from "../../api/public/contact.api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message || !formData.email) {
      alert("message and email are required.");
      return;
    }
    try {
      await sendContactRequest(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  return (
    <>
      {/* Contact Section */}
      <section>
        <div className="container">
          <div className="row">
            {/* Contact Form */}
            <h2>Contact Me</h2>
            <div className="col-lg-7 col-md-7">
              {success ? (
                <p className="text-success text-center">
                  Thank you! Your message has been sent.
                </p>
              ) : (
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
                          required
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 col-md-6">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control simple"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phone No.</label>
                    <input
                      type="tel"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="form-control simple"
                    />
                  </div>

                  <div className="form-group">
                    <label>Message</label>
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
                    <button className="btn btn-main px-5 rounded" type="submit">
                      Submit Request
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="col-lg-5 col-md-5">
              <div className="contact-info">
                <h2>Get In Touch</h2>
                <p>
                  I’m here to help you with any questions about buying, selling,
                  or renting properties. Whether you’re looking for advice,
                  scheduling a viewing, or need more details about a listing,
                  feel free to reach out anytime.
                </p>

                <div className="cn-info-detail">
                  <div className="cn-info-icon">
                    <i className="fa-solid fa-house"></i>
                  </div>
                  <div className="cn-info-content">
                    <h4 className="cn-info-title">Reach Me</h4>
                    2512, New Market,
                    <br />
                    Eliza Road, Sincher 80 CA,
                    <br />
                    Canada, USA
                  </div>
                </div>

                <div className="cn-info-detail">
                  <div className="cn-info-icon">
                    <i className="fa-solid fa-envelope-circle-check"></i>
                  </div>
                  <div className="cn-info-content">
                    <h4 className="cn-info-title">Drop A Mail</h4>
                    support@Rikada.com
                    <br />
                    Rikada@gmail.com
                  </div>
                </div>

                <div className="cn-info-detail">
                  <div className="cn-info-icon">
                    <i className="fa-solid fa-phone-volume"></i>
                  </div>
                  <div className="cn-info-content">
                    <h4 className="cn-info-title">Call Me</h4>
                    (41) 123 521 458
                    <br />
                    +91 235 548 7548
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;

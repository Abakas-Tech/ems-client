import { useState, useEffect } from "react";
import sendContactEmail from "../../api/contact.api";
import getLocation from "../../api/location.api";
import getSocialMedias from "../../api/socialMedia.api";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";

const Contact = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [location, setLocation] = useState({
    latitude: 7.0559381,
    longitude: 38.4902358,
    address: "Hawassa, Ethiopia",
  });

  const [socialMedia, setSocialMedia] = useState({
    email: "info@ayshaagency.com",
    phone: "0911111111",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getLocation();
        if (res?.success && res?.data) {
          setLocation((prev) => ({
            latitude: res.data.latitude ?? prev.latitude,
            longitude: res.data.longitude ?? prev.longitude,
            address: res.data.address ?? prev.address,
          }));
        }

        const media = await getSocialMedias();
        if (media?.data) {
          setSocialMedia({
            email: media.data.email ?? "info@ayshaagency.com",
            phone: media.data.contact_number ?? "0911111111",
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const response = await sendContactEmail(formData);
      addMessage(
        response?.success ?? true,
        response?.message || "Message sent!",
      );
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      addMessage(false, "Failed to send email");
    } finally {
      hideLoader();
    }
  };

  return (
    <section id="contact" className="contact section">
      {/* Section Title */}
      <div className="container section-title " data-aos="fade-up">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Contact</h2>
          <p>
            <span>Need Help?</span>{" "}
            <span className="description-title">Contact Us</span>
          </p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            <div className="col-lg-5">
              <div className="info-wrap p-4 h-100 shadow-sm rounded-4 bg-white border">
                {/* Info Item: Address */}
                <div className="info-item d-flex align-items-center mb-4 p-3 rounded-3 contact-info-card">
                  <div className="icon-box d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-geo-alt fs-4"></i>
                  </div>
                  <div>
                    <h3 className="fs-6 fw-bold mb-1 text-dark">Address</h3>
                    <p className="small text-muted mb-0">{location.address}</p>
                  </div>
                </div>

                {/* Info Item: Call Us */}
                <div className="info-item d-flex align-items-center mb-4 p-3 rounded-3 contact-info-card">
                  <div className="icon-box d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-telephone fs-4"></i>
                  </div>
                  <div>
                    <h3 className="fs-6 fw-bold mb-1 text-dark">Call Us</h3>
                    <p className="small text-muted mb-0">{socialMedia.phone}</p>
                  </div>
                </div>

                {/* Info Item: Email Us */}
                <div className="info-item d-flex align-items-center mb-4 p-3 rounded-3 contact-info-card">
                  <div className="icon-box d-flex align-items-center justify-content-center me-3">
                    <i className="bi bi-envelope fs-4"></i>
                  </div>
                  <div>
                    <h3 className="fs-6 fw-bold mb-1 text-dark">Email Us</h3>
                    <p className="small text-muted mb-0">{socialMedia.email}</p>
                  </div>
                </div>

                {/* Map Container */}
                <div className="rounded-4 overflow-hidden border mt-2 shadow-sm">
                  <iframe
                    src={`https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`}
                    frameBorder="0"
                    style={{
                      border: 0,
                      width: "100%",
                      height: "260px",
                      display: "block",
                    }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <form
                onSubmit={handleSubmit}
                className="php-email-form"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <div className="row gy-4">
                  <div className="col-md-6">
                    <label htmlFor="name-field" className="pb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name-field"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="email-field" className="pb-2">
                      Your Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      id="email-field"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label htmlFor="phone-field" className="pb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      id="phone-field"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label htmlFor="message-field" className="pb-2">
                      Message
                    </label>
                    <textarea
                      className="form-control"
                      name="message"
                      rows="10"
                      id="message-field"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <div className="col-md-12 text-center">
                    {/* These divs are kept for template logic/CSS compatibility */}
                    <div className="loading" style={{ display: "none" }}>
                      Loading
                    </div>
                    <div className="error-message"></div>
                    <div className="sent-message">
                      Your message has been sent. Thank you!
                    </div>

                    <button type="submit">Send Message</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

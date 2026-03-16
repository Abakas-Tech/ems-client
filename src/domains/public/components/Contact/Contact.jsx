import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpen } from "react-icons/fa";
import sendContactEmail from "../../api/contact.api";
import getLocation from "../../api/location.api";
import getSocialMedia from "../../api/socialMedia.api";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import SendButton from "./../../../../shared/components/SendButton/SendButton";

const Contact = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [location, setLocation] = useState({
    latitude: "7.0559381", // fallback latitude
    longitude: "38.4902358", // fallback longitude
    address: "Hawassa",
    name: "Hawassa Office",
  });

  const [socialMedia, setSocialMedia] = useState({
    email: "sultan@ems.com",
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
            name: res.data.name ?? prev.name,
          }));
        }

        const media = await getSocialMedia();
        if (media?.data) {
          setSocialMedia((prev) => ({
            email: media.data.email ?? prev.email,
            phone: media.data.contact_number ?? prev.phone,
          }));
        }
      } catch (err) {
        addMessage(false, err.message);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    if (!formData.message || formData.message.trim() === "") {
      addMessage(false, "Message is required");
      return false;
    }
    if (formData.message.length > 500) {
      addMessage(false, "Message must be less than 500 characters");
      return false;
    }
    if (formData.name && formData.name.length > 50) {
      addMessage(false, "Name must be less than 50 characters");
      return false;
    }
    if (formData.email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(formData.email)) {
        addMessage(false, "Invalid email format");
        return false;
      }
      if (formData.email.length > 150) {
        addMessage(false, "Email must be less than 150 characters");
        return false;
      }
    }
    if (!formData.phone || !formData.phone.trim() === "") {
      addMessage(false, "Phone required");
      return false;
    }
    if (formData.phone && formData.phone.length > 20) {
      addMessage(false, "Phone must be less than 20 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    showLoader();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      };
      const response = await sendContactEmail(payload);
      addMessage(
        response?.success ?? true,
        response?.message || "Email sent successfully!",
      );
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      addMessage(false, err.message || "Failed to send email");
    } finally {
      hideLoader();
    }
  };

  // Keyless Google Maps embed using coordinates
  const mapSrc = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`;

  return (
    <div className="container-xxl py-5 my-5 border-top" id="contact">
      <div className="container">
        <div className="text-center" data-aos="flip-down" data-aos-delay="0.1s">
          <h2 className="pb-4  fw-bold">Contact Us For Any Query</h2>
        </div>
        <div className="row g-4">
          <div
            className="col-lg-4 col-md-6"
            data-aos="flip-down"
            data-aos-delay="0.1s"
          >
            <h2 className="mt-0 fw-bold">Get In Touch</h2>
            <p className="mb-4">
              Have a question or need assistance? We are here to help! Feel free
              to reach out to us for any inquiries, and we will get back to you
              as soon as possible. Your satisfaction is our priority!
            </p>
            <div className="d-flex align-items-center mb-3 mt-4">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 bg-info"
                style={{ width: "50px", height: "50px" }}
              >
                <FaMapMarkerAlt className="text-white" size={24} />
              </div>
              <div className="ms-3">
                <h5 className="text-info">{location.name}</h5>
                <p className="mb-0">{location.address}</p>
              </div>
            </div>
            <div className="d-flex align-items-center mb-3">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 bg-info"
                style={{ width: "50px", height: "50px" }}
              >
                <FaPhoneAlt className="text-white" size={24} />
              </div>
              <div className="ms-3">
                <h5 className="text-info">Mobile</h5>
                <p className="mb-0">{socialMedia.phone}</p>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 bg-info"
                style={{ width: "50px", height: "50px" }}
              >
                <FaEnvelopeOpen className="text-white" size={24} />
              </div>
              <div className="ms-3">
                <h5 className="text-info">Email</h5>
                <p className="mb-0">{socialMedia.email}</p>
              </div>
            </div>
          </div>

          <div
            className="col-lg-4 col-md-6"
            data-aos="fade-up"
            data-aos-delay="0.3s"
          >
            <iframe
              className="position-relative rounded w-100 h-100"
              src={mapSrc}
              frameBorder="0"
              style={{ minHeight: "300px", border: "0" }}
              allowFullScreen
              aria-hidden="false"
              tabIndex="0"
              title="Location Map"
            ></iframe>
          </div>

          <div
            className="col-lg-4 col-md-12"
            data-aos="fade-up"
            data-aos-delay="0.5s"
          >
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <label htmlFor="name">Your Name</label>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <label htmlFor="email">Your Email</label>
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      placeholder="Phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    <label htmlFor="phone">Phone</label>
                  </div>
                </div>

                <div className="col-12">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      placeholder="Leave a message here"
                      id="message"
                      style={{ height: "180px" }}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    ></textarea>
                    <label htmlFor="message">Message</label>
                  </div>
                </div>

                <div className="col-12 w-100">
                  <SendButton
                    type="submit"
                    className="text-white w-100 d-flex justify-content-center align-items-center"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

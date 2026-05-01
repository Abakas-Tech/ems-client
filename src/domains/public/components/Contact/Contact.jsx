import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpen } from "react-icons/fa";
import sendContactEmail from "../../api/contact.api";
import getLocation from "../../api/location.api";
import getSocialMedias from "../../api/socialMedia.api";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

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
    latitude: 7.0559381,
    longitude: 38.4902358,
    address: "Addis Ababa, Ethiopia",
    name: "Ayisha Office",
  });

  const [socialMedia, setSocialMedia] = useState({
    email: "ayishaagency.com",
    phone: "0911111111",
  });

  // ✅ Google Maps loader for Vite
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
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

        const media = await getSocialMedias();
        if (media?.data) {
          setSocialMedia((prev) => ({
            email: media.data.email ?? prev.email,
            phone: media.data.contact_number ?? prev.phone,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
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

  return (
    <section
      className="container px-3 px-lg-0"
      id="contact"
      style={{ padding: "100px 0" }}
    >
      <div>
        <div className="text-center">
          <h2 className="pb-4 fw-bold">Contact Us For Any Query</h2>
        </div>
        <div className="row g-4 gy-5">
          {/* Contact Info */}
          <div className="col-lg-4 col-md-6m">
            <h3 className="mt-0 fw-bold">Get In Touch</h3>
            <p className="mb-4">
              Have a question or need assistance? We are here to help! Reach out
              to us for any inquiries, and we will get back to you promptly.
            </p>

            <ContactItem
              icon={FaMapMarkerAlt}
              title={location.name}
              content={location.address}
            />
            <ContactItem
              icon={FaPhoneAlt}
              title="Mobile"
              content={
                <a href={`tel:${socialMedia.phone}`}>{socialMedia.phone}</a>
              }
            />
            <ContactItem
              icon={FaEnvelopeOpen}
              title="Email"
              content={
                <a href={`mailto:${socialMedia.email}`}>{socialMedia.email}</a>
              }
            />
          </div>

          {/* Google Map */}
          <div
            className="col-lg-4 col-md-6 "
            data-aos="fade-up"
            data-aos-delay="0.3s"
            style={{ minHeight: "300px" }}
          >
            {!isLoaded ? (
              <p>Loading map...</p>
            ) : (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "97%" }}
                center={{
                  lat: parseFloat(location.latitude),
                  lng: parseFloat(location.longitude),
                }}
                zoom={15}
              >
                <Marker
                  position={{
                    lat: parseFloat(location.latitude),
                    lng: parseFloat(location.longitude),
                  }}
                />
              </GoogleMap>
            )}
          </div>

          {/* Form */}
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
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="phone">
                      Phone <span className="text-danger">*</span>
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      placeholder="Leave a message here"
                      id="message"
                      style={{ height: "200px" }}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="message">
                      Message <span className="text-danger">*</span>
                    </label>
                  </div>
                </div>
                <div className="col-12 w-100">
                  <button
                    type="submit"
                    className="btn text-white w-100 d-flex fw-bold"
                    style={{ backgroundColor: "#105491" }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
// eslint-disable-next-line no-unused-vars
const ContactItem = ({ icon: Icon, title, content }) => (
  <div className="d-flex align-items-center mb-3 mt-4">
    <div
      className="d-flex align-items-center justify-content-center flex-shrink-0"
      style={{ width: "50px", height: "50px", backgroundColor: "#105491" }}
    >
      <Icon className="text-white" size={24} />
    </div>
    <div className="ms-3">
      <h5 style={{ color: "#105491" }}>{title}</h5>
      <p className="mb-0">{content}</p>
    </div>
  </div>
);

export default Contact;

import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpen, FaPaperPlane } from "react-icons/fa";
import sendContactEmail from "../../api/contact.api";
import getLocation from "../../api/location.api";
import getSocialMedias from "../../api/socialMedia.api";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import styles from "./Contact.module.css";

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
    name: "Office",
  });

  const [socialMedia, setSocialMedia] = useState({
    email: "",
    phone: "",
  });

  //  Google Maps loader for Vite
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
    <section className={styles.section} id="contact">
      <div className="container">
        <div className={styles.sectionHead}>
          <span className={styles.kicker}>Get in touch</span>
          <h2 className={styles.mainTitle}>Contact Us</h2>
        </div>

        <div className={styles.wrapper}>
          {/* Left: info (title/description full width, details + map side by side) */}
          <div className={styles.infoCol}>
            <h2 className={styles.title}>Let's Start Your Journey Abroad</h2>
            <p className={styles.subtitle}>
              Have a question or need assistance? We are here to help! Reach
              out to us for any inquiries, and we will get back to you
              promptly.
            </p>

            <div className={styles.infoRow}>
              <div className={styles.detailsList}>
                <div className={styles.detailCard}>
                  <FaMapMarkerAlt className={styles.detailIcon} />
                  <div>
                    <strong>{location.name}</strong>
                    <span>{location.address}</span>
                  </div>
                </div>

                <a
                  className={styles.detailCard}
                  href={`tel:${socialMedia.phone}`}
                >
                  <FaPhoneAlt className={styles.detailIcon} />
                  <div>
                    <strong>Mobile</strong>
                    <span>{socialMedia.phone || "Contact us"}</span>
                  </div>
                </a>

                <a
                  className={styles.detailCard}
                  href={`mailto:${socialMedia.email}`}
                >
                  <FaEnvelopeOpen className={styles.detailIcon} />
                  <div>
                    <strong>Email</strong>
                    <span>{socialMedia.email || "Contact us"}</span>
                  </div>
                </a>
              </div>

              <div className={styles.mapCol}>
                <div className={styles.mapWrapper}>
                  {!isLoaded ? (
                    <p className={styles.mapLoading}>Loading map...</p>
                  ) : (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={{
                        lat: parseFloat(location.latitude),
                        lng: parseFloat(location.longitude),
                      }}
                      zoom={14}
                      options={{
                        disableDefaultUI: true,
                        zoomControl: false,
                        styles: [
                          { elementType: "geometry", stylers: [{ color: "#3d2712" }] },
                          { elementType: "labels.text.fill", stylers: [{ color: "#cbb593" }] },
                          { elementType: "labels.text.stroke", stylers: [{ color: "#2a1a0c" }] },
                          { featureType: "road", elementType: "geometry", stylers: [{ color: "#54351b" }] },
                          { featureType: "water", elementType: "geometry", stylers: [{ color: "#2a1a0c" }] },
                          { featureType: "poi", stylers: [{ visibility: "off" }] },
                          { featureType: "transit", stylers: [{ visibility: "off" }] },
                        ],
                      }}
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
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className={styles.formCol}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className={styles.fieldGroup}>
                    <label htmlFor="name">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className={styles.fieldGroup}>
                    <label htmlFor="email">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className={styles.fieldGroup}>
                    <label htmlFor="phone">
                      Phone <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className={styles.fieldGroup}>
                    <label htmlFor="message">
                      Message <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      placeholder="Leave a message here"
                      id="message"
                      style={{ height: "140px" }}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-12 w-100">
                  <button type="submit" className={styles.submitBtn}>
                    <span>Send Message</span>
                    <FaPaperPlane />
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

export default Contact;
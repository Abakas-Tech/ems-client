import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpen } from "react-icons/fa";
import sendContactEmail from "../../api/contact.api";
import getLocation from "../../api/location.api";
import getSocialMedias from "../../api/socialMedia.api";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import {
  isValidPhone,
  PHONE_MIN_DIGITS,
  PHONE_MAX_DIGITS,
} from "../../../../utils/phone.utils";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const Contact = () => {
  const { t } = useTranslation();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // address/name stay null until the API provides them; until then the
  // translated defaults (contact.defaultAddress / defaultOfficeName) show.
  const [location, setLocation] = useState({
    latitude: 7.0559381,
    longitude: 38.4902358,
    address: null,
    name: null,
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
      addMessage(false, t("contact.errors.messageRequired"));
      return false;
    }
    if (formData.message.length > 500) {
      addMessage(false, t("contact.errors.messageTooLong"));
      return false;
    }
    if (formData.name && formData.name.length > 50) {
      addMessage(false, t("contact.errors.nameTooLong"));
      return false;
    }
    if (formData.email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(formData.email)) {
        addMessage(false, t("contact.errors.emailInvalid"));
        return false;
      }
      if (formData.email.length > 150) {
        addMessage(false, t("contact.errors.emailTooLong"));
        return false;
      }
    }
    if (!formData.phone || !formData.phone.trim() === "") {
      addMessage(false, t("contact.errors.phoneRequired"));
      return false;
    }
    if (formData.phone && !isValidPhone(formData.phone)) {
      addMessage(
        false,
        t("contact.errors.phoneInvalid", {
          min: PHONE_MIN_DIGITS,
          max: PHONE_MAX_DIGITS,
        }),
      );
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
      // Shown in the visitor's language rather than the API's English text.
      const success = response?.success ?? true;
      addMessage(success, success ? t("contact.success") : t("contact.failed"));
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error(err);
      addMessage(false, t("contact.failed"));
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
          <h2 className="pb-4 fw-bold">{t("contact.title")}</h2>
        </div>
        <div className="row g-4 gy-5">
          {/* Contact Info */}
          <div className="col-lg-4 col-md-6m">
            <h3 className="mt-0 fw-bold">{t("contact.getInTouch")}</h3>
            <p className="mb-4">{t("contact.intro")}</p>

            <ContactItem
              icon={FaMapMarkerAlt}
              title={location.name || t("contact.defaultOfficeName")}
              content={location.address || t("contact.defaultAddress")}
            />
            <ContactItem
              icon={FaPhoneAlt}
              title={t("contact.mobile")}
              content={
                <a href={`tel:${socialMedia.phone}`} dir="ltr">
                  {socialMedia.phone}
                </a>
              }
            />
            <ContactItem
              icon={FaEnvelopeOpen}
              title={t("contact.email")}
              content={
                <a href={`mailto:${socialMedia.email}`} dir="ltr">
                  {socialMedia.email}
                </a>
              }
            />
          </div>

          {/* Google Map */}
          <div className="col-lg-4 col-md-6 " style={{ minHeight: "300px" }}>
            {!isLoaded ? (
              <p>{t("contact.loadingMap")}</p>
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
          <div className="col-lg-4 col-md-12">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      placeholder={t("contact.form.name")}
                      value={formData.name}
                      onChange={handleChange}
                    />
                    <label htmlFor="name">{t("contact.form.name")}</label>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder={t("contact.form.email")}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    <label htmlFor="email">{t("contact.form.email")}</label>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-floating">
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      placeholder={t("contact.form.phone")}
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="phone">
                      {t("contact.form.phone")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      placeholder={t("contact.form.messagePlaceholder")}
                      id="message"
                      style={{ height: "200px" }}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="message">
                      {t("contact.form.message")}{" "}
                      <span className="text-danger">*</span>
                    </label>
                  </div>
                </div>
                <div className="col-12 w-100">
                  <button
                    type="submit"
                    className="btn text-white w-100 d-flex fw-bold"
                    style={{ backgroundColor: "#0B1F3A" }}
                  >
                    {t("contact.form.submit")}
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
      style={{ width: "50px", height: "50px", backgroundColor: "#0B1F3A" }}
    >
      <Icon className="text-white" size={24} />
    </div>
    {/* margin-inline-start = Bootstrap's ms-3 (1rem) in LTR, and the
        mirrored side in RTL */}
    <div style={{ marginInlineStart: "1rem" }}>
      <h5 style={{ color: "#0B1F3A" }}>{title}</h5>
      <p className="mb-0">{content}</p>
    </div>
  </div>
);

export default Contact;

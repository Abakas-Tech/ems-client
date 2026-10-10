import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  Loader2,
  CircleCheck,
  CircleAlert,
  Navigation,
} from "lucide-react";

import sendContactEmail from "../../api/contact.api";
import { isValidPhone } from "../../../../utils/phone.utils";
import { useSiteInfo } from "../../context/SiteInfo";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import styles from "./Contact.module.css";

const EMPTY = { name: "", email: "", phone: "", message: "" };
const MESSAGE_MAX = 500;

/* Soft, desaturated map that sits quietly inside the dark panel */
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#eef1f8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#5a6585" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#f7f8fc" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dfe4f2" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d6f5" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

/* Same rules the form has always enforced; values are message keys
   under contact.errors so they follow the active language. */
const validate = (data) => {
  const errors = {};
  if (data.name && data.name.length > 50) {
    errors.name = "nameLong";
  }
  if (data.email) {
    if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "emailInvalid";
    else if (data.email.length > 150)
      errors.email = "emailLong";
  }
  // Same phone rule the server enforces (optional +country code, 7–15 digits)
  if (!data.phone || data.phone.trim() === "") errors.phone = "phoneRequired";
  else if (!isValidPhone(data.phone)) errors.phone = "phoneInvalid";
  if (!data.message || data.message.trim() === "") {
    errors.message = "messageRequired";
  } else if (data.message.length > MESSAGE_MAX) {
    errors.message = "messageLong";
  }
  return errors;
};

function Field({ id, label, required, error, children, hint }) {
  const { t } = useTranslation();
  return (
    <div className={`${styles.field} ${error ? styles.fieldError : ""}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? (
          <span className={styles.req} aria-hidden="true">
            *
          </span>
        ) : (
          <span className={styles.optional}>{t("contact.optional")}</span>
        )}
      </label>
      {children}
      <div className={styles.fieldFoot}>
        {error ? (
          <span id={`${id}-error`} className={styles.error} role="alert">
            {t(`contact.errors.${error}`)}
          </span>
        ) : (
          <span />
        )}
        {hint}
      </div>
    </div>
  );
}

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function MapFallback({ text }) {
  return (
    <div className={styles.mapFallback}>
      <MapPin size={26} />
      <span>{text}</span>
    </div>
  );
}

/* Only mounted when an API key is configured, so no Maps script loads otherwise */
function OfficeMap({ lat, lng, name, address }) {
  const { t } = useTranslation();
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY });
  if (loadError) return <MapFallback text={address} />;
  if (!isLoaded) return <MapFallback text={t("contact.loadingMap")} />;
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={{ lat, lng }}
      zoom={14}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "cooperative",
        styles: MAP_STYLES,
      }}
    >
      <Marker position={{ lat, lng }} title={name} />
    </GoogleMap>
  );
}

function Contact() {
  const { t, i18n } = useTranslation();
  /* Server messages are English; show them only on the English site */
  const isEnglish = (i18n.resolvedLanguage || "en") === "en";
  const { phone, email, location } = useSiteInfo();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const lat = parseFloat(location.latitude);
  const lng = parseFloat(location.longitude);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  const directions = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
    if (status.state !== "idle" && status.state !== "sending") {
      setStatus({ state: "idle", message: "" });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = ["name", "email", "phone", "message"].find((k) => found[k]);
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    setStatus({ state: "sending", message: "" });
    try {
      const response = await sendContactEmail({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      const ok = response?.success ?? true;
      setStatus({
        state: ok ? "success" : "error",
        message: response?.message || "",
      });
      if (ok) setForm(EMPTY);
    } catch (err) {
      // The server re-validates; point at the phone field instead of a
      // generic error when that is what it rejected.
      if (err.status === 422 && /phone/i.test((err.errors || []).join(" ") || err.message)) {
        setErrors((e) => ({ ...e, phone: "phoneInvalid" }));
        setStatus({ state: "idle", message: "" });
        document.getElementById("contact-phone")?.focus();
        return;
      }
      setStatus({ state: "error", message: err.message || "" });
    }
  };

  const sending = status.state === "sending";
  const describedBy = (k) => (errors[k] ? `contact-${k}-error` : undefined);

  return (
    <section
      id="contact"
      className={`vx-section ${styles.section}`}
      aria-labelledby="contact-title"
    >
      <div className="vx-container">
        <SectionHeading
          id="contact-title"
          ns="contact"
        />

        <Reveal className={styles.shell}>
          {/* Info panel */}
          <aside className={styles.info}>
            <div className={styles.infoGlow} aria-hidden="true" />
            <div className={styles.infoHead}>
              <h3 className={styles.infoTitle}>
                {t("contact.infoTitle")}{" "}
                <span className="vx-serif">{t("contact.infoAccent")}</span>
              </h3>
              <p className={styles.infoText}>
                {t("contact.infoText")}
              </p>
            </div>

            <ul className={styles.details}>
              <li>
                <div className={styles.detailRow}>
                  <span className={styles.detailIcon}>
                    <MapPin size={18} />
                  </span>
                  <span className={styles.detailBody}>
                    <small>{location.name}</small>
                    <span>{location.address}</span>
                  </span>
                </div>
              </li>
              <li>
                <a href={phone ? `tel:${phone}` : "#contact-form"} className={`${styles.detailRow} ${styles.detailLink}`}>
                  <span className={styles.detailIcon}>
                    <Phone size={18} />
                  </span>
                  <span className={styles.detailBody}>
                    <small>{t("contact.mobile")}</small>
                    <span>{phone ? <bdi dir="ltr">{phone}</bdi> : t("contact.contactUs")}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={email ? `mailto:${email}` : "#contact-form"} className={`${styles.detailRow} ${styles.detailLink}`}>
                  <span className={styles.detailIcon}>
                    <Mail size={18} />
                  </span>
                  <span className={styles.detailBody}>
                    <small>{t("contact.email")}</small>
                    <span>{email ? <bdi dir="ltr">{email}</bdi> : t("contact.contactUs")}</span>
                  </span>
                </a>
              </li>
            </ul>

            <div className={styles.map}>
              {MAPS_KEY && hasCoords ? (
                <OfficeMap
                  lat={lat}
                  lng={lng}
                  name={location.name}
                  address={location.address}
                />
              ) : (
                <MapFallback text={location.address} />
              )}
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.directions}
              >
                <Navigation size={14} /> {t("contact.directions")}
              </a>
            </div>
          </aside>

          {/* Form */}
          <div className={styles.formWrap}>
            <AnimatePresence mode="wait" initial={false}>
              {status.state === "success" ? (
                <Motion.div
                  key="success"
                  className={styles.success}
                  role="status"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45 }}
                >
                  <span className={styles.successIcon}>
                    <CircleCheck size={34} strokeWidth={1.8} />
                  </span>
                  <h3>{t("contact.sentTitle")}</h3>
                  <p>{isEnglish && status.message ? status.message : t("contact.sentText")}</p>
                  <button
                    type="button"
                    className="vx-btn vx-btn--ghost"
                    onClick={() => setStatus({ state: "idle", message: "" })}
                  >
                    {t("contact.another")}
                  </button>
                </Motion.div>
              ) : (
                <Motion.form
                  key="form"
                  id="contact-form"
                  className={styles.form}
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.45 }}
                >
                  <div className={styles.formHead}>
                    <h3>{t("contact.formTitle")}</h3>
                    <p>{t("contact.requiredNote")}</p>
                  </div>

                  <div className={styles.row}>
                    <Field id="contact-name" label={t("contact.name")} error={errors.name}>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder={t("contact.namePh")}
                        value={form.name}
                        onChange={onChange}
                        maxLength={60}
                        aria-invalid={!!errors.name}
                        aria-describedby={describedBy("name")}
                        className={styles.input}
                      />
                    </Field>
                    <Field id="contact-email" label={t("contact.emailLabel")} error={errors.email}>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder={t("contact.emailPh")}
                        dir="ltr"
                        value={form.email}
                        onChange={onChange}
                        aria-invalid={!!errors.email}
                        aria-describedby={describedBy("email")}
                        className={styles.input}
                      />
                    </Field>
                  </div>

                  <Field id="contact-phone" label={t("contact.phone")} required error={errors.phone}>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder={t("contact.phonePh")}
                      dir="ltr"
                      value={form.phone}
                      onChange={onChange}
                      aria-required="true"
                      aria-invalid={!!errors.phone}
                      aria-describedby={describedBy("phone")}
                      className={styles.input}
                    />
                  </Field>

                  <Field
                    id="contact-message"
                    label={t("contact.message")}
                    required
                    error={errors.message}
                    hint={
                      <span
                        className={`${styles.counter} ${
                          form.message.length > MESSAGE_MAX ? styles.counterOver : ""
                        }`}
                      >
                        {form.message.length}/{MESSAGE_MAX}
                      </span>
                    }
                  >
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      placeholder={t("contact.messagePh")}
                      value={form.message}
                      onChange={onChange}
                      aria-required="true"
                      aria-invalid={!!errors.message}
                      aria-describedby={describedBy("message")}
                      className={`${styles.input} ${styles.textarea}`}
                    />
                  </Field>

                  {status.state === "error" && (
                    <div className={styles.alert} role="alert">
                      <CircleAlert size={18} />
                      <span>{isEnglish && status.message ? status.message : t("contact.failed")}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`vx-btn vx-btn--primary ${styles.submit}`}
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 size={18} className={styles.spin} /> {t("contact.sending")}
                      </>
                    ) : (
                      <>
                        {t("contact.send")} <Send size={17} className="vx-flip" />
                      </>
                    )}
                  </button>
                </Motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Contact;

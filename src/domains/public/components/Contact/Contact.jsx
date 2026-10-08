import { useState } from "react";
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

/* Same rules the form has always enforced */
const validate = (data) => {
  const errors = {};
  if (data.name && data.name.length > 50) {
    errors.name = "Name must be less than 50 characters";
  }
  if (data.email) {
    if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = "Invalid email format";
    else if (data.email.length > 150)
      errors.email = "Email must be less than 150 characters";
  }
  if (!data.phone || data.phone.trim() === "") errors.phone = "Phone required";
  else if (data.phone.length > 20)
    errors.phone = "Phone must be less than 20 characters";
  if (!data.message || data.message.trim() === "") {
    errors.message = "Message is required";
  } else if (data.message.length > MESSAGE_MAX) {
    errors.message = "Message must be less than 500 characters";
  }
  return errors;
};

function Field({ id, label, required, error, children, hint }) {
  return (
    <div className={`${styles.field} ${error ? styles.fieldError : ""}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required ? (
          <span className={styles.req} aria-hidden="true">
            *
          </span>
        ) : (
          <span className={styles.optional}>Optional</span>
        )}
      </label>
      {children}
      <div className={styles.fieldFoot}>
        {error ? (
          <span id={`${id}-error`} className={styles.error} role="alert">
            {error}
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
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: MAPS_KEY });
  if (loadError) return <MapFallback text={address} />;
  if (!isLoaded) return <MapFallback text="Loading map…" />;
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
        message:
          response?.message ||
          (ok ? "Email sent successfully!" : "Failed to send email"),
      });
      if (ok) setForm(EMPTY);
    } catch (err) {
      setStatus({ state: "error", message: err.message || "Failed to send email" });
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
          eyebrow="Get in touch"
          title={
            <>
              Contact <span className="vx-serif">us</span>
            </>
          }
          lead="Reach out with any questions, we are here to help you start your journey abroad for a better future."
        />

        <Reveal className={styles.shell}>
          {/* Info panel */}
          <aside className={styles.info}>
            <div className={styles.infoGlow} aria-hidden="true" />
            <div className={styles.infoHead}>
              <h3 className={styles.infoTitle}>
                Let’s start your journey <span className="vx-serif">abroad</span>
              </h3>
              <p className={styles.infoText}>
                Have a question or need assistance? We are here to help! Reach
                out to us for any inquiries, and we will get back to you
                promptly.
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
                    <small>Mobile</small>
                    <span>{phone || "Contact us"}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={email ? `mailto:${email}` : "#contact-form"} className={`${styles.detailRow} ${styles.detailLink}`}>
                  <span className={styles.detailIcon}>
                    <Mail size={18} />
                  </span>
                  <span className={styles.detailBody}>
                    <small>Email</small>
                    <span>{email || "Contact us"}</span>
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
                <Navigation size={14} /> Get directions
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
                  <h3>Message sent</h3>
                  <p>{status.message}</p>
                  <button
                    type="button"
                    className="vx-btn vx-btn--ghost"
                    onClick={() => setStatus({ state: "idle", message: "" })}
                  >
                    Send another message
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
                    <h3>Send us a message</h3>
                    <p>Fields marked * are required.</p>
                  </div>

                  <div className={styles.row}>
                    <Field id="contact-name" label="Your Name" error={errors.name}>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Full name"
                        value={form.name}
                        onChange={onChange}
                        maxLength={60}
                        aria-invalid={!!errors.name}
                        aria-describedby={describedBy("name")}
                        className={styles.input}
                      />
                    </Field>
                    <Field id="contact-email" label="Your Email" error={errors.email}>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={onChange}
                        aria-invalid={!!errors.email}
                        aria-describedby={describedBy("email")}
                        className={styles.input}
                      />
                    </Field>
                  </div>

                  <Field id="contact-phone" label="Phone" required error={errors.phone}>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="+251 9XX XXX XXX"
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
                    label="Message"
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
                      placeholder="Tell us how we can help — the role you're interested in, your questions, anything."
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
                      <span>{status.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`vx-btn vx-btn--primary ${styles.submit}`}
                    disabled={sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 size={18} className={styles.spin} /> Sending…
                      </>
                    ) : (
                      <>
                        Send Message <Send size={17} />
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

import React, { useRef, useState, useEffect } from "react";
import Modal from "react-modal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import styles from "./CreateModal.module.css";

Modal.setAppElement("#root");

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

const CreateModal = ({
  show,
  onClose,
  onCreate,
  fields = [],
  title = "",
  btnLabel = "Create",
  renderCustomField,
  // When `children` is passed, the modal renders the shared shell (overlay,
  // shake-on-outside-click, slide-in animation, title) around arbitrary
  // content instead of the fields-driven form + Cancel/Create footer below -
  // the caller owns its own actions/close handling in that case. Existing
  // callers never pass this, so their form behavior is unchanged.
  children,
  // Optional override for the modal's max-width (default comes from
  // CreateModal.module.css's .modal class, sized for short field forms).
  maxWidth,
  // Optional override for the overlay's z-index, applied inline (highest
  // possible CSS priority, so it's never in doubt against the class-based
  // default). Needed when this modal can be open AT THE SAME TIME as
  // another portal-rendered modal (e.g. ConfirmDeleteModal, triggered via
  // useDelete while this is open) that must stack above it.
  overlayZIndex,
}) => {
  const modalRef = useRef(null);
  const [shake, setShake] = useState("idle");

  // Initialize input values from fields prop
  const initialValues = {};
  fields.forEach((field) => {
    initialValues[field.name] = field.value || "";
  });
  const [inputValues, setInputValues] = useState(initialValues);

  // Sync inputValues if fields change
  useEffect(() => {
    setInputValues((prev) => {
      const newValues = { ...prev };
      fields.forEach((field) => {
        if (!(field.name in prev)) {
          newValues[field.name] = field.value || "";
        }
      });
      return newValues;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.length]);

  // Shake on clicking outside
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShake("shake");
      setTimeout(() => setShake("idle"), 500);
    }
  };
  // AFTER — only fires when modal transitions closed → open
  const prevShowRef = useRef(false);

  useEffect(() => {
    if (show && !prevShowRef.current) {
      const vals = {};
      fields.forEach((field) => {
        vals[field.name] =
          field.initialValue !== undefined && field.initialValue !== null
            ? field.initialValue
            : "";
      });
      setInputValues(vals);
    }
    prevShowRef.current = show;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]); // ← only depends on show, not fields

  useEffect(() => {
    if (show) {
      document.addEventListener("mousedown", handleOverlayClick);
    } else {
      document.removeEventListener("mousedown", handleOverlayClick);
    }
    return () => document.removeEventListener("mousedown", handleOverlayClick);
  }, [show]);

  // Update a specific field value
  const handleChange = (name, value) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handle create using native form validation
  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity()) {
      // Shake animation if validation fails
      setShake("shake");
      setTimeout(() => setShake("idle"), 500);
      form.reportValidity(); // Show browser native validation
      return;
    }

    onCreate(inputValues);
    onClose();
  };

  return (
    <Modal
      isOpen={show}
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => {}}
      className={styles.modal}
      overlayClassName={styles.overlay}
      style={
        maxWidth || overlayZIndex
          ? {
              ...(maxWidth ? { content: { maxWidth } } : {}),
              ...(overlayZIndex ? { overlay: { zIndex: overlayZIndex } } : {}),
            }
          : undefined
      }
      closeTimeoutMS={200}
    >
      <motion.div
        ref={modalRef}
        variants={shakeVariants}
        animate={shake}
        initial="idle"
        className={styles.modalInner}
      >
        {children ? (
          <>
            {title && <h3 className={styles.modalTitle}>{title}</h3>}
            {children}
          </>
        ) : (
          <form onSubmit={handleSubmit} className="submit-section">
            <h3 className={styles.modalTitle}>{title}</h3>

            {fields.map((field) => (
              <div
                key={field.name}
                className="form-group"
                style={{ marginBottom: "1rem" }}
              >
                <h6>
                  {field.label} <span className="text-danger">*</span>
                </h6>
                {field.type === "custom" && renderCustomField ? (
                  renderCustomField(field, inputValues, handleChange)
                ) : field.type === "select" ? (
                  <select
                    className="form-control"
                    value={inputValues[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required
                    disabled={!!field.disabled}
                    style={{
                      backgroundColor: field.disabled ? "#f0f0f0" : "#EDF1FB",
                      cursor: field.disabled ? "not-allowed" : "default",
                    }}
                  >
                    <option value="">Select {field.label}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    className="form-control"
                    rows="4"
                    value={inputValues[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required
                    disabled={!!field.disabled}
                    style={{ backgroundColor: "#EDF1FB" }}
                  />
                ) : (
                  <input
                    type={field.type || "text"}
                    className="form-control"
                    value={inputValues[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required
                    style={{ backgroundColor: "#EDF1FB" }}
                  />
                )}
              </div>
            ))}

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className={styles.createButton}>
                {btnLabel}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </Modal>
  );
};

export default CreateModal;

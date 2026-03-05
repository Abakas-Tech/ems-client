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
  }, [fields.length]);

  // Shake on clicking outside
  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShake("shake");
      setTimeout(() => setShake("idle"), 500);
    }
  };

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
      closeTimeoutMS={200}
    >
      <motion.div
        ref={modalRef}
        variants={shakeVariants}
        animate={shake}
        initial="idle"
        className={styles.modalInner}
      >
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
                  value={inputValues[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required
                  style={{ backgroundColor: "#EDF1FB" }}
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
      </motion.div>
    </Modal>
  );
};

export default CreateModal;

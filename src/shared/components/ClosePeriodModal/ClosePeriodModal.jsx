import React, { useRef, useState, useEffect } from "react";
import Modal from "react-modal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
// Reuses CreateModal's own CSS module so this modal is guaranteed to match
// its visual style, animation, spacing, and theme behavior exactly —
// per the requirement that this belongs to the same confirmation system.
import styles from "../CreateModal/CreateModal.module.css";

Modal.setAppElement("#root");

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

const ClosePeriodModal = ({ show, onClose, onConfirm, periodTitle }) => {
  const modalRef = useRef(null);
  const [shake, setShake] = useState("idle");
  const [closingNote, setClosingNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset the note whenever the modal transitions closed → open, same as
  // CreateModal resets its fields on open.
  const prevShowRef = useRef(false);
  useEffect(() => {
    if (show && !prevShowRef.current) {
      setClosingNote("");
    }
    prevShowRef.current = show;
  }, [show]);

  // Shake on clicking outside — identical behavior to CreateModal.
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    if (!form.checkValidity()) {
      setShake("shake");
      setTimeout(() => setShake("idle"), 500);
      form.reportValidity();
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm({ closing_note: closingNote });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (submitting) return;
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
          <h3 className={styles.modalTitle}>
            Confirm Period Closing
          </h3>

          <p
            className="text-muted text-center mb-4"
            style={{ fontSize: "0.9rem" }}
          >
            You're about to close{" "}
            <strong>{periodTitle || "the current financial period"}</strong>.
            This freezes its totals after audit and opens a new period,
            existing transactions are kept, not deleted.
          </p>

          <div className="form-group" style={{ marginBottom: "1rem" }}>
            <h6>
              Closing Note <span className="text-danger">*</span>
            </h6>
            <textarea
              className="form-control"
              rows="4"
              value={closingNote}
              onChange={(e) => setClosingNote(e.target.value)}
              required
              disabled={submitting}
              placeholder="Add any remarks about this closing "
              style={{ backgroundColor: "#EDF1FB" }}
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.createButton}
              disabled={submitting}
            >
              {submitting ? "Closing..." : "Confirm & Close"}
            </button>
          </div>
        </form>
      </motion.div>
    </Modal>
  );
};

export default ClosePeriodModal;

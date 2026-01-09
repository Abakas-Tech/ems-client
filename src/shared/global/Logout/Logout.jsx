import React, { useRef, useState, useEffect } from "react";
import Modal from "react-modal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import styles from "./Logout.module.css";

Modal.setAppElement("#root");

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

const Logout = ({ show, onClose, onConfirm }) => {
  const modalRef = useRef(null);
  const [shake, setShake] = useState("idle");

  // Handle clicking outside the modal to trigger shake
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
        <h4 className={styles.modalTitle}>Are you sure you want to logout?</h4>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm}>
            Logout
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default Logout;

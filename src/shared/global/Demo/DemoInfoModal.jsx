import React, { useRef, useState } from "react";
import Modal from "react-modal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import styles from "./demoInfoModal.module.css";

Modal.setAppElement("#root");

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

const DemoInfoModal = ({ isOpen, onClose, type }) => {
  const modalRef = useRef(null);
  const [shake, setShake] = useState("idle");

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShake("shake");
      setTimeout(() => setShake("idle"), 500);
    }
  };

  const message =
    type === "changePassword"
      ? "This is a demo website, so you cannot change the password. When you get your own live web app, you’ll be able to change it."
      : "This is a demo website, so reset password emails are only sent to our server. On your own web app, this feature will work normally.";

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => {}}
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeTimeoutMS={200}
      overlayRef={(node) => {
        if (node) node.onclick = handleOverlayClick;
      }}
    >
      <motion.div
        ref={modalRef}
        variants={shakeVariants}
        animate={shake}
        initial="idle"
        className={styles.modalInner}
      >
        <h4 className={styles.modalTitle}>
          {type === "changePassword" ? "Change Password" : "Reset Password"}
        </h4>
        <p className={styles.modalText}>{message}</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            OK
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default DemoInfoModal;

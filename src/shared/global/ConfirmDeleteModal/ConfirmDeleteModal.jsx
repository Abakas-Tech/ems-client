import React, { useRef, useState } from "react";
import Modal from "react-modal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useConfirmDelete } from "../../../context/Delete/useDelete";
import styles from "./ConfirmDeleteModal";

Modal.setAppElement("#root");

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

const ConfirmDeleteModal = () => {
  const { isOpen, closeModal, confirmAndClose } = useConfirmDelete();

  const modalRef = useRef(null);
  const [shake, setShake] = useState("idle");

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShake("shake");
      setTimeout(() => setShake("idle"), 500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      shouldCloseOnOverlayClick={false}
      onRequestClose={() => {}}
      className={styles.modal}
      overlayClassName={styles.overlay}
      closeTimeoutMS={200}
      overlayRef={(node) => {
        if (node) {
          node.onclick = handleOverlayClick;
        }
      }}
    >
      <motion.div
        ref={modalRef}
        variants={shakeVariants}
        animate={shake}
        initial="idle"
        className={styles.modalInner} // <- CSS animation applied here
      >
        <h4 className={styles.modalTitle}>
          Are you sure you want to delete this item?
        </h4>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={closeModal}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={confirmAndClose}>
            Delete
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default ConfirmDeleteModal;

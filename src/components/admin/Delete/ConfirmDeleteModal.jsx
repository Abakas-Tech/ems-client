import React, { useRef, useState } from "react";
import Modal from "react-modal";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useConfirmDelete } from "../../../context/Delete/UseDelete";
import styles from "./confirmDelete.module.css";

Modal.setAppElement("#root");

const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

const ConfirmDeleteModal = () => {
  const { isOpen, itemName, closeModal, confirmAndClose } = useConfirmDelete();

  const modalRef = useRef(null);
  const [shake, setShake] = useState("idle");

  const handleOverlayClick = (e) => {
    // If the user clicks outside the modal content
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
      // 💡 This adds the overlay click listener
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
        className={styles.modalInner}
      >
        <h4 className={styles.modalTitle}>Are you sure?</h4>
        <p className={styles.modalText}>
          Do you really want to delete <strong>{itemName}</strong>? This action
          cannot be undone.
        </p>
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

import React from "react";
import { Modal, Button } from "react-bootstrap";
import styles from "./Logout.module.css";

const Logout = ({ show, onClose, onConfirm }) => {
  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <div className={styles.modalContent}>
        <Modal.Body>
          <h5 className={styles.title}>Are you sure you want to logout?</h5>
          <div className={styles.actions}>
            <button
              variant="secondary"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              variant="danger"
              onClick={onConfirm}
              className={styles.logoutBtn}
            >
              Logout
            </button>
          </div>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default Logout;

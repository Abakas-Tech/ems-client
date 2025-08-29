import React from "react";
import { Modal } from "react-bootstrap";

const AppointmentsDeleteModal = ({ show, onClose, onConfirm }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete this appointment?</p>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Delete
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AppointmentsDeleteModal;

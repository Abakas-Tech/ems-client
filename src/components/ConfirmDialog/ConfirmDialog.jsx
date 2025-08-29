import React from "react";
import { Modal, Button } from "react-bootstrap";
import PropTypes from "prop-types";

const ConfirmDialog = ({ show, title, message, onConfirm, onCancel }) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      style={{ zIndex: 1050 }} // Lower than loader's z-index (e.g., 2001 or 10000)
    >
      <Modal.Header closeButton>
        <Modal.Title>{title || "Confirm Action"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ConfirmDialog.propTypes = {
  show: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ConfirmDialog;

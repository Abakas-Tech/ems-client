// src/components/global/Logout/Logout.jsx
import React from "react";

const Logout = ({ show, onClose, onConfirm }) => {
  if (!show) return null; // hide modal when not needed

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h5>Confirm Logout</h5>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to logout?</p>
        </div>
        <div className="modal-footer">
          {/* Cancel button */}
          <button
            type="button"
            className="btn btn-secondary" // background color for cancel
            onClick={onClose}
          >
            Cancel
          </button>

          {/* Logout button */}
          <button
            type="button"
            className="btn btn-danger" // background color for logout
            onClick={onConfirm}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;

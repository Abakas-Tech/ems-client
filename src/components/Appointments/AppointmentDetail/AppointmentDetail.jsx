// src/components/Appointments/AppointmentDetail.jsx
import React from "react";

const AppointmentDetail = ({ appointment, onClose }) => {
  if (!appointment) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Appointment Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <p>
              <strong>Title:</strong> {appointment.title}
            </p>
            <p>
              <strong>Status:</strong> {appointment.status}
            </p>
            <p>
              <strong>Start:</strong>{" "}
              {new Date(appointment.start_time).toLocaleString()}
            </p>
            <p>
              <strong>End:</strong>{" "}
              {new Date(appointment.end_time).toLocaleString()}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {appointment.description || "No description"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;

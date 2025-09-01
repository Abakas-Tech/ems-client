// src/components/Appointments/AppointmentDetail/AppointmentDetail.jsx
import React from "react";
import styles from "./AppointmentDetail.module.css";

const AppointmentDetail = ({ appointment, onClose }) => {
  if (!appointment) return null;

  return (
    <div className={`modal fade show d-block ${styles.overlay}`} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className={`modal-content ${styles.detailCard}`}>
          {/* Header */}
          <div className={`modal-header ${styles.header}`}>
            <h5 className="modal-title fw-bold">📌 Appointment Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className={`modal-body ${styles.body}`}>
            <div className="mb-3">
              <span className={styles.label}>Title:</span>
              <span className={styles.value}>{appointment.title}</span>
            </div>

            <div className="mb-3">
              <span className={styles.label}>Status:</span>
              <span
                className={`badge ${
                  appointment.status === "confirmed"
                    ? "bg-success"
                    : appointment.status === "pending"
                    ? "bg-warning text-dark"
                    : "bg-danger"
                }`}
              >
                {appointment.status}
              </span>
            </div>

            <div className="mb-3">
              <span className={styles.label}>Start:</span>
              <span className={styles.value}>
                {new Date(appointment.start_time).toLocaleString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // or false if you prefer 24h
                })}
              </span>
            </div>

            <div className="mb-3">
              <span className={styles.label}>End:</span>
              <span className={styles.value}>
                {new Date(appointment.end_time).toLocaleString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true, // or false if you prefer 24h
                })}
              </span>
            </div>

            <div>
              <span className={styles.label}>Description:</span>
              <p className={styles.description}>
                {appointment.description || "No description"}
              </p>
            </div>
            {/* add edit and delete buttons */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;

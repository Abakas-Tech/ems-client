import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";

const AppointmentsModal = ({ show, onClose, onSave, appointment }) => {
  const [form, setForm] = useState({
    title: "",
    startTime: "",
    endTime: "",
    status: "pending",
    description: "",
  });

  useEffect(() => {
    if (appointment) {
      setForm({
        title: appointment.title || "",
        startTime: appointment.start_time?.slice(0, 16) || "",
        endTime: appointment.end_time?.slice(0, 16) || "",
        status: appointment.status || "pending",
        description: appointment.description || "",
      });
    } else {
      setForm({
        title: "",
        startTime: "",
        endTime: "",
        status: "pending",
        description: "",
      });
    }
  }, [appointment]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={false}
      style={{ zIndex: 1000 }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {appointment ? "Edit Appointment" : "New Appointment"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
            <label className="form-label">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">End Time</label>
            <input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="form-control"
              rows="3"
            ></textarea>
          </div>

          <div className="col-12 text-end">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AppointmentsModal;

// src/pages/Appointments/Appointments.jsx
import React, { useEffect, useState } from "react";
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../api/admin/appointments.api";

import useLoader from "../../context/Loader/UseLoader";
import useResponse from "../../context/response/UseResponse";

import AppointmentsTable from "../../components/Appointments/AppointmentsTable/AppointmentsTable";
import AppointmentsCalendar from "../../components/Appointments/AppointmentsCalendar/AppointmentsCalendar";
import AppointmentDetail from "../../components/Appointments/AppointmentDetail/AppointmentDetail";

import AppointmentsFilters from "../../components/Appointments/AppointmentsFilters/AppointmentsFilters";
import AppointmentsModal from "../../components/Appointments/AppointmentsModal";
import AppointmentsDeleteModal from "../../components/Appointments/AppointmentsDeleteModal";

const Appointments = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    status: "",
    title: "",
    startDate: "",
    endDate: "",
  });

  const [view, setView] = useState("table"); // "table" | "calendar"
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Fetch data
  const loadAppointments = async () => {
    showLoader();
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const { data } = await fetchAppointments(cleanFilters);
      setAppointments(data.appointments || []);
      setPagination(data.pagination || {});
    } catch (err) {
      addMessage("error", err.message || "Failed to load appointments");
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [filters]);

  // Handlers
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSave = async (formData) => {
    showLoader();
    try {
      if (selected) {
        await updateAppointment(selected.id, formData);
        addMessage("success", "Appointment updated");
      } else {
        await createAppointment(formData);
        addMessage("success", "Appointment created");
      }
      setShowModal(false);
      loadAppointments();
    } catch (err) {
      addMessage("error", err.message || "Failed to save appointment");
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async () => {
    showLoader();
    try {
      await deleteAppointment(selected.id);
      addMessage("success", "Appointment deleted");
      setShowDelete(false);
      loadAppointments();
    } catch (err) {
      addMessage("error", err.message || "Failed to delete appointment");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">📅 Appointments</h2>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm ${
              view === "table" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setView("table")}
          >
            📋 Table View
          </button>
          <button
            className={`btn btn-sm ${
              view === "calendar" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setView("calendar")}
          >
            📆 Calendar View
          </button>
          <button
            className="btn btn-success"
            onClick={() => {
              setSelected(null);
              setShowModal(true);
            }}
          >
            + New Appointment
          </button>
        </div>
      </div>

      {/* Filters */}
      <AppointmentsFilters
        filters={filters}
        onChange={handleFilterChange}
        onClear={() =>
          setFilters({
            page: 1,
            limit: 5,
            status: "",
            title: "",
            startDate: "",
            endDate: "",
          })
        }
      />

      {/* Views */}
      {view === "table" ? (
        <AppointmentsTable
          data={appointments}
          pagination={pagination}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
          onEdit={(row) => {
            setSelected(row);
            setShowModal(true);
          }}
          onDelete={(row) => {
            setSelected(row);
            setShowDelete(true);
          }}
          onSelect={(row) => setSelected(row)}
        />
      ) : (
        <AppointmentsCalendar
          events={appointments}
          onSelectEvent={(event) => setSelected(event)}
        />
      )}

      {/* Appointment Detail */}
      {selected && (
        <AppointmentDetail
          appointment={selected}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Modals */}
      {showModal && (
        <AppointmentsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          appointment={selected}
        />
      )}

      {showDelete && (
        <AppointmentsDeleteModal
          show={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default Appointments;

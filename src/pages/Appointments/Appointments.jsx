// src/pages/Appointments/Appointments.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../api/admin/appointments.api";

import useLoader from "../../context/Loader/UseLoader";
import useResponse from "../../context/response/UseResponse";

import AppointmentsTable from "../../components/Appointments/AppointmentsTable/AppointmentsTable";
import AppointmentsFilters from "../../components/Appointments/AppointmentsFilters";
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
    startDate: "",
    endDate: "",
  });

  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Fetch data
  const loadAppointments = async () => {
    showLoader();
    try {
      // remove empty fields before sending
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
      console.log(err);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-primary">📅 Appointments</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setSelected(null);
            setShowModal(true);
          }}
        >
          + New Appointment
        </button>
      </div>

      {/* Filters */}
      <AppointmentsFilters filters={filters} onChange={handleFilterChange} />

      {/* Table */}
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
      />

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

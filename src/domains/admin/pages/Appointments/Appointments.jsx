import React, { useEffect, useState } from "react";
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../api/appointments.api";

import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";

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

  const [view, setView] = useState("calendar"); // "table" | "calendar"

  // 🔹 separate states
  const [selected, setSelected] = useState(null); // for edit/delete
  const [detail, setDetail] = useState(null); // for detail view

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
        console.log(selected);
        await updateAppointment(selected.id, formData);
        addMessage("success", "Appointment updated");
      } else {
        await createAppointment(formData);
        addMessage("success", "Appointment created");
      }
      setShowModal(false);
      setSelected(null);
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
      setSelected(null);
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        {/* Title */}
        <h2 className="fw-bold text-dark m-0">📅 Appointments</h2>

        {/* Actions */}
        <div className="d-flex flex-wrap gap-2">
          {/* View Switcher */}
          <div className="btn-group" role="group" aria-label="View Switcher">
            <button
              className={`btn btn-sm ${
                view === "table"
                  ? "btn-outline-primary active"
                  : "btn-outline-primary"
              }`}
              onClick={() => setView("table")}
            >
              📋 Table
            </button>
            <button
              className={`btn btn-sm ${
                view === "calendar"
                  ? "btn-outline-primary active"
                  : "btn-outline-primary"
              }`}
              onClick={() => setView("calendar")}
            >
              📆 Calendar
            </button>
          </div>

          {/* Add New */}
          <button
            className="btn btn-primary btn-sm"
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
          onView={(row) => setDetail(row)} // 👁 detail
          onEdit={(row) => {
            setSelected(row); // ✏️ edit
            setShowModal(true);
          }}
          onDelete={(row) => {
            setSelected(row); // 🗑 delete
            setShowDelete(true);
          }}
        />
      ) : (
        <AppointmentsCalendar
          events={appointments}
          onSelectEvent={(event) => setDetail(event)} // 👁 calendar also opens detail
        />
      )}

      {/* Appointment Detail */}
      {detail && (
        <AppointmentDetail
          appointment={detail}
          onClose={() => setDetail(null)}
          onEdit={(row) => {
            setSelected(row); // ✏️ edit
            setShowModal(true);
          }}
          onDelete={(row) => {
            setSelected(row); // 🗑 delete
            setShowDelete(true);
          }}
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

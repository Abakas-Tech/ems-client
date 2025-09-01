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
import { useConfirmDelete } from "./../../../../context/Delete/UseDelete";

const Appointments = () => {
  const { showLoader, hideLoader } = useLoader();
  const { openModal } = useConfirmDelete();
  const { addMessage } = useResponse();

  const [appointments, setAppointments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
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

  // Fetch data
  const loadAppointments = async () => {
    showLoader();
    try {
      const cleanFilters = Object.fromEntries(
        // eslint-disable-next-line no-unused-vars
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const { data } = await fetchAppointments(cleanFilters);
      setAppointments(data.appointments || []);
      setPagination(data.pagination || {});
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Handlers
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSave = async (formData) => {
    showLoader();
    try {
      let response;

      if (selected) {
        response = await updateAppointment(selected.id, formData);
        addMessage("success", response?.message || "Appointment updated");
      } else {
        response = await createAppointment(formData);
        addMessage("success", response?.message || "Appointment created");
      }

      setShowModal(false);
      setSelected(null);
      loadAppointments();
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async () => {
    showLoader();
    try {
      const response = await deleteAppointment(selected.id);
      addMessage("success", response?.message || "Appointment deleted");
      setSelected(null);
      loadAppointments();
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          {/* Title */}
          <h2 className="fw-bold text-dark ">Appointments</h2>
          <p className="text-muted mb-0">
            View and manage your appointments, track upcoming and past meetings.
            
          </p>
        </div>

        {/* Actions */}
        <div className="d-flex align-items-center gap-2">
          {/* View Switcher */}
          <div className="btn-group" role="group" aria-label="View Switcher">
            <button
              className={`btn btn-md py-3 fw-semibold fs-6 ${
                view === "table"
                  ? "btn-outline-primary active"
                  : "btn-outline-primary"
              }`}
              onClick={() => setView("table")}
            >
              Table
            </button>
            <button
              className={`btn btn-md py-3 fw-semibold fs-6  ${
                view === "calendar"
                  ? "btn-outline-primary active"
                  : "btn-outline-primary"
              }`}
              onClick={() => setView("calendar")}
            >
              Calendar
            </button>
          </div>

          {/* Add New */}
          <button
            className="btn btn-primary btn-md fs-5 py-3"
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
          onView={(row) => setDetail(row)} // detail
          onEdit={(row) => {
            setSelected(row); //  edit
            setShowModal(true);
          }}
          onDelete={() => {
            openModal(async () => {
              await handleDelete();
            });
          }}
        />
      ) : (
        <AppointmentsCalendar
          events={appointments}
          onSelectEvent={(event) => setDetail(event)} // calendar also opens detail
        />
      )}

      {/* Appointment Detail */}
      {detail && (
        <AppointmentDetail
          appointment={detail}
          onClose={() => setDetail(null)}
          onEdit={(row) => {
            setSelected(row); //  edit
            setShowModal(true);
          }}
          onDelete={(row) => {
            openModal(async () => {
              await handleDelete(row.id);
            });
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
    </div>
  );
};

export default Appointments;

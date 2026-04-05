import React from "react";
import { useNavigate } from "react-router-dom";

import useloader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import BackButton from "../../../../shared/components/BackButton/BackButton";

const UserManual = () => {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();

  const goBack = () => {
    navigate(-1);
  };

  // Handle clicking a manual section
  const handleOpenSection = (section) => {
    showLoader();

    try {
      // simulate navigation / future API
      navigate(`/user-manual/${section}`);
    } catch (err) {
      addMessage(false, "Failed to open section");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      {/* Header */}
      <div className="mb-4">
        <BackButton onClick={goBack} />

        <h2 className="fw-bold text-dark mb-2">User Manual</h2>
        <p className="text-muted mb-0">
          Learn how to use the system step by step. Select a topic below to get
          started.
        </p>
      </div>

      {/* Buttons Section */}
      <div className="row g-3">
        {[
          {
            title: "How to Register Workers",
            key: "register-workers",
            icon: "bi-person-plus",
          },
          {
            title: "Managing Workers",
            key: "manage-workers",
            icon: "bi-people",
          },
          {
            title: "Sending Notifications",
            key: "notifications",
            icon: "bi-bell",
          },
          {
            title: "Managing Finances",
            key: "finances",
            icon: "bi-cash-stack",
          },
          {
            title: "Using Dashboard",
            key: "dashboard",
            icon: "bi-speedometer2",
          },
        ].map((item) => (
          <div key={item.key} className="col-12 col-md-6 col-lg-4">
            <button
              className="w-100 p-4 border rounded-4 shadow-sm bg-white text-start hover-shadow"
              onClick={() => handleOpenSection(item.key)}
              style={{ transition: "all 0.2s ease" }}
            >
              <div className="d-flex align-items-center">
                <i className={`bi ${item.icon} fs-3 me-3 text-primary`}></i>
                <div>
                  <h6 className="mb-1 fw-bold">{item.title}</h6>
                  <small className="text-muted">Click to learn more</small>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManual;

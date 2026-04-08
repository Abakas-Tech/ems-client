import React, { useState } from "react";
import BackButton from "../../../../shared/components/BackButton/BackButton";
import styles from "./UserManual.module.css";

const UserManual = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const tutorials = [
    {
      title: "Dashboard",
      desc: "See overall system information",
      icon: "bi-speedometer2",
      video: "https://www.youtube.com/embed/VIDEO_ID_9",
    },
    {
      title: "Profile",
      desc: "Update name, phone, email",
      icon: "bi bi-person-bounding-box",
      video: "https://www.youtube.com/embed/VIDEO_ID_2",
    },
    {
      title: "Users",
      desc: "Manage employers, staff, partners",
      icon: "bi-people",
      video: "https://www.youtube.com/embed/VIDEO_ID_3",
    },
    {
      title: "Employees",
      desc: "Manage workers going abroad",
      icon: "bi bi-person-check",
      video: "https://www.youtube.com/embed/VIDEO_ID_4",
    },
    {
      title: "Finance",
      desc: "Transactions and reports",
      icon: "bi bi-wallet",
      video: "https://www.youtube.com/embed/iNfGmzy1yEA",
    },
    {
      title: "File Manager",
      desc: "Upload and manage files",
      icon: "bi bi-files",
      video: "https://www.youtube.com/embed/VIDEO_ID_6",
    },
    {
      title: "Meta Data",
      desc: "Country, region, skills, status...",
      icon: "bi bi-database-add",
      video: "https://www.youtube.com/embed/VIDEO_ID_7",
    },
    {
      title: "Notifications",
      desc: "Send and manage alerts",
      icon: "bi-bell",
      video: "https://www.youtube.com/embed/VIDEO_ID_8",
    },
    {
      title: "Public Content",
      desc: "Gallery, location, social media",
      icon: "bi bi-layout-text-sidebar-reverse",
      video: "https://www.youtube.com/embed/VIDEO_ID_9",
    },
    {
      title: "Settings",
      desc: "Change password",
      icon: "bi-gear",
      video: "https://www.youtube.com/embed/YlymmezLjHk",
    },
  ];

  return (
    <div className="dashboard-wraper">
      {selectedVideo && <BackButton onClick={() => setSelectedVideo(null)} />}

      {!selectedVideo ? (
        <>
          {/* Header */}
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-2">User Manual</h2>
            <p className="text-muted mb-0">
              Select a section to learn how it works.
            </p>
          </div>

          {/* Cards */}
          <div className="row g-3">
            {tutorials.map((item, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <button
                  className={`w-100 p-4 border rounded-4 bg-white text-start ${styles["manual-card"]}`}
                  onClick={() => setSelectedVideo(item)}
                >
                  <div className="d-flex align-items-center">
                    <i className={`bi ${item.icon} fs-3 me-3 text-info`}></i>
                    <div>
                      <h6 className="mb-1 fw-bold">{item.title}</h6>
                      <small className="text-muted">{item.desc}</small>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Video View */}
          <div className="mb-3">
            <h2 className="fw-bold">{selectedVideo.title}</h2>
            <p className="text-muted">{selectedVideo.desc}</p>
          </div>

          <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow">
            <iframe
              src={selectedVideo.video}
              title="Tutorial Video"
              allowFullScreen
            ></iframe>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManual;

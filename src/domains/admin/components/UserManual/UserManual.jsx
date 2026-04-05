import React, { useState } from "react";
import BackButton from "../../../../shared/components/BackButton/BackButton";

const UserManual = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const tutorials = [
    {
      title: "How to Register Workers",
      icon: "bi-person-plus",
      video: "https://www.youtube.com/embed/VIDEO_ID_1",
    },
    {
      title: "Managing Workers",
      icon: "bi-people",
      video: "https://www.youtube.com/embed/VIDEO_ID_2",
    },
    {
      title: "Sending Notifications",
      icon: "bi-bell",
      video: "https://www.youtube.com/embed/VIDEO_ID_3",
    },
  ];

  return (
    <div className="dashboard-wraper">
      <BackButton onClick={() => setSelectedVideo(null)} />

      {!selectedVideo ? (
        <>
          {/* Header */}
          <div className="mb-4">
            <h2 className="fw-bold text-dark mb-2">User Manual</h2>
            <p className="text-muted mb-0">
              Select a topic to watch how it works.
            </p>
          </div>

          {/* Cards */}
          <div className="row g-3">
            {tutorials.map((item, index) => (
              <div key={index} className="col-12 col-md-6 col-lg-4">
                <button
                  className="w-100 p-4 border rounded-4 shadow-sm bg-white text-start"
                  onClick={() => setSelectedVideo(item)}
                >
                  <div className="d-flex align-items-center">
                    <i className={`bi ${item.icon} fs-3 me-3 text-primary`}></i>
                    <div>
                      <h6 className="mb-1 fw-bold">{item.title}</h6>
                      <small className="text-muted">Click to watch</small>
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
            <h4 className="fw-bold">{selectedVideo.title}</h4>
            <p className="text-muted">Follow the video tutorial below</p>
          </div>

          <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow">
            <iframe
              src={selectedVideo.video}
              title="Tutorial Video"
              allowFullScreen
            ></iframe>
          </div>

          {/* Back to list */}
          <div className="mt-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setSelectedVideo(null)}
            >
              Back to Topics
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManual;

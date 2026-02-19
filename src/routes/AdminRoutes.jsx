import React from "react";
import { Routes, Route } from "react-router-dom";
import WorkersDashboard from "../domains/admin/pages/workers/WorkersDashboard/WorkersDashboard.jsx";
import WorkersRegistration from "../domains/admin/pages/workers/WorkersRegistration/WorkersRegistration.jsx";
import ActiveWorkers from "../domains/admin/pages/workers/ActiveWorkers/ActiveWorkers.jsx";
import ArchivedWorkers from "../domains/admin/pages/workers/ArchivedWorkers/ArchivedWorkers.jsx";

function AdminRoutes() {
  return (
    <>
      <Routes>
        <Route path="/workers" element={<WorkersDashboard />} />
        <Route path="/workers/add" element={<WorkersRegistration />} />
        <Route path="/workers/active" element={<ActiveWorkers />} />
        <Route path="/workers/archived" element={<ArchivedWorkers />} />
      </Routes>
    </>
  );
}

export default AdminRoutes;

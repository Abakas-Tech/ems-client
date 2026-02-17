import React from "react";
import { Routes, Route } from "react-router-dom";
import WorkersDashboard from "../domains/admin/pages/workers/WorkersDashboard/WorkersDashboard.jsx";
import WorkersRegistration from "../domains/admin/pages/workers/WorkersRegistration/WorkersRegistration.jsx";

function AdminRoutes() {
  return (
    <>
      <Routes>
        <Route path="/workers" element={<WorkersDashboard />} />
        <Route path="/workers/add" element={<WorkersRegistration />} />
      </Routes>
    </>
  );
}

export default AdminRoutes;

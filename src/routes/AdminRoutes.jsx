import React from "react";
import { Routes, Route } from "react-router-dom";
import WorkersDashboard from "../domains/admin/pages/workers/WorkersDashboard/WorkersDashboard.jsx";

function AdminRoutes() {
  return (
    <>
      <Routes>
        <Route path="/workers" element={<WorkersDashboard />} />
      </Routes>
    </>
  );
}

export default AdminRoutes;

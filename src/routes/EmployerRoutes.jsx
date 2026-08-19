import React from "react";
import { Routes, Route } from "react-router-dom";
import MyProfile from "../domains/admin/pages/Profile/Profile.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AdminLayout from "../shared/layout/AdminLayout/AdminLayout.jsx";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import ActiveWorkers from "../domains/admin/pages/workers/ActiveWorkers/ActiveWorkers.jsx";
import WorkerProfile from "../domains/admin/pages/workers/WorkerProfile/WorkerProfile.jsx";
import CV from "../domains/admin/pages/workers/modules/CV/CV.jsx";

function EmployerRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="my-employees" element={<ActiveWorkers />} />
        <Route path="/my-employees/:id" element={<WorkerProfile />} />
        <Route path="/my-employees/cv/:id" element={<CV />} />
        <Route path="my-profile" element={<MyProfile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default EmployerRoutes;

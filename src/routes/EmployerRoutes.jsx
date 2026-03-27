import React from "react";
import { Routes, Route } from "react-router-dom";
import MyProfile from "../domains/admin/pages/Profile/Profile.jsx";
import MyNotifications from "../domains/admin/pages/NotificationPage/NotificationPage.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AdminLayout from "../shared/layout/AdminLayout/AdminLayout.jsx";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import ActiveWorkers from "../domains/admin/pages/workers/ActiveWorkers/ActiveWorkers.jsx";
import WorkerProfile from "../domains/admin/pages/workers/WorkerProfile/WorkerProfile.jsx";

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
        <Route path="my-workers" element={<ActiveWorkers />} />
        <Route path="/my-workers/:id" element={<WorkerProfile />} />
        <Route path="my-profile" element={<MyProfile />} />
        <Route path="notifications" element={<MyNotifications />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default EmployerRoutes;

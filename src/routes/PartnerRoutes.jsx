import React from "react";
import { Routes, Route } from "react-router-dom";
import MyProfile from "../domains/admin/pages/Profile/Profile.jsx";
import MyNotifications from "../domains/admin/pages/NotificationPage/NotificationPage.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AdminLayout from "../shared/layout/AdminLayout/AdminLayout.jsx";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import ActiveWorkers from "../domains/admin/pages/workers/ActiveWorkers/ActiveWorkers.jsx";
import File from "../domains/admin/pages/FileManager/FileManager.jsx";
import ChangePasswordPage from "../domains/admin/pages/ChangePassword/ChangePassword.jsx";
import WorkerProfile from "../domains/admin/pages/workers/WorkerProfile/WorkerProfile.jsx";

function PartnerRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="active-employees" element={<ActiveWorkers />} />
        <Route path="active-employees/:id" element={<WorkerProfile />} />
        <Route path="files" element={<File />} />
        <Route path="my-profile" element={<MyProfile />} />
        <Route path="notifications" element={<MyNotifications />} />
        <Route path="settings" element={<ChangePasswordPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default PartnerRoutes;

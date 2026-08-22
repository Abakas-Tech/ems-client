import React from "react";
import { Routes, Route } from "react-router-dom";
// import MyApplication from "../domains/admin/pages/workers/WorkerProfile/WorkerProfile.jsx";
import MyProfile from "../domains/admin/pages/Profile/Profile.jsx";
import MyNotifications from "../domains/admin/pages/NotificationPage/NotificationPage.jsx";
// import CV from "../domains/admin/pages/workers/modules/CV/CV.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AdminLayout from "../shared/layout/AdminLayout/AdminLayout.jsx";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";

function WorkerRoutes() {
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="my-profile" element={<MyProfile />} />
        <Route path="my-application" element={<MyApplication />} />
        <Route path="my-cv" element={<CV />} />
        <Route path="notifications" element={<MyNotifications />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default WorkerRoutes;

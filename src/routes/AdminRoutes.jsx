import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import Dashboard from "../domains/admin/pages/Dashboard/Dashboard.jsx";

import NotFound from "../shared/components/NotFound/NotFound.jsx";
import ChangePasswordPage from "../domains/admin/pages/ChangePassword/ChangePassword.jsx";

const AdminRoutes = () => (
  <Routes>
    {/* Parent admin layout (Dashboard) */}
    {/* Parent admin layout (Dashboard) */}
    <Route
      element={
        // <ProtectedRoute>
          <Dashboard />
        // </ProtectedRoute> 
      }
    >
      <Route path="settings" element={<ChangePasswordPage />} />

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

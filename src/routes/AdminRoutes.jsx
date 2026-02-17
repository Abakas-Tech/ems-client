import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import Dashboard from "../domains/admin/pages/Dashboard/Dashboard.jsx";
import Files from "../domains/admin/pages/FileManager/FileManager.jsx";

import NotFound from "../shared/components/NotFound/NotFound.jsx";

const AdminRoutes = () => (
  <Routes>
    {/* Parent admin layout (Dashboard) */}
    <Route element={<Dashboard />}>
      <Route path="my-files" element={<Files />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

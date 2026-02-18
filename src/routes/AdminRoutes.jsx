import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import Dashboard from "../domains/admin/pages/Dashboard/Dashboard.jsx";

import NotFound from "../shared/components/NotFound/NotFound.jsx";
import ChangePasswordPage from "../domains/admin/pages/ChangePassword/ChangePassword.jsx";
import UsersPage from "../domains/admin/pages/Users/UserPage.jsx";
import CreateUserPage from "../domains/admin/pages/Users/CreateUsersPage.jsx";
import Profile from "../domains/admin/pages/Profile/Profile.jsx";
import EmployersPage from './../domains/admin/pages/Employer/EmployersPage';
import CreateEmployerPage from "../domains/admin/pages/Employer/CreateEmployerPage.jsx";

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
      <Route path="create-user" element={<CreateUserPage />} />
      <Route path="create-employer" element={<CreateEmployerPage />} />
      <Route path="my-profile" element={<Profile />} />

      <Route path="user-management" element={<UsersPage />} />
      <Route path="employer-management" element={<EmployersPage />} />

      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

import React from "react";
import { Route, Routes } from "react-router-dom";
import Files from "../domains/admin/pages/FileManager/FileManager.jsx";
import Finances from "../domains/admin/pages/FinancePage/FinancePage.jsx";
import Analytics from "../domains/admin/pages/AnalyticsPage/AnalyticsPage.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import ChangePasswordPage from "../domains/admin/pages/ChangePassword/ChangePassword.jsx";
import Profile from "../domains/admin/pages/Profile/Profile.jsx";
import CreateUser from "./../domains/admin/pages/user/CreateUser/CreateUser";
import ListUser from "./../domains/admin/pages/user/ListUser/ListUser";
import AdminLayout from "./../shared/layout/AdminLayout/AdminLayout";

const AdminRoutes = () => (
  <Routes>
    <Route
      element={
        // <ProtectedRoute>
        <AdminLayout />
        //  </ProtectedRoute>
      }
    >
      <Route path="settings" element={<ChangePasswordPage />} />
      <Route path="create-user" element={<CreateUser />} />
      <Route path="my-profile" element={<Profile />} />
      <Route path="user-management" element={<ListUser />} />
      <Route path="dashboard" element={<Analytics />} />
      <Route path="my-files" element={<Files />} />
      <Route path="finances" element={<Finances />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

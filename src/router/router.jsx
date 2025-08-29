import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop.jsx";
import PublicRoutes from "./PublicRoutes.jsx";
import AdminRoutes from "./AdminRoutes.jsx";
import Login from "../pages/admin/Login/Login.jsx";
import ForgotPassword from "../components/Admin/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../components/Admin/ResetPassword/ResetPassword.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes (with Layout) */} 
        <Route path="/*" element={<PublicRoutes />} />

        {/* Auth Routes (no Layout, no protection) */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Admin Routes (protected) */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* Catch-all for 404 */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}

export default AppRouter;

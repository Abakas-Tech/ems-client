import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import PublicRoutes from "./PublicRoutes.jsx";
import AdminRoutes from "./AdminRoutes.jsx";
import AuthRoutes from "./AuthRoutes.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Auth Routes (unprotected) */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Public Routes  (unprotected) */}
        <Route path="/*" element={<PublicRoutes />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />

        {/* Admin Routes (protected) */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </>
  );
}

export default AppRouter;

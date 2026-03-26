import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";

import AdminRoutes from "./AdminRoutes.jsx";
import AuthRoutes from "./AuthRoutes.jsx";
import WorkerRoutes from "./WorkerRoutes.jsx";
import PublicRoutes from "./PublicRoutes.jsx";
import PartnerRoutes from "./PartnerRoutes.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />

      {/* Global Toaster */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoutes />} />

        {/* Auth Routes */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Protected Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/worker/*" element={<WorkerRoutes />} />
        <Route path="/partner/*" element={<PartnerRoutes />} />

        {/* 404 - Always Last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default AppRouter;

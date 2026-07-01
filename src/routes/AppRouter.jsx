import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AdminRoutes from "./AdminRoutes.jsx";
import AuthRoutes from "./AuthRoutes.jsx";
import WorkerRoutes from "./WorkerRoutes.jsx";
import PartnerRoutes from "./PartnerRoutes.jsx";
import EmployerRoutes from "./EmployerRoutes.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />

      {/* Global Toaster */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<AuthRoutes />} />
        {/* Protected Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/employee/*" element={<WorkerRoutes />} />
        <Route path="/partner/*" element={<PartnerRoutes />} />
        <Route path="/employer/*" element={<EmployerRoutes />} />

        {/* 404 - Always Last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default AppRouter;

import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AdminRoutes from "./AdminRoutes.jsx";
import AuthRoutes from "./AuthRoutes.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />

      {/* Global Toaster */}
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* Auth Routes */}
        <Route path="/*" element={<AuthRoutes />} />
        {/* Protected Routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />

        {/* 404 - Always Last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default AppRouter;

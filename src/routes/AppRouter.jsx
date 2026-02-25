import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import AdminRoutes from "./AdminRoutes.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AuthRoutes from "./AuthRoutes.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Auth Routes (unprotected) */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />

        {/* Admin Routes (protected) */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </>
  );
}

export default AppRouter;

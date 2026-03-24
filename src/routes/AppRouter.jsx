import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import AdminRoutes from "./AdminRoutes.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AuthRoutes from "./AuthRoutes.jsx";
import WorkerRoutes from "./WorkerRoutes.jsx";
import PublicRoutes from "./PublicRoutes.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Public Routes (unprotected) */}
        <Route path="/*" element={<PublicRoutes />} />

        {/* Auth Routes (unprotected) */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />

        {/* Admin Routes (protected) */}
        <Route
          path="/admin/*"
          element={
            <>
              <Toaster position="top-right" reverseOrder={false} />
              <AdminRoutes />{" "}
            </>
          }
        />

        {/* Worker Routes (protected) */}
        <Route
          path="/worker/*"
          element={
            <>
              <WorkerRoutes />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default AppRouter;

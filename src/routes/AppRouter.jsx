import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import AdminRoutes from "./AdminRoutes.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import AuthRoutes from "./AuthRoutes.jsx";
import PublicRoutes from "./PublicRoutes.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* Auth Routes (unprotected) */}
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/public/*" element={<PublicRoutes />} />

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
      </Routes>
    </>
  );
}

export default AppRouter;

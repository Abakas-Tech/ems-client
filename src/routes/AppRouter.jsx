import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import AdminRoutes from "./AdminRoutes.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
       

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />

        {/* Admin Routes (protected) */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </>
  );
}

export default AppRouter;

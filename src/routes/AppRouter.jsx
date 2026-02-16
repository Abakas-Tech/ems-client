import React from "react";
import { Routes, Route } from "react-router-dom";
import ScrollToTop from "../shared/components/ScrollToTop/ScrollToTop.jsx";
import AuthRoutes from "./AuthRoutes.jsx";


function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Auth Routes (unprotected) */}
        <Route path="/auth/*" element={<AuthRoutes />} />
      </Routes>
    </>
  );
}

export default AppRouter;

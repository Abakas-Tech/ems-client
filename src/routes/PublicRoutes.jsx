import React from "react";
import { Route, Routes } from "react-router-dom";

import MainLayout from "../shared/layout/MainLayout/MainLayout";
import AboutDetail from "../domains/public/pages/About/About";
import NotFound from "../shared/pages/NotFound/NotFound";
import LandingPage from "../domains/public/pages/Landing/landingpage";

function PublicRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* <Route path="/about-detial" element={<AboutDetail />} /> */}
      </Route>

      {/* fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default PublicRoutes;

import React from "react";
import { Route, Routes } from "react-router-dom";

import PublicLayout from "../domains/public/layout/PublicLayout/PublicLayout";
// import AboutDetail from "../domains/public/pages/AboutDetail/AboutDetail";
import NotFound from "../shared/components/NotFound/NotFound";
import LandingPage from "../domains/public/pages/LandingPage/LandingPage";

function PublicRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        {/* <Route path="about-detail" element={<AboutDetail />} /> */}
      </Route>

      {/* fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default PublicRoutes;

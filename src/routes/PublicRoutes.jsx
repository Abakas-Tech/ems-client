import React from "react";
import { Route, Routes } from "react-router-dom";

import MainLayout from "../shared/layout/MainLayout/MainLayout";
import NotFound from "../shared/components/NotFound/NotFound";
import LandingPage from "../domains/public/pages/LandingPage/LandingPage";

function PublicRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      {/* fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default PublicRoutes;

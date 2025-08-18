import React from "react";
import Header from "../components/header/header";
import PropertiesDetailPage from "../pages/public/PropertiesDetailPage";
import { Route, Routes } from "react-router-dom";
function router() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/properties/:id" element={<PropertiesDetailPage />} />
      </Routes>
    </>
  );
}

export default router;

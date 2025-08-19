import React from "react";
import { Routes, Route } from "react-router-dom";
import AboutDetailPage from "../pages/public/AboutDetailPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/about" element={<AboutDetailPage/>} />
    </Routes>
  );
}

export default AppRouter;
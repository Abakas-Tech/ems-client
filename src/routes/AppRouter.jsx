import React from "react";
import { Routes, Route } from "react-router-dom";
import Workers from "../domains/admin/pages/Workers/Workers";
function AppRouter() {
  return (
    <Routes>
      <Route path="/workers" element={<Workers />} />
    </Routes>
  );
}

export default AppRouter;

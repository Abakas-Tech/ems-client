import React from "react";
import { Route, Routes } from "react-router-dom";
import Properties from "../components/properties/properties.list.jsx";
const router = () => {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/properties" element={<Properties />} />
    </Routes>
  );
};

export default router;

import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import MainLayout from "./../shared/layout/MainLayout/MainLayout";
import Gallery from "../domains/public/pages/Gallery/Gallery.jsx";

const PublicRoutes = () => (
  <Routes element={<MainLayout />}>
    <Route path="/gallery" element={<Gallery/>} />
  
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default PublicRoutes;

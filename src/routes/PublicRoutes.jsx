import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import MainLayout from "./../shared/layout/MainLayout/MainLayout";
import Landingpage from './../domains/public/pages/Landing/landingpage';
// import AboutDetail from "../domains/public/pages/AboutDetail/AboutDetail.jsx";

const PublicRoutes = () => (
  <Routes element={<MainLayout />}>
    <Route path="/" element={<Landingpage />} />
    {/* <Route path="/about-detail" element={<AboutDetail />} /> */}

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default PublicRoutes;

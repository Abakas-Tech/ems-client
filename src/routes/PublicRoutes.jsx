import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../shared/Layout/Layout.jsx";
import LandingPage from "../domains/public/pages/Landing/landingpage.jsx";
import PropertyDetails from "../domains/public/pages/propertiesDetail/PropertiesDetail.jsx";
import AboutDetail from "../domains/public/pages/AboutDetail/AboutDetail.jsx";
import Contact from "../domains/public/pages/Contact/Contact.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import PropertiesDetailPage from "../domains/public/pages/propertiesDetail/PropertiesDetail.jsx";

const PublicRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <Layout>
          <LandingPage />
        </Layout>
      }
    />
    <Route
      path="/properties"
      element={
        <Layout>
          <PropertiesDetailPage />
        </Layout>
      }
    />
    <Route
      path="/properties/:id"
      element={
        <Layout>
          <PropertyDetails />
        </Layout>
      }
    />
    <Route
      path="/about"
      element={
        <Layout>
          <AboutDetail />
        </Layout>
      }
    />
    <Route
      path="/contact"
      element={
        <Layout>
          <Contact />
        </Layout>
      }
    />
    {/* 404 Route (unprotected) */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default PublicRoutes;

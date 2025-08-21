import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/public/LandingPage";
import AboutDetail from "../pages/public/AboutDetail/AboutDetail.jsx";
import PropertyList from "../pages/public/propertiesList/properties.list.jsx";
import PropertyDetails from "../pages/public/propertiesDetail/PropertiesDetail.jsx";
import Services from "../pages/public/Services/Services.jsx";
import Layout from "../components/Layout/Layout.jsx";

function AppRouter() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route
        path="/"
        element={
          <Layout>
            <LandingPage />
          </Layout>
        }
      />

      {/* Properties List */}
      <Route
        path="/properties"
        element={
          <Layout>
            <PropertyList />
          </Layout>
        }
      />

      {/* Property Details */}
      <Route
        path="/properties/:id"
        element={
          <Layout>
            <PropertyDetails />
          </Layout>
        }
      />

      {/* About */}
      <Route
        path="/about"
        element={
          <Layout>
            <AboutDetail />
          </Layout>
        }
      />

      {/* Services */}
      <Route
        path="/services"
        element={
          <Layout>
            <Services />
          </Layout>
        }
      />
    </Routes>
  );
}

export default AppRouter;

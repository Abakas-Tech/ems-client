import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/public/Landing/landingpage.jsx";
import AboutDetail from "../pages/public/AboutDetail/AboutDetail.jsx";
import PropertyList from "../pages/public/propertiesList/properties.list.jsx";
import PropertyDetails from "../pages/public/propertiesDetail/PropertiesDetail.jsx";
import Layout from "../components/Layout/Layout.jsx";
import Contact from "../pages/public/Contact/Contact.jsx";
import ProtecteRoute from "../utils/ProtectRoute.jsx";
import Appointments from "../pages/admin/Appointments/Appointments.jsx";

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
      {/* Contact */}
      <Route
        path="/contact"
        element={
          <Layout>
            <Contact />
          </Layout>
        }
      />
      {/* Protected route */}
      <Route
        path="/dashboard"
        element={<ProtecteRoute>{/* <DashboardPage /> */}</ProtecteRoute>}
      />
      {/* Appointments page */}
      <Route path="/appointments" element={<Appointments />} />
    </Routes>
  );
}

export default AppRouter;

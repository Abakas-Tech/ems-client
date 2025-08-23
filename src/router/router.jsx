import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/public/Landing/landingpage.jsx";
import AboutDetail from "../pages/public/AboutDetail/AboutDetail.jsx";
import PropertyList from "../pages/public/propertiesList/properties.list.jsx";
import PropertyDetails from "../pages/public/propertiesDetail/PropertiesDetail.jsx";
import Layout from "../components/Layout/Layout.jsx";
import Contact from "../pages/public/Contact/Contact.jsx";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import Login from "../pages/admin/Login/Login.jsx";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop.jsx";
import ForgotPassword from "../pages/admin/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../pages/admin/ResetPassword/ResetPassword.jsx";
import ChangePassword from "../components/ChangePassword/ChangePassword.jsx";

function AppRouter() {
  return (
    <>
      <ScrollToTop />
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

        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/dashboard" element={<ChangePassword />} />
      </Routes>
    </>
  );
}

export default AppRouter;

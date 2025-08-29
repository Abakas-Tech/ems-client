import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import ScrollToTop from "../components/ScrollToTop/ScrollToTop.jsx";

// Public pages
import LandingPage from "../pages/public/Landing/landingpage.jsx";
import AboutDetail from "../pages/public/AboutDetail/AboutDetail.jsx";
import PropertyList from "../pages/public/propertiesList/properties.list.jsx";
import PropertyDetails from "../pages/public/propertiesDetail/PropertiesDetail.jsx";
import Contact from "../pages/public/Contact/Contact.jsx";

// Admin pages
import Login from "../pages/admin/Login/Login.jsx";
import ForgotPassword from "../pages/admin/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../pages/admin/ResetPassword/ResetPassword.jsx";
import Dashboard from "../pages/admin/Dashboard/Dashboard.jsx";
import MyProfile from "../pages/admin/MyProfile/MyProfile.jsx";
import ChangePassword from "../pages/admin/ChangePassword/ChangePassword.jsx";
import Analytics from "../pages/admin/Analytics/Analytics.jsx";
import FileManager from "../pages/admin/FileManager/FileManager.jsx";
import Appointments from "../pages/admin/Appointments/Appointments.jsx";
function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
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
              <PropertyList />
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
        {/* Admin Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<Analytics />} />
          <Route path="/admin/my-files" element={<FileManager />} />
          <Route path="/admin/appointments" element={<Appointments />} />
          <Route path="my-profile" element={<MyProfile />} />
          <Route path="settings" element={<ChangePassword />} />
        </Route>
      </Routes>
    </>
  );
}

export default AppRouter;

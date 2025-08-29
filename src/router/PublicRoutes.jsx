import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../components/Layout/Layout.jsx";
import LandingPage from "../pages/public/Landing/landingpage.jsx";
import PropertyList from "../pages/public/propertiesList/propertiesList.jsx";
import PropertyDetails from "../pages/public/propertiesDetail/PropertiesDetail.jsx";
import AboutDetail from "../pages/public/AboutDetail/AboutDetail.jsx";
import Contact from "../pages/public/Contact/Contact.jsx";
import Login from "../pages/admin/Login/Login.jsx";
import ForgotPassword from "../components/Admin/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../components/Admin/ResetPassword/ResetPassword.jsx";

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
    <Route path="login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
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
  </Routes>
);

export default PublicRoutes;

import React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "../shared/Layout/Layout.jsx";
import LandingPage from "../domains/public/pages/Landing/landingpage.jsx";
import PropertyList from "../domains/public/pages/propertiesList/propertiesList.jsx";
import PropertyDetails from "../domains/public/pages/propertiesDetail/PropertiesDetail.jsx";
import AboutDetail from "../domains/public/pages/AboutDetail/AboutDetail.jsx";
import Contact from "../domains/public/pages/Contact/Contact.jsx";
import Login from "../domains/public/pages/Login/Login.jsx";
import ForgotPassword from "../domains/public/pages/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../domains/public/pages/ResetPassword/ResetPassword.jsx";

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

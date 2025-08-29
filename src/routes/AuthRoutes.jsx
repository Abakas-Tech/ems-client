import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../domains/public/pages/Login/Login.jsx";
import ForgotPassword from "../domains/public/pages/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../domains/public/pages/ResetPassword/ResetPassword.jsx";
import NotFound from "../shared/pages/NotFound/NotFound.jsx";

const AuthRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AuthRoutes;

import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../domains/accounts/pages/Login/Login.jsx";
import ForgotPassword from "../domains/accounts/pages/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "../domains/accounts/pages/ResetPassword/ResetPassword.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";

const AuthRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AuthRoutes;

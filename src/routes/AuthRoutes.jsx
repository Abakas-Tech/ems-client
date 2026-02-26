import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import ForgotPassword from "../domains/account/pages/ForgotPassword/ForgotPassword.jsx";
import PasswordReset from "../domains/account/pages/PasswordReset/PasswordReset.jsx";
import Login from './../domains/account/pages/Login/Login';
import MainLayout from './../shared/layout/MainLayout/MainLayout';
import LoginFormWithPhone from './../domains/account/components/login/LoginFormWithPhone/LoginFormWithPhone';

const AuthRoutes = () => (
  <Routes element={<MainLayout/>}>
    <Route path="/login" element={<Login />} />
    <Route path="/login/identifier" element={<LoginFormWithPhone/>} />
    <Route path="/request-otp" element={<ForgotPassword/>} />
    <Route path="/reset-password" element={<PasswordReset/>} />
    <Route path="*" element={<NotFound />} /> 
  </Routes>
);

export default AuthRoutes;

import React from "react";
import { Route, Routes } from "react-router-dom";
import NotFound from "../shared/components/NotFound/NotFound";
import Login from './../domains/account/pages/Login/Login';
import ForgotPassword from './../domains/account/pages/ForgotPassword/ForgotPassword';
import PasswordReset from './../domains/account/pages/PasswordReset/PasswordReset';


function PublicRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/request-otp" element={<ForgotPassword/>} />
      <Route path="/reset-password" element={<PasswordReset/>} />
      {/* fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default PublicRoutes;

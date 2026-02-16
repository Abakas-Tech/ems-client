import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../domains/account/pages/Login/Login";
import IdentifierLoginForm from "../domains/account/components/LoginForm/IdentifierLoginForm";
// import NotFound from "../shared/components/NotFound/NotFound.jsx";
import RequestOtp from './../domains/account/pages/ResetPassword/RequestOtp';

import ConfirmPassword from "../domains/account/pages/ResetPassword/ConfirmPassword.jsx";

const AuthRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/login/identifier" element={<IdentifierLoginForm/>} />
    <Route path="/request-otp" element={<RequestOtp/>} />
    <Route path="/reset-password" element={<ConfirmPassword/>} />
    {/* <Route path="*" element={<NotFound />} />  */}
  </Routes>
);

export default AuthRoutes;

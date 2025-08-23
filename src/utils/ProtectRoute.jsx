import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../context/auth/UseAuth";
import useLoader from "../context/Loader/useLoader";

const ProtectedRoute = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  // Show loader while auth is being checked
  if (user === undefined) return <div>Loading...</div>; // or use your loader component

  // If not authenticated, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  // If authenticated, render nested routes
  return <Outlet />;
};

export default ProtectedRoute;

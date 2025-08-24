import React, { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth/AuthContext";
import useAuth from "../context/auth/UseAuth";

const ProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = user === true; // Matches AuthProvider's setUser(true) on success

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/admin/login") {
      // Optional: You can add a message or redirect with state
    }
  }, [isAuthenticated, location.pathname]);

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace state={{ from: location }} />
  );
};

export default ProtectedRoute;

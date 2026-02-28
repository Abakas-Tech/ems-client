import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { hasAccessToken, setAccessToken } from "./axios";
import { refreshTokenApi } from "../domains/admin/api/auth.api";

const ProtectedRoute = ({ children }) => {
  const [checked, setChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const restoreSession = async () => {
      // If token already exists → allow immediately
      if (hasAccessToken()) {
        setIsAuth(true);
        setChecked(true);
        return;
      }

      try {
        // Try to restore using refresh cookie
        const response = await refreshTokenApi();
        const newToken = response.data?.access_token;

        if (newToken) {
          setAccessToken(newToken);
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch {
        setIsAuth(false);
      } finally {
        setChecked(true);
      }
    };

    restoreSession();
  }, []);

  //  Wait until check finishes
  if (!checked) return null; // or loader

  //  Still not logged in
  if (!isAuth) {
    return <Navigate to="/auth/login" replace />;
  }

  //  Logged in
  return children;
};

export default ProtectedRoute;

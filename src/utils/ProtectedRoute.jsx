import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { hasAccessToken, setAccessToken } from "./axios";
import { refreshTokenApi } from "../domains/admin/api/auth.api";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const restoreToken = async () => {
      if (hasAccessToken()) {
        setIsAuth(true);
        setChecking(false);
        return;
      }

      try {
        const response = await refreshTokenApi();
        const token = response.data?.access_token;

        if (token) {
          setAccessToken(token);
          setIsAuth(true);
        } else {
          setIsAuth(false);
        }
      } catch {
        setIsAuth(false);
      } finally {
        setChecking(false);
      }
    };

    restoreToken();
  }, []);

  if (checking) return <div>Loading...</div>;

  // Redirect if not authenticated
  if (!isAuth) return <Navigate to="/auth/login" replace />;

  return children;
};

export default ProtectedRoute;

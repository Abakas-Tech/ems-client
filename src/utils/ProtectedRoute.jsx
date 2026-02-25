import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { refreshTokenApi } from "../domains/admin/api/auth.api"; 

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Call your refresh token API
        const response = await refreshTokenApi();
        const newAccessToken = response.data?.access_token;
        if (!newAccessToken) throw new Error("No access token returned");

        // Optionally store in memory or context if needed
        setIsAuthorized(true);
      } catch  {
        setIsAuthorized(false);
        navigate("/auth/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  if (isAuthorized === null) return null; // or a loader

  return isAuthorized ? children : null;
};

export default ProtectedRoute;

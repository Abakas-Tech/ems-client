import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { hasAccessToken, setAccessToken } from "./axios";
import { refreshTokenApi } from "../domains/admin/api/auth.api";
import useloader from "./../context/loader/useLoader";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const { showloader, hideloader } = useloader();

  useEffect(() => {
    const restoreToken = async () => {
      showloader(); //show global loader

      if (hasAccessToken()) {
        setIsAuth(true);
        setChecking(false);
        hideloader(); // stop loader
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
        hideloader(); // hide loader when done
      }
    };

    restoreToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // No UI loader now — global loader handles it
  if (checking) return null;

  if (!isAuth) return <Navigate to="/auth/login" replace />;

  return children;
};

export default ProtectedRoute;

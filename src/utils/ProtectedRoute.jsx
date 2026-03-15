import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasAccessToken, setAccessToken } from "./axios";
import { refreshTokenApi } from "../domains/admin/api/auth.api";
import useloader from "./../context/Loader/useLoader";
import useProfile from "../context/Profile/useProfile";
import MENU_CONFIG from "../config/menu.config";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const { showLoader, hideLoader } = useloader();
  const { profile } = useProfile();
  const location = useLocation();

  useEffect(() => {
    const restoreToken = async () => {
      showLoader();

      if (hasAccessToken()) {
        setIsAuth(true);
        setChecking(false);
        hideLoader();
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
        hideLoader();
      }
    };

    restoreToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) return null;

  if (!isAuth) return <Navigate to="/auth/login" replace />;

  // Role-based protection using menu config
  const userRoleId = profile?.role_id;

  // Only check if profile and role exist
  if (profile && userRoleId) {
    // Find menu that matches current path (normalize path)
    const currentMenu = MENU_CONFIG.find((menu) => {
      const menuPath = menu.path.replace(/\/$/, ""); // remove trailing slash
      const currentPath = location.pathname.replace(/\/$/, "");
      return currentPath === menuPath || currentPath.startsWith(menuPath + "/");
    });

    // If a matching menu exists and role not allowed → redirect
    if (
      currentMenu &&
      currentMenu.roles &&
      !currentMenu.roles.includes(userRoleId)
    ) {
      const fallback = "/admin/my-profile"; // default fallback page
      return <Navigate to={fallback} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

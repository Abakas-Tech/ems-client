import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasAccessToken, setAccessToken } from "./axios";
import { refreshTokenApi } from "../domains/admin/api/auth.api";
import useloader from "./../context/Loader/useLoader";
import useProfile from "../context/Profile/useProfile";
import MENU_CONFIG from "../config/menu.config";

// Match main route segment after the first folder
const matchMainRoute = (menuPath, currentPath) => {
  const menuParts = menuPath.replace(/\/$/, "").split("/").filter(Boolean);
  const currentParts = currentPath
    .replace(/\/$/, "")
    .split("/")
    .filter(Boolean);

  if (!menuParts[1] || !currentParts[1]) return false;

  return menuParts[1] === currentParts[1];
};

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
  }, []);

  if (checking) return null;
  if (!isAuth) return <Navigate to="/auth/login" replace />;

  const userRoleId = profile?.role_id;
  const userPermissions = profile?.permissions || {};
  const currentPath = location.pathname;

  if (profile && userRoleId) {
    const mainMenu = MENU_CONFIG.find((menu) =>
      matchMainRoute(menu.path, currentPath),
    );

    // Role-based protection
    if (mainMenu && mainMenu.roles && !mainMenu.roles.includes(userRoleId)) {
      let fallback = "/admin/my-profile";
      if (userRoleId === 3) fallback = "/partner/my-profile";
      else fallback = "/admin/my-profile";
      return <Navigate to={fallback} replace />;
    }

    // Employee permission check (role_id = 2)
    if (userRoleId === 2 && mainMenu?.permission) {
      const permValue = Number(userPermissions[mainMenu.permission]);
      if (!permValue) return <Navigate to="/admin/my-profile" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

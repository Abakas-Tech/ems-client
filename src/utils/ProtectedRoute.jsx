import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasAccessToken, setAccessToken } from "./axios";
import { refreshTokenApi } from "../domains/admin/api/auth.api";
import useloader from "./../context/Loader/useLoader";
import useProfile from "../context/Profile/useProfile";
import MENU_CONFIG from "../config/menu.config";

// Helper to match dynamic paths like /admin/files/:id
const matchPath = (menuPath, currentPath) => {
  const menuParts = menuPath.replace(/\/$/, "").split("/");
  const currentParts = currentPath.replace(/\/$/, "").split("/");

  if (menuParts.length !== currentParts.length) return false;

  return menuParts.every(
    (part, i) => part.startsWith(":") || part === currentParts[i],
  );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) return null;
  if (!isAuth) return <Navigate to="/auth/login" replace />;

  const userRoleId = profile?.role_id;
  const userPermissions = profile?.permissions || {};
  const currentPath = location.pathname;

  if (profile && userRoleId) {
    // Find menu that matches current path
    const currentMenu = MENU_CONFIG.find((menu) =>
      matchPath(menu.path, currentPath),
    );

    //  Role-based protection
    if (
      currentMenu &&
      currentMenu.roles &&
      !currentMenu.roles.includes(userRoleId)
    ) {
      let fallback = "/admin/my-profile";
      if (userRoleId === 3) fallback = "/partner/my-profile";
      else fallback = "/admin/dashboard";
      return <Navigate to={fallback} replace />;
    }

    // 2 Employee permission check (role_id = 2)
    if (userRoleId === 2) {
      // If the route exists in MENU_CONFIG but has a permission requirement
      if (currentMenu?.permission) {
        const permValue = Number(userPermissions[currentMenu.permission]);
        if (!permValue) return <Navigate to="/admin/my-profile" replace />;
      }

      // If route is not even in MENU_CONFIG (hidden menu) → block access
      if (!currentMenu) return <Navigate to="/admin/my-profile" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

// ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasAccessToken, setAccessToken } from "./axios";
import { refreshTokenApi } from "../domains/admin/api/auth.api";
import useloader from "../context/Loader/useLoader";
import useProfile from "../context/Profile/useProfile";
import MENU_CONFIG from "../config/menu.config";

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const { showLoader, hideLoader } = useloader();
  const { profile, fetchProfile } = useProfile();
  const location = useLocation();

  const fallbackMap = {
    1: "/admin/dashboard",
    2: "/admin/my-profile",
    3: "/partner/my-profile",
    4: "/worker/my-profile",
    5: "/employer/my-profile",
  };

  const baseRouteMap = {
    1: "/admin",
    2: "/admin",
    3: "/partner",
    4: "/worker",
    5: "/employer",
  };

  useEffect(() => {
    const restoreToken = async () => {
      showLoader();
      try {
        if (hasAccessToken()) {
          setIsAuth(true);
        } else {
          const response = await refreshTokenApi();
          const token = response.data?.access_token;
          if (token) {
            setAccessToken(token);
            setIsAuth(true);
          } else {
            setIsAuth(false);
          }
        }
        // fetch profile if not loaded yet
      if (!profile) {
        try {
          await fetchProfile();
        } catch  {
          console.warn("Profile fetch failed");
        }
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

if (!profile || !userRoleId) {
  return children; // allow page even if profile failed (offline-safe)
}

  // Step 1: Block cross-role access
  const currentBase = "/" + currentPath.split("/").filter(Boolean)[0];
  const userBase = baseRouteMap[userRoleId];
  if (currentBase !== userBase && currentBase !== "") {
    return <Navigate to={fallbackMap[userRoleId]} replace />;
  }

  // Step 2: Match MENU_CONFIG (supports nested/sub routes)
  const normalize = (path) =>
    path.replace(/\/$/, "").split("/").filter(Boolean);

  const matchRoute = (menuPath, currentPath) => {
    const menuParts = normalize(menuPath);
    const currentParts = normalize(currentPath);
    return menuParts.every((part, i) => currentParts[i] === part);
  };

  const matchedMenus = MENU_CONFIG.filter((menu) =>
    matchRoute(menu.path, currentPath),
  );

  // pick most specific (longest path)
  const mainMenu = matchedMenus.sort(
    (a, b) => b.path.length - a.path.length,
  )[0];

  // Step 3: Block undefined menu routes
  if (!mainMenu) {
    return <Navigate to={fallbackMap[userRoleId]} replace />;
  }

  // ignore public home
  if (mainMenu.path === "/") return children;

  // Step 4: Role check
  if (mainMenu.roles && !mainMenu.roles.includes(userRoleId)) {
    return <Navigate to={fallbackMap[userRoleId]} replace />;
  }

  // Step 5: Permission check (role 2 = employee)
  if (userRoleId === 2 && mainMenu.permission) {
    const permValue = Number(userPermissions[mainMenu.permission]);
    if (!permValue) {
      return <Navigate to={fallbackMap[userRoleId]} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

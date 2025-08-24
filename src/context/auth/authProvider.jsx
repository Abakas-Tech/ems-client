import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { checkUser } from "../../api/admin/auth.api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const checkUserAuth = async () => {
    try {
      const response = await checkUser();

      if (response.data.success) {
        setUser(true);
      } else {
        setUser(null);
        navigate("/login");
      }
    } catch {
      setUser(null);
      navigate("/login");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    const publicPaths = [
      "/",
      "/login",
      "/about",
      "/properties",
      "/contact",
      "/forgot-password",
      "/reset-password",
    ];
    if (!publicPaths.includes(location.pathname)) {
      checkUserAuth();
    } else {
      setUser(localStorage.getItem("authToken") ? true : null);
      setIsCheckingAuth(false);
    }
  }, [location.pathname]);

  if (isCheckingAuth) return null;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

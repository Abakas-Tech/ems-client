import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { checkUser } from "../../domains/accounts/api/auth.api";

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
        sessionStorage.removeItem("authToken"); // remove invalid token
        setUser(null);
        navigate("/auth/login", { state: { from: location.pathname } });
      }
    } catch {
      sessionStorage.removeItem("authToken");
      setUser(null);
      navigate("/auth/login", { state: { from: location.pathname } });
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    const publicPathPrefixes = [
      "/",
      "/auth/",
      "/about",
      "/properties/",
      "/contact",
    ];

    const isPublicPath = publicPathPrefixes.some(
      (prefix) =>
        location.pathname === prefix || location.pathname.startsWith(prefix)
    );

    const token = sessionStorage.getItem("authToken");

    if (isPublicPath) {
      // For public pages, allow access but still set user if token exists
      setUser(token ? true : null);
      setIsCheckingAuth(false);
    } else {
      // Protected pages → must verify token
      if (!token) {
        setUser(null);
        setIsCheckingAuth(false);
        navigate("/auth/login", { state: { from: location.pathname } });
      } else {
        checkUserAuth();
      }
    }
  }, [location.pathname]);

  if (isCheckingAuth) return null; // or show loader

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

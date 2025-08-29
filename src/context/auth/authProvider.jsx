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
        setUser(null);
        navigate("/auth/login", { state: { from: location.pathname } });
      }
    } catch {
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

    if (isPublicPath) {
      setUser(localStorage.getItem("authToken") ? true : null);
      setIsCheckingAuth(false);
    } else {
      checkUserAuth();
    }
  }, [location.pathname]);

  if (isCheckingAuth) return null;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

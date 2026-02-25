import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { refreshTokenApi } from "../../domains/admin/api/auth.api";
import { setAccessToken } from "../../utils/axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Helper: check if refresh token exists in cookies
  const hasRefreshToken = () => {
    return document.cookie.includes("refresh_token=");
  };

  // Check user dynamically on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only call refreshTokenApi if refresh token exists
        if (!hasRefreshToken()) {
          setAccessToken(null);
          setUser(null);
          return;
        }

        const response = await refreshTokenApi();
        const { access_token } = response.data;

        if (access_token) {
          setAccessToken(access_token);
          setUser(true);
        } else {
          setAccessToken(null);
          setUser(null);
        }
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Optionally show nothing or loader while checking
  if (isCheckingAuth) return null;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

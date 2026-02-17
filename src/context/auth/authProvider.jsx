import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { refreshTokenApi } from "../../domains/admin/api/auth.api";
import { setAccessToken } from "../../utils/axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check user dynamically on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Call a protected route to get user info
        const response = await refreshTokenApi(); // replace with your endpoint
        const { access_token } = response.data;

        if (access_token) {
          setAccessToken(access_token); // set in-memory token
          setUser(true); // user is logged in
        } else {
          setUser(null);
        }
      } catch {
        setAccessToken(null);
        setUser(null); // not logged in
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

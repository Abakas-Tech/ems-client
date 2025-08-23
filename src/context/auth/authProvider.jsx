import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { checkUser } from "../../api/admin/auth.api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(undefined); // undefined = checking
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const checkUserAuth = async () => {
    // Skip auth check for public pages
    const publicPaths = ["/login", "/forgot-password"];
    if (publicPaths.includes(location.pathname)) {
      setUser(null);
      setIsCheckingAuth(false);
      return;
    }

    try {
      const response = await checkUser();

      if (response.data.success) {
        setUser(true); // authenticated
      } else {
        setUser(null); // not authenticated
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
    checkUserAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (isCheckingAuth) return null; // can also show loader

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

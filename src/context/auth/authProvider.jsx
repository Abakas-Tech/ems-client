
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { checkUser } from "../../api/Public/auth.api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(false);
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
    checkUserAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (isCheckingAuth) return null;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

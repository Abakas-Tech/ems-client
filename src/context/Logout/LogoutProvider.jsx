import React, { useState } from "react";
import { LogoutContext} from "./LogoutContext.jsx";
import { useNavigate } from "react-router-dom";
import Logout from "./../../shared/global/Logout/Logout.jsx";
import { logoutApi } from "../../domains/admin/api/auth.api.js"
import { setAccessToken } from "../../utils/axios.jsx";

const LogoutProvider = ({ children }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);


  const logoutNow = async () => {
    try {
      // Call backend logout to clear refresh token cookie
      await logoutApi();

      // Clear in-memory access token
      setAccessToken(null);

      // Smooth transition
      setTimeout(() => {
   
        navigate("/auth/login");
      }, 50);
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear in-memory token and redirect even if API fails
      setAccessToken(null);
      setTimeout(() => {
        navigate("/");
      }, 50);
    }
  };
  const logout = () => {
    setShowLogoutModal(true);
  };

  return (
    <LogoutContext.Provider value={{ logout }}>
      {children}
      <Logout
        show={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          logoutNow();
          setShowLogoutModal(false);
        }}
      />
    </LogoutContext.Provider>
  );
};

export default LogoutProvider;

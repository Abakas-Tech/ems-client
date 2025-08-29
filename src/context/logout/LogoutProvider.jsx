import React, { useState } from "react";
import { LogoutContext } from "./LogoutContext.jsx";
import { useNavigate } from "react-router-dom";
import useAuth from "../auth/UseAuth.jsx";
import Logout from "./../../shared/global/Logout/Logout.jsx";

const LogoutProvider = ({ children }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { setUser } = useAuth();

  const logoutNow = () => {
    localStorage.removeItem("authToken");
    setUser(false);
    navigate("/login");
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

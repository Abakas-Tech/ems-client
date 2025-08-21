import React, { useState } from "react";
import { LogoutContext } from "./LogoutContext.jsx";
import LogoutConfirmModal from "../../components/global/logout/logoutConfirm.jsx";

import { useNavigate } from "react-router-dom";
import useAuth from "./../auth/UseAuth.jsx";

const LogoutProvider = ({ children }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { setUser } = useAuth();

  const logoutNow = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/login");
  };
  const logout = () => {
    setShowLogoutModal(true);
  };

  return (
    <LogoutContext.Provider value={{ logout }}>
      {children}
      <LogoutConfirmModal
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

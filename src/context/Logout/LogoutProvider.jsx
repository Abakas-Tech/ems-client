import React, { useState } from "react";
import { LogoutContext } from "./LogoutContext.jsx";
import { useNavigate } from "react-router-dom";
import Logout from "./../../shared/global/Logout/Logout.jsx";
import { logoutApi } from "../../domains/admin/api/auth.api.js";
import { setAccessToken } from "../../utils/axios.jsx";
import useProfile from "../Profile/useProfile.jsx";

const LogoutProvider = ({ children }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { setProfile } = useProfile();

  const logoutNow = async () => {
    try {
      // Call backend logout to clear refresh token cookie
      await logoutApi();
    } catch (error) {
      console.error("Logout failed:", error);
      // Still proceed to navigate/clear even if the API call fails
    }

    // Navigate to the login page FIRST, before clearing the in-memory
    // token/profile. The admin header and sidebar read profile to build
    // their content (e.g. Sidebar's role-based menu filtering) — clearing
    // profile while they're still mounted made them go blank/white for a
    // moment before the route actually changed. Clearing the token/profile
    // only after navigation has been kicked off means that by the time
    // they're cleared, the admin layout has already been swapped out for
    // the login page, so there's nothing left visible to flash empty.
    navigate("/");

    setTimeout(() => {
      // Clear in-memory access token
      setAccessToken(null);

      // Clear global profile so header updates immediately
      setProfile(null);
    }, 50);
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

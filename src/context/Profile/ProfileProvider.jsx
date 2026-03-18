import React, { useEffect, useState } from "react";
import ProfileContext from "./ProfileContext";
import { getProfile } from "../../domains/admin/api/profile.api";
import { initAuth, hasAccessToken } from "../../utils/axios";
import useResponse from "../Response/useResponse";

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const { addMessage } = useResponse();

  const fetchProfile = async () => {
    try {
      if (!hasAccessToken()) return;

      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      addMessage(false, error.message);
      setProfile(null);
    }
  };

  useEffect(() => {
    initAuth();

    // Only fetch profile if user is logged in
    if (hasAccessToken()) {
      fetchProfile();
    }
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;

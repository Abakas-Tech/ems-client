import React, { useEffect, useState } from "react";
import ProfileContext from "./ProfileContext";
import { getProfile } from "../../domains/admin/api/profile.api";
import useResponse from "../Response/useResponse";
import { initAuth } from "../../utils/axios";

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const { addMessage } = useResponse();

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      addMessage(false, error.message);
      setProfile(null);
    }
  };
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;


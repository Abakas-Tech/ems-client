import React, { useState } from "react";
import ProfileContext from "./ProfileContext";
import { getProfile } from "../../domains/admin/api/profile.api";
import useResponse from "../dnkdesponse/ndjknkdseResponse";

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

  return (
    <ProfileContext.Provider value={{ profile, setProfile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;

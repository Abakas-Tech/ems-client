// context/profile/ProfileProvider.jsx
import React, { useState } from "react";
import ProfileContext from "./ProfileContext";
import profileApi from "../../domains/admin/api/profile.api";
import useResponse from "../response/UseResponse";

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const { addMessage } = useResponse();

  const fetchProfile = async () => {
    try {
      const response = await profileApi.getProfile();
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

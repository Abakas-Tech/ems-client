// context/profile/ProfileProvider.jsx
import React, { createContext, useContext, useState } from "react";
import  profileApi  from "../../domains/admin/api/profile.api";
import useResponse from "../response/UseResponse";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
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

export const useProfile = () => useContext(ProfileContext);

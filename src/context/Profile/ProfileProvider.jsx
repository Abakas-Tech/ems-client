// context/profile/ProfileProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../../domains/admin/api/profile.api";
import useResponse from "../response/UseResponse";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const { addMessage } = useResponse();

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      console.log(response)
      setProfile(response.data);
    } catch (error) {
      addMessage(false, error.message);
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

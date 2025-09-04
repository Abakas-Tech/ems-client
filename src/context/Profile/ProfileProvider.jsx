// context/profile/ProfileProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getProfile } from "../../domains/admin/api/agent.api";
import useResponse from "../response/UseResponse";

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const { addMessage } = useResponse();

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data);
    } catch (error) {
      addMessage("error", error.message);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);

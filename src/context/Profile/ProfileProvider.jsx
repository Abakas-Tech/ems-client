import React, { useEffect, useState } from "react";
import ProfileContext from "./ProfileContext";
import { getProfile } from "../../domains/admin/api/profile.api";
import { initAuth } from "../../utils/axios";
import useResponse from "../Response/useResponse";

const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { addMessage } = useResponse();

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data);
    } catch (error) {
      addMessage(false, error.message);
    }
  };

  useEffect(() => {
    const init = async () => {
      const hasToken = await initAuth();
      if (hasToken) {
        await fetchProfile();
      }
      setCheckingAuth(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, fetchProfile, checkingAuth }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;

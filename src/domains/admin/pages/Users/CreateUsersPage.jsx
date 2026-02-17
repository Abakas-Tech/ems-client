import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CreateUser from "../../components/Users/CreateUser";

const CreateUserPage = () => {
  const location = useLocation();
  const state = location.state || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [userData, setUserData] = useState(null);

  // Prefill state if navigated with userData
  useEffect(() => {
    if (state.userData) {
      setIsEditMode(true);
      setUserData(state.userData);
    } else {
      setIsEditMode(false);
      setUserData(null);
    }
  }, [state]);

  return <CreateUser isEditMode={isEditMode} userData={userData} />;
};

export default CreateUserPage;

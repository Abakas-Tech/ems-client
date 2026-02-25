import  { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CreateUserForm from "../../../components/user/CreateUserForm/CreateUserForm";

const CreateUser = () => {
  const location = useLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return <CreateUserForm isEditMode={isEditMode} userData={userData} />;
};

export default CreateUser;

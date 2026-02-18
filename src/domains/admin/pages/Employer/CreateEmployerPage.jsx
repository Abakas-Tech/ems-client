import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import CreateEmployer from "../../components/Employer/CreateEmployer";

const CreateEmployerPage = () => {
  const location = useLocation();
  const state = location.state || {};
  const [isEditMode, setIsEditMode] = useState(false);
  const [employerData, setEmployerData] = useState(null);

  // Prefill state if navigated with employerData
  useEffect(() => {
    if (state.employerData) {
      setIsEditMode(true);
      setEmployerData(state.employerData);
    } else {
      setIsEditMode(false);
      setEmployerData(null);
    }
  }, [state]);

  return <CreateEmployer isEditMode={isEditMode} employerData={employerData} />;
};

export default CreateEmployerPage;

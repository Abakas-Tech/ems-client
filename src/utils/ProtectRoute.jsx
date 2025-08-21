import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "./../../context/auth/UseAuth";

const ProtecteRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate, location]);

  return user ? children : null;
};

export default ProtecteRoute;

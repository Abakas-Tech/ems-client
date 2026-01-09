// src/context/useLogout.js
import { useContext } from "react";
import { LogoutContext } from "./LogoutContext";

const useLogout = () => useContext(LogoutContext);

export default useLogout;

// context/profile/useProfile.js
import { useContext } from "react";
import ProfileContext from "./ProfileContext";

const useProfile = () => useContext(ProfileContext);

export default useProfile;

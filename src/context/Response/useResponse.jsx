import { useContext } from "react";
import { ResponseContext } from "./ResponseContext";

const useResponse = () => useContext(ResponseContext);

export default useResponse;

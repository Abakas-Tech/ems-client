import { useContext } from "react";
import { DeleteContext } from "./DeleteContext";

export const useDelete = () => useContext(DeleteContext);

import { useContext } from "react";
import { ConfirmDeleteContext } from "./DeleteContext";

export const useDelete = () => useContext(ConfirmDeleteContext);

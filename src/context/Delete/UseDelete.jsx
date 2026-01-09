import { useContext } from "react";
import { ConfirmDeleteContext } from "./DeleteContext";

export const useConfirmDelete = () => useContext(ConfirmDeleteContext);

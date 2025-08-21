// src/context/useLoader.js
import { useContext } from "react";
import LoaderContext from "./LoaderContext.jsx";

const useLoader = () => useContext(LoaderContext);

export default useLoader;

import { useContext } from "react";
import loaderContext from "./LoaderContext.jsx";

const useLoader = () => useContext(loaderContext);

export default useLoader;

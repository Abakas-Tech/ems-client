import { useContext } from "react";
import loaderContext from "./LoaderContext.jsx";

const useloader = () => useContext(loaderContext);

export default useloader;

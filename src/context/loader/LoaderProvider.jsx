import { useState } from "react";
import Loader from "./../../shared/global/Loader/Loader.jsx";
import LoaderContext from "./LoaderContext.jsx";

const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showloader = () => setLoading(true);
  const hideloader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ loading, showloader, hideloader }}>
      {children}
      {/*  Render loader globally, same as Response */}
      <Loader />
    </LoaderContext.Provider>
  );
};

export default LoaderProvider;

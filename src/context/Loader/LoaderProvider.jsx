// src/context/LoaderProvider.jsx
import { useState } from "react";
import LoaderContext from "./LoaderContext.jsx";
import Loader from "./../../shared/global/Loader/Loader.jsx"; //  import loader

const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
      {/*  Render loader globally, same as Response */}
      <Loader />
    </LoaderContext.Provider>
  );
};

export default LoaderProvider;

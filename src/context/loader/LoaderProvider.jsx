import { useState } from "react";
import loader from "./../../shared/global/Loader/Loader.jsx";
import loaderContext from "./LoaderContext.jsx";

const loaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  const showloader = () => setLoading(true);
  const hideloader = () => setLoading(false);

  return (
    <loaderContext.Provider value={{ loading, showloader, hideloader }}>
      {children}
      {/*  Render loader globally, same as Response */}
      <loader />
    </loaderContext.Provider>
  );
};

export default loaderProvider;

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/header/header";
import { useEffect } from "react";
const JQUERY_CDN_URL = "https://code.jquery.com/jquery-3.6.0.min.js";
const CUSTOM_JS_FILE_PATH = "/custom.js";
function App() {
  useEffect(() => {
    // Helper function to load a single script
    const loadScript = (src, onLoadCallback) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = onLoadCallback;
      document.body.appendChild(script);

      // Return a cleanup function for this script
      return () => {
        document.body.removeChild(script);
      };
    };

    // Load jQuery, then inside its onload handler, load your custom script.
    // This ensures the correct order.
    const cleanupJquery = loadScript(JQUERY_CDN_URL, () => {
      // console.log("jQuery loaded successfully.");
      const cleanupCustomScript = loadScript(CUSTOM_JS_FILE_PATH, () => {
        // console.log("Custom script loaded successfully.");
        // Call your initialization function here if needed
        // window.myTemplateInitFunction();
      });
      // The outer cleanup will now also clean up the custom script
      return cleanupCustomScript;
    });

    // The final cleanup function returns the result of the first cleanup.
    return cleanupJquery;
  }, []);
  return (
    <>
      <Router>
        <Header />
      </Router>
    </>
  );
}

export default App;

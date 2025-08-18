import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Routers from "./router/router";
// Define all the URLs for the libraries.
const JQUERY_CDN_URL = "https://code.jquery.com/jquery-3.6.0.min.js";

const SLICK_CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick.css";
const SLICK_THEME_CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.8.1/slick-theme.css";
const SLICK_JS_URL =
  "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js";

const RANGESLIDER_CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.1/css/ion.rangeSlider.min.css";
const RANGESLIDER_JS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.1/js/ion.rangeSlider.min.js";

const SELECT2_CSS_URL =
  "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css";
const SELECT2_JS_URL =
  "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js";

// Magnific Popup also needs a CSS file.
const JQUERY_MAGNIFIC_POPUP_CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.min.css";
const JQUERY_MAGNIFIC_POPUP_JS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/jquery.magnific-popup.min.js";

const CUSTOM_JS_FILE_PATH = "/custom.js";

function App() {
  useEffect(() => {
    // Helper function to load a single script or stylesheet.
    const loadResource = (tag, src, onLoadCallback) => {
      const element = document.createElement(tag);
      if (tag === "script") {
        element.src = src;
        element.async = true;
        if (onLoadCallback) {
          element.onload = onLoadCallback;
        }
      } else if (tag === "link") {
        element.rel = "stylesheet";
        element.href = src;
      }
      document.head.appendChild(element);
      return () => {
        document.head.removeChild(element);
      };
    };

    // Load all CSS files first. These can be loaded in parallel.
    const cleanupSlickCSS = loadResource("link", SLICK_CSS_URL);
    const cleanupSlickThemeCSS = loadResource("link", SLICK_THEME_CSS_URL);
    const cleanupRangeSliderCSS = loadResource("link", RANGESLIDER_CSS_URL);
    const cleanupSelect2CSS = loadResource("link", SELECT2_CSS_URL);
    const cleanupMagnificPopupCSS = loadResource(
      "link",
      JQUERY_MAGNIFIC_POPUP_CSS_URL
    );

    // This is the core logic: we nest the callbacks to ensure sequential loading
    // of the JavaScript files. The order is: jQuery -> Slick -> RangeSlider -> Select2 -> Magnific Popup -> Custom.
    const cleanupJquery = loadResource("script", JQUERY_CDN_URL, () => {
      // console.log("jQuery loaded successfully.");

      const cleanupSlick = loadResource("script", SLICK_JS_URL, () => {
        // console.log("Slick.js loaded successfully.");

        const cleanupRangeSlider = loadResource(
          "script",
          RANGESLIDER_JS_URL,
          () => {
            // console.log("RangeSlider.js loaded successfully.");

            const cleanupSelect2 = loadResource(
              "script",
              SELECT2_JS_URL,
              () => {
                // console.log("Select2.js loaded successfully.");

                const cleanupMagnificPopup = loadResource(
                  "script",
                  JQUERY_MAGNIFIC_POPUP_JS_URL,
                  () => {
                    // console.log("Magnific Popup loaded successfully.");

                    const cleanupCustomScript = loadResource(
                      "script",
                      CUSTOM_JS_FILE_PATH,
                      () => {
                        // console.log("Custom script loaded successfully.");
                        // At this point, all scripts are loaded and you can safely call any
                        // initialization functions from your custom script.
                      }
                    );
                    return cleanupCustomScript;
                  }
                );
                return cleanupMagnificPopup;
              }
            );
            return cleanupSelect2;
          }
        );
        return cleanupRangeSlider;
      });
      return cleanupSlick;
    });

    // The final cleanup function returns a function that will remove all scripts and stylesheets.
    return () => {
      cleanupJquery();
      cleanupSlickCSS();
      cleanupSlickThemeCSS();
      cleanupRangeSliderCSS();
      cleanupSelect2CSS();
      cleanupMagnificPopupCSS();
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return (
    <>
      <Router>
        <Routers />
      </Router>
    </>
  );
}

export default App;

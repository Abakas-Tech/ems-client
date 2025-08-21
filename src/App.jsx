import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Routers from "./router/router";

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
    <BrowserRouter>
      <Routers />
    </BrowserRouter>
  );
}

export default App;

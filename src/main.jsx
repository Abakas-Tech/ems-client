import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./assets/css/styles.css";
import "./assets/css/colors.css";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";
import LoaderProvider from "./context/Loader/LoaderProvider";
import LogoutProvider from "./context/logout/LogoutProvider.jsx";
import ResponseProvider from "./context/response/ResponseProvider.jsx";
import { AuthProvider } from "./context/auth/authProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LoaderProvider>
          <LogoutProvider>
            <ResponseProvider>
              <ConfirmDeleteProvider>
                <App />
              </ConfirmDeleteProvider>
            </ResponseProvider>
          </LogoutProvider>
        </LoaderProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

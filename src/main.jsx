import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
// import "./assets/css/templatemo-chain-app-dev.css";
// import "./assets/css/animated.css";
// import "./assets/css/owl.css";
// import "./assets/css/main.css";
import "./assets/css/styles.css";
import "./assets/css/colors.css";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "aos/dist/aos.css";
import App from "./App.jsx";
import LoaderProvider from "./context/loader/LoaderProvider";
import LogoutProvider from "./context/Logout/LogoutProvider.jsx";
import ResponseProvider from "./context/Response/ResponseProvider.jsx";
import ConfirmDeleteProvider from "./context/Delete/DeleteProvider";
import ProfileProvider from "./context/Profile/ProfileProvider.jsx";
import DemoInfoProvider from "./context/Demo/DemoInfoProvider";
import NotificationProvider from "./context/Notification/NotificationProvider.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <DemoInfoProvider>
      <ResponseProvider>
        <ProfileProvider>
          <LogoutProvider>
            <LoaderProvider>
              <ConfirmDeleteProvider>
                <NotificationProvider>
                  <App />
                </NotificationProvider>
              </ConfirmDeleteProvider>
            </LoaderProvider>
          </LogoutProvider>
        </ProfileProvider>
      </ResponseProvider>
    </DemoInfoProvider>
  </BrowserRouter>,
  // </StrictMode>,
);

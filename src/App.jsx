import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import AppRouter from "./routes/AppRouter";
import { useEffect } from "react";

function App() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then()
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  }
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);
  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;

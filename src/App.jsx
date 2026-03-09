import "./App.css";
import AppRouter from "./routes/AppRouter";
function App() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        );
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  }
  return (
    <>
      <AppRouter />
    </>
  );
}

export default App;

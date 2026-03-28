import "./App.css";
import AppRouter from "./routes/AppRouter";
function App() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then()
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

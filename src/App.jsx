import "./App.css";
import useProfile from "./context/Profile/useProfile";
import AppRouter from "./routes/AppRouter";
import { useTicketPrefetch } from "./utils/ticket/useTicketPrefetch";
function App() {
  const profile = useProfile();
  const prefetchStatus = useTicketPrefetch();
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
      {profile && <PrefetchStarter />}
      <AppRouter />
    </>
  );
}

function PrefetchStarter() {
  useTicketPrefetch();
  return null;
}

export default App;

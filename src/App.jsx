import "./App.css";
import Loader from "./shared/global/Loader/Loader";
import Logout from "./shared/global/Logout/Logout";
import Response from "./shared/global/Response/Response";
import AppRouter from "./routes/router";
function App() {
  return (
    <div>
      <AppRouter />
      {/* Global components */}
      <Logout />
      <Response />
      <Loader />
    </div>
  );
}

export default App;

import "./App.css";
import Loader from "./components/global/Loader/Loader";
import Logout from "./components/global/Logout/Logout";
import Response from "./components/global/Response/Response";
import AppRouter from "./router/router";
function App() {
  return (
    <div>
      <Loader />
      <AppRouter />
      {/* Global components */}

      {/* <Logout /> */}
    </div>
  );
}

export default App;

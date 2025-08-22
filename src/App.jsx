import "./App.css";

import PropertyFormPage from "./components/admin/Properties/PropertyFormPage";
import Response from "./components/global/Response/Response";
import Loader from './components/global/Loader/Loader';

function App() {
  return (
    <div>
      <PropertyFormPage />
      <Loader/>
      <Response />
    </div>
  );
}

export default App;

import "./App.css";

import PropertyFormPage from "./components/admin/Properties/PropertyFormPage";
import Response from "./components/global/Response/Response";
import Loader from "./components/global/Loader/Loader";
import PropertyList from "./pages/public/propertiesList/properties.list";
import PropertyDetailsForm from "./components/admin/Properties/PropertyDetailsForm";

function App() {
  return (
    <div>
      <PropertyList isPublicPage={false} />
      {/* <PropertyFormPage/> */}
      <Loader />
      <Response />
    </div>
  );
}

export default App;

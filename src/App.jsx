import "./App.css";

import PropertyFormPage from "./components/admin/Properties/PropertyFormPage";
import Response from "./components/global/Response/Response";
import Loader from "./components/global/Loader/Loader";
import PropertyList from "./pages/public/propertiesList/properties.list";
import PropertyDetailsForm from "./components/admin/Properties/PropertyDetailsForm";
import { Route, Routes } from "react-router-dom";
import PropertyDetails from "./pages/public/propertiesDetail/PropertiesDetail";

function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/admin/properties"
          element={<PropertyList isPublicPage={false} />}
        />
        <Route path="/admin/properties/:id" element={<PropertyFormPage />} />
        <Route path="/admin/properties/veiw/:id" element={<PropertyDetails isPublicPage={false} />} />
      </Routes>

      <Loader />
      <Response />
    </div>
  );
}

export default App;

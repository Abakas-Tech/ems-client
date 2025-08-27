import "./App.css";

import PropertyFormPage from "./components/admin/Properties/PropertyFormPage";
import Response from "./components/global/Response/Response";
import Loader from "./components/global/Loader/Loader";
import PropertyList from "./pages/public/propertiesList/properties.list";
import PropertyDetailsForm from "./components/admin/Properties/PropertyDetailsForm";
import { Route, Routes } from "react-router-dom";
import PropertyDetails from "./pages/public/propertiesDetail/PropertiesDetail";
import ChatBot from "./components/chat/chatBot";

function App() {
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={<PropertyList />}
        />
       
      </Routes>
 
      <Loader />
      <Response />
    </div>
  );
}

export default App;

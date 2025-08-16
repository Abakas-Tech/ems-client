import { BrowserRouter } from "react-router-dom";
import "./App.css";
import PropertyListPage from "./components/properties/properties.list";

function App() {
  return (
    <BrowserRouter>
      <PropertyListPage />
    </BrowserRouter>
  );
}

export default App;

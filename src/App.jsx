import { BrowserRouter } from "react-router-dom";
import "./App.css";
import PropertyListPage from "./components/properties/properties.list";
import ChatBot from "./components/chat/chatBot";

function App() {
  return (
    <BrowserRouter>
      <PropertyListPage />
      <ChatBot />
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter } from "react-router-dom";
import "./App.css";
import PropertyListPage from "./components/properties/properties.list";
import ChatBot from "./components/chat/chatBot";
import AboutSnippet from "./components/about-snippet/about-snippet";

function App() {
  return (
    <BrowserRouter>
    <AboutSnippet/>
      <PropertyListPage />
      <ChatBot />
    </BrowserRouter>
  );
}

export default App;

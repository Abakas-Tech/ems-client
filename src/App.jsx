import { BrowserRouter } from "react-router-dom";
import "./App.css";
import PropertyListPage from "./components/properties/properties.list";
import ChatBot from "./components/chat/chatBot";
import AboutSnippet from './components/AboutSnippet/AboutSnippet';

function App() {
  return (
    <BrowserRouter>
      <PropertyListPage />
      <AboutSnippet />
      <ChatBot />
    </BrowserRouter>
  );
}

export default App;

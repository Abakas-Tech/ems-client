import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/header/header";

function App() {
  return (
    <>
      <Router>
        <Header />
      </Router>
    </>
  );
}

export default App;

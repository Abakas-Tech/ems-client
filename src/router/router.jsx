import { Route, Routes } from "react-router-dom";
import Properties from "../pages/public/properties.list.jsx";
import AboutDetail from "../components/AboutDetail/AboutDetail.jsx";
const router = () => {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/properties" element={<Properties />} />
      <Route path="/about" element={<AboutDetail />} />
    </Routes>
  );
};

export default router;

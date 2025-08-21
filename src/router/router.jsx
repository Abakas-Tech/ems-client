import { Route, Routes } from "react-router-dom";
import AboutDetail from "../pages/public/AboutDetail/AboutDetail.jsx";
import PropertyList from "../pages/public/propertiesList/properties.list.jsx";
import PropertyDetails from "../pages/public/propertiesDetail/PropertiesDetail.jsx";
import Layout from "../components/Layout/Layout.jsx";
const router = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <h1>Home</h1>{" "}
          </Layout>
        }
      />
      <Route
        path="/properties"
        element={
          <Layout>
            <PropertyList />
          </Layout>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <Layout>
            <PropertyDetails />{" "}
          </Layout>
        }
      />
      <Route
        path="/about"
        element={
          <Layout>
            <AboutDetail />{" "}
          </Layout>
        }
      />
    </Routes>
  );
};

export default router;

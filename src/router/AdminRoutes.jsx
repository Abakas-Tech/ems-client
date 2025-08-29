import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import Dashboard from "../pages/admin/Dashboard/Dashboard.jsx";
import Analytics from "../pages/admin/Analytics/Analytics.jsx";
import FileManager from "../pages/admin/FileManager/FileManager.jsx";
import Appointments from "../pages/admin/Appointments/Appointments.jsx";
import PropertyList from "../pages/public/propertiesList/propertiesList.jsx";
import PropertyDetails from "../pages/public/propertiesDetail/PropertiesDetail.jsx";
import Featured from "../components/Featured/Featured.jsx";
import PropertyFormPage from "../components/admin/Properties/PropertyFormPage.jsx";
import MyProfile from "../pages/admin/MyProfile/MyProfile.jsx";
import ChangePassword from "../pages/admin/ChangePassword/ChangePassword.jsx";

const AdminRoutes = () => (
  <Routes>
    {/* Parent admin layout (Dashboard) */}
    <Route
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<Analytics />} />
      <Route path="my-files" element={<FileManager />} />
      <Route path="appointments" element={<Appointments />} />
      <Route
        path="my-listings"
        element={<PropertyList isPublicPage={false} />}
      />
      <Route
        path="properties/veiw/:id"
        element={<PropertyDetails isPublicPage={false} />}
      />
      <Route path="featured-properties" element={<Featured />} />
      <Route path="submit-property" element={<PropertyFormPage />} />
      <Route path="properties/:id" element={<PropertyFormPage />} />
      <Route path="my-profile" element={<MyProfile />} />
      <Route path="settings" element={<ChangePassword />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

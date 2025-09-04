import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import Dashboard from "../domains/admin/pages/Dashboard/Dashboard.jsx";
import Analytics from "../domains/admin/pages/Analytics/Analytics.jsx";
import FileManager from "../domains/admin/pages/FileManager/FileManager.jsx";
import Appointments from "../domains/admin/pages/Appointments/Appointments.jsx";
import PropertyList from "../domains/public/components/propertiesList/propertiesList.jsx";
import Featured from "../domains/public/pages/Featured/Featured.jsx";
import PropertyFormPage from "../domains/admin/components/Properties/PropertyFormPage.jsx";
import MyProfile from "../domains/admin/pages/MyProfile/MyProfile.jsx";
import ChangePassword from "../domains/admin/pages/ChangePassword/ChangePassword.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";

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
    
      <Route path="featured-properties" element={<Featured isAdmin={true} />} />
      <Route path="submit-property" element={<PropertyFormPage />} />
      <Route path="properties/:id" element={<PropertyFormPage />} />
      <Route path="my-profile" element={<MyProfile />} />
      <Route path="settings" element={<ChangePassword />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

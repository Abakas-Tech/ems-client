import React from "react";
import { Route, Routes } from "react-router-dom";
import Files from "../domains/admin/pages/FileManager/FileManager.jsx";
import Finances from "../domains/admin/pages/FinancePage/FinancePage.jsx";
import Analytics from "../domains/admin/pages/AnalyticsPage/AnalyticsPage.jsx";
import WorkersDashboard from "../domains/admin/pages/workers/WorkersDashboard/WorkersDashboard.jsx";
import WorkersRegistration from "../domains/admin/pages/workers/WorkersRegistration/WorkersRegistration.jsx";
import ActiveWorkers from "../domains/admin/pages/workers/ActiveWorkers/ActiveWorkers.jsx";
import ArchivedWorkers from "../domains/admin/pages/workers/ArchivedWorkers/ArchivedWorkers.jsx";
import WorkersModules from "../domains/admin/pages/workers/WorkersModules/WorkersModules.jsx";
import ModuleLists from "../domains/admin/pages/workers/ModuleLists/ModuleLists.jsx";
import WorkersPesonalInfo from "../domains/admin/pages/workers/WorkersModules/WorkersPersonalInfo/WorkersPesonalInfo.jsx";

import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import ChangePasswordPage from "../domains/admin/pages/ChangePassword/ChangePassword.jsx";
import Profile from "../domains/admin/pages/Profile/Profile.jsx";
import CreateUser from "./../domains/admin/pages/user/CreateUser/CreateUser";
import ListUser from "./../domains/admin/pages/user/ListUser/ListUser";
import AdminLayout from "./../shared/layout/AdminLayout/AdminLayout";
import MetaDataDashboard from "../domains/admin/pages/meta/MetaDataDashboard/MetaDataDashboard.jsx";

const AdminRoutes = () => (
  <Routes>
    <Route
      element={
        // <ProtectedRoute>
        <AdminLayout />
        // </ProtectedRoute>
      }
    >
      <Route path="settings" element={<ChangePasswordPage />} />
      <Route path="create-user" element={<CreateUser />} />
      <Route path="my-profile" element={<Profile />} />
      <Route path="user-management" element={<ListUser />} />
      <Route path="dashboard" element={<Analytics />} />
      <Route path="my-files" element={<Files />} />
      <Route path="finances" element={<Finances />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/workers" element={<WorkersDashboard />} />
      <Route path="/workers/add" element={<WorkersRegistration />} />
      <Route path="/workers/active" element={<ActiveWorkers />} />
      <Route path="/workers/archived" element={<ArchivedWorkers />} />
      <Route path="workers/modules" element={<WorkersModules />} />
      <Route path="/workers/modules/:id/add" element={<ModuleLists />} />
      <Route
        path="/workers/modules/:id/personal"
        element={<WorkersPesonalInfo />}
      />

      <Route path="/meta-data" element={<MetaDataDashboard />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

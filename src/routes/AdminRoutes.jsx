import React from "react";
import { Route, Routes } from "react-router-dom";
import Files from "../domains/admin/pages/FileManager/FileManager.jsx";
import Finances from "../domains/admin/pages/FinancePage/FinancePage.jsx";
import Analytics from "../domains/admin/pages/AnalyticsPage/AnalyticsPage.jsx";
import WorkerDashboard from "../domains/admin/pages/workers/WorkerDashboard/WorkerDashboard.jsx";
import WorkerRegistration from "../domains/admin/pages/workers/WorkerRegistration/WorkerRegistration.jsx";
import ActiveWorkers from "../domains/admin/pages/workers/ActiveWorkers/ActiveWorkers.jsx";
import ArchivedWorkers from "../domains/admin/pages/workers/ArchivedWorkers/ArchivedWorkers.jsx";
// import WorkerModules from "../domains/admin/pages/workers/ModulesList/ModulesList.jsx";
// import WorkerDashboard from "../domains/admin/pages/workers/WorkerDashboard/WorkerDashboard.jsx";
import ModulesList from "../domains/admin/pages/workers/ModulesList/ModulesList.jsx";
import WorkerPesonalInfo from "../domains/admin/pages/workers/modules/WorkerPersonalInfo/WorkerPesonalInfo.jsx";

import ProtectedRoute from "../utils/ProtectedRoute.jsx";
import NotFound from "../shared/components/NotFound/NotFound.jsx";
import ChangePasswordPage from "../domains/admin/pages/ChangePassword/ChangePassword.jsx";
import Profile from "../domains/admin/pages/Profile/Profile.jsx";
import CreateUser from "./../domains/admin/pages/user/CreateUser/CreateUser";
import ListUser from "./../domains/admin/pages/user/ListUser/ListUser";
import AdminLayout from "./../shared/layout/AdminLayout/AdminLayout";
import MetaDataDashboard from "../domains/admin/pages/meta/MetaDataDashboard/MetaDataDashboard.jsx";
import WorkerModuleManagement from "../domains/admin/pages/workers/WorkerModuleManagement/WorkerModuleManagement.jsx";
import SkillPage from "../domains/admin/pages/meta/SkillPage/SkillPage.jsx";
import CountryPage from "../domains/admin/pages/meta/CountryPage/CountryPage.jsx";
import JobPostionPage from "../domains/admin/pages/meta/JobPostionPage/JobPostionPage.jsx";
import RegionPage from "../domains/admin/pages/meta/RegionPage/RegionPage.jsx";
import LanguagePage from "../domains/admin/pages/meta/LanguagePage/LanguagePage.jsx";
import WorkerStatusPage from "../domains/admin/pages/meta/WorkerStatusPage/WorkerStatusPage.jsx";

const AdminRoutes = () => (
  <Routes>
    <Route
      element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
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
      <Route path="/workers" element={<WorkerDashboard />} />
      <Route path="/workers/add" element={<WorkerRegistration />} />
      <Route path="/workers/active" element={<ActiveWorkers />} />
      <Route path="/workers/archived" element={<ArchivedWorkers />} />
      <Route path="workers/modules" element={<WorkerModuleManagement />} />
      <Route path="/workers/modules/:id/add" element={<ModulesList />} />
      <Route path="/meta-data/country" element={<CountryPage />} />
      <Route path="/meta-data/region" element={<RegionPage />} />
      <Route path="/meta-data/skill" element={<SkillPage />} />
      <Route path="/meta-data/job-position" element={<JobPostionPage />} />
      <Route path="/meta-data/language" element={<LanguagePage />} />
      <Route path="/meta-data/worker-status" element={<WorkerStatusPage />} />




      <Route
        path="/workers/modules/:id/personal"
        element={<WorkerPesonalInfo />}
      />

      <Route path="/meta-data" element={<MetaDataDashboard />} />
    </Route>
  </Routes>
);

export default AdminRoutes;

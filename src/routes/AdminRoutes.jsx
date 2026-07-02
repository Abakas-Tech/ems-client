import React from "react";
import { Route, Routes } from "react-router-dom";
import Files from "../domains/admin/pages/FileManager/FileManager.jsx";
import Finances from "../domains/admin/pages/FinancePage/FinancePage.jsx";
import Analytics from "../domains/admin/pages/AnalyticsPage/AnalyticsPage.jsx";
import WorkerDashboard from "../domains/admin/pages/workers/WorkerDashboard/WorkerDashboard.jsx";
import WorkerRegistration from "../domains/admin/pages/workers/WorkerRegistration/WorkerRegistration.jsx";
import ActiveWorkers from "../domains/admin/pages/workers/ActiveWorkers/ActiveWorkers.jsx";
import WorkerAutoFill from "../domains/admin/pages/workers/WorkerAutoFill/WorkerAutoFill.jsx";
import ArchivedWorkers from "../domains/admin/pages/workers/ArchivedWorkers/ArchivedWorkers.jsx";
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
import Notifications from "../domains/admin/pages/NotificationPage/NotificationPage.jsx";
import Passport from "../domains/admin/pages/workers/modules/Passport/Passport.jsx";
import Coc from "../domains/admin/pages/workers/modules/Coc/Coc.jsx";
import Medical from "../domains/admin/pages/workers/modules/Medical/Medical.jsx";

import SkillPage from "../domains/admin/pages/meta/SkillPage/SkillPage.jsx";
import CountryPage from "../domains/admin/pages/meta/CountryPage/CountryPage.jsx";
import JobPostionPage from "../domains/admin/pages/meta/JobPostionPage/JobPostionPage.jsx";
import RegionPage from "../domains/admin/pages/meta/RegionPage/RegionPage.jsx";
import LanguagePage from "../domains/admin/pages/meta/LanguagePage/LanguagePage.jsx";
import WorkerStatusPage from "../domains/admin/pages/meta/WorkerStatusPage/WorkerStatusPage.jsx";
import CityPage from "../domains/admin/pages/meta/CityPage/CityPage.jsx";
import WorkerMetaPage from "../domains/admin/pages/WorkerMetaPage/WorkerMetaPage.jsx";
import WorkerProfile from "../domains/admin/pages/workers/WorkerProfile/WorkerProfile.jsx";
import SocialMediaPage from "../domains/admin/pages/content/SocialMedia/SocialMedia.jsx";
import GalleryListPage from "./../domains/admin/pages/content/Gallery/Gallery/Gallery";
import GalleryUplaodPage from "../domains/admin/pages/content/Gallery/GalleryUpload/GalleryUplaod.jsx";
import LocationPage from "./../domains/admin/pages/content/Location/Location";
import ContentDashboard from "../domains/admin/components/content/Dashboard/Dashboard.jsx";
import useProfile from "../context/Profile/useProfile.jsx";
import Lmis from "./../domains/admin/pages/workers/modules/Lmis/Lmis";
import Travel from "../domains/admin/pages/workers/modules/Travel/Travel.jsx";
import Contract from "../domains/admin/pages/workers/modules/Contract/Contract.jsx";
import Guarantor from "../domains/admin/pages/workers/modules/Guarantor/Guarantor.jsx";
import Visa from "../domains/admin/pages/workers/modules/Visa/Visa.jsx";
import CV from "../domains/admin/pages/workers/modules/CV/CV.jsx";
import UserManual from "../domains/admin/pages/UserManual/UserManual.jsx";
import WeredaPage from "../domains/admin/pages/meta/WeredaPage/WeredaPage.jsx";
import SubCityPage from "../domains/admin/pages/meta/SubCityPage/SubCityPage.jsx";
import FileSearch from "../domains/admin/pages/FileSearch/FileSearch.jsx";

const AdminRoutes = () => {
  const { profile } = useProfile();
  const role = profile?.role_id;
  return (
    <Routes>
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="settings" element={<ChangePasswordPage />} />
        <Route path="users/create-user" element={<CreateUser />} />
        <Route path="my-profile" element={<Profile />} />
        <Route path="users" element={<ListUser />} />
        <Route path="dashboard" element={<Analytics />} />
        <Route path="files" element={<Files />} />
        <Route
          path="finances"
          element={
            <>
              <Finances />
            </>
          }
        />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
        <Route
          path="/employees"
          element={
            role === 3 || role === 5 ? <ActiveWorkers /> : <WorkerDashboard />
          }
        />
        <Route path="/employees/add" element={<WorkerRegistration />} />
        <Route path="/employees/edit/:id" element={<WorkerRegistration />} />
        <Route path="/employees/active" element={<ActiveWorkers />} />
        <Route path="/employees/autofill" element={<WorkerAutoFill />} />
        <Route path="/employees/active/:id" element={<WorkerProfile />} />
        <Route path="/employees/archived" element={<ArchivedWorkers />} />
        <Route path="/employees/modules" element={<WorkerModuleManagement />} />
        <Route path="/employees/modules/:id/add" element={<ModulesList />} />
        <Route path="/meta-data/country" element={<CountryPage />} />
        <Route path="/meta-data/region" element={<RegionPage />} />
        <Route path="/meta-data/wereda" element={<WeredaPage />} />
        <Route path="/meta-data/skill" element={<SkillPage />} />
        <Route path="/meta-data/job-position" element={<JobPostionPage />} />
        <Route path="/meta-data/language" element={<LanguagePage />} />
        <Route
          path="/meta-data/employee-status"
          element={<WorkerStatusPage />}
        />
        <Route path="/meta-data/city" element={<CityPage />} />
        <Route path="/meta-data/sub-city" element={<SubCityPage />} />
        <Route
          path="employee/modules/:worker_id/attributes"
          element={<WorkerMetaPage />}
        />

        <Route
          path="employee/modules/:id/personal"
          element={<WorkerPesonalInfo />}
        />
        <Route path="employee/modules/:id/passport" element={<Passport />} />
        <Route path="employee/modules/:id/coc" element={<Coc />} />
        <Route path="employee/modules/:id/medical" element={<Medical />} />
        <Route path="employee/modules/:id/lmis" element={<Lmis />} />
        <Route
          path="employee/modules/:id/travel-records"
          element={<Travel />}
        />
        <Route path="employee/modules/:id/contract" element={<Contract />} />
        <Route
          path="employee/modules/:id/emergency-contact"
          element={<Guarantor />}
        />
        <Route path="employee/modules/:id/cv" element={<CV />} />
        <Route path="employee/modules/:id/visa" element={<Visa />} />
        <Route path="/meta-data" element={<MetaDataDashboard />} />
        <Route path="/content" element={<ContentDashboard />} />
        <Route path="/content/social-media" element={<SocialMediaPage />} />
        <Route path="/content/location" element={<LocationPage />} />
        <Route path="/content/gallery" element={<GalleryListPage />} />
        <Route path="/content/gallery/create" element={<GalleryUplaodPage />} />
        <Route
          path="/content/gallery/edit/:id"
          element={<GalleryUplaodPage />}
        />

        <Route path="documents" element={<FileSearch />} />

        <Route path="user-manual" element={<UserManual />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";
import { getProfile } from "../../../api/admin/auth.api";
function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    agent_name: "",
  });
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        const data = response.data;
        setProfileData({
          agent_name: data.agent_name || "",
        });
      } catch (error) {
        "error", "Failed to fetch profile.", error;
      }
    };
    fetchProfile();
  }, []);

  return (
    <Layout>
      {/* Page header */}
      <div className="page-title">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title">Welcome back,</h2>
              <span className="ipn-subtitle">
                {profileData.agent_name} — your account is ready.
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid bg-light py-5">
        <div className="row d-lg-none">
          <div className="col-12">
            <div className="filter_search_opt">
              <button
                onClick={toggleSidebar}
                className="btn btn-dark w-100 mb-4"
              >
                Dashboard Navigation
                <i className="fa-solid fa-bars ms-2"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
          <div
            className="col-lg-9 col-md-12 dashboard-content"
            style={{ overflowY: "auto" }}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;

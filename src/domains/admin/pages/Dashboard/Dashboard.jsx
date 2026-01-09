import React, { useState } from "react";
import Sidebar from "../.././components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Layout from "../../../../shared/Layout/Layout";
import { useProfile } from "../../../../context/Profile/ProfileProvider";
function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile } = useProfile();
  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      return !prev;
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Layout>
      {/* Page header */}
      <div className="page-title" style={{ marginTop: "50px" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title">Welcome back,</h2>
              <span className="ipn-subtitle">
                {profile?.agent_name} — your account is ready.
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
                className="btn btn-dark w-100 mb-4 d-lg-none"
                type="button"
                aria-expanded={sidebarOpen}
                aria-controls="sidebarOffcanvas"
              >
                Dashboard Navigation
                <i className="fa-solid fa-bars ms-2"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-3">
            <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
          </div>
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

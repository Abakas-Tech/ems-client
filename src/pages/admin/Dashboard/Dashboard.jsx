import React, { useState } from "react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import Layout from "../../../components/Layout/Layout";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Layout>
      {/* Page header */}
      <div className="page-title">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <h2 className="ipt-title">Welcome back,</h2>
              <span className="ipn-subtitle">
                Kasim — your account is ready.
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

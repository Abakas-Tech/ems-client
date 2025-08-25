import React from "react";
import Sidebar from "../../../components/Admin/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

function Dashboard() {
  return (
    <div className="container-fluid">
      <div className="row" style={{ height: "100vh" }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Right-side content */}
        <div
          className="col-lg-9 col-md-12"
          style={{ overflowY: "auto", padding: "20px" }}
        >
          <Outlet /> {/* This will render the page/component for each route */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

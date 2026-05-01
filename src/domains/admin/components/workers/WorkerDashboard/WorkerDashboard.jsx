import React from "react";
import {
  FaUserPlus,
  FaUsers,
  FaUserSlash,
  FaPlaneDeparture,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import styles from "../../UserManual/UserManual.module.css";

function WorkerDashboard() {
  return (
    <div className=" dashboard-wraper">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Employees Management</h2>
        <p className="text-muted mb-0">
          Add new employees, manage active profiles, review archived records,
          and configure employee modules.
        </p>
      </div>

      <div className="container">
        <div className="row justify-content-start g-lg-3 g-4">
          {/* Add Worker */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/employees/add"
              className="text-decoration-none text-dark"
            >
              <div
                className={`agents-grid card rounded-4 border p-4 text-center h-100 shadow-sm-hover ${styles["manual-card"]}`}
              >
                <div className="mt-4 mb-3">
                  <FaUserPlus className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Add Employee</h5>
              </div>
            </Link>
          </div>

          {/* Active Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/employees/active"
              className="text-decoration-none text-dark"
            >
              <div
                className={`agents-grid card rounded-4 border p-4 text-center h-100 shadow-sm-hover ${styles["manual-card"]}`}
              >
                <div className="mt-4 mb-3">
                  <FaUsers className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Active Employees</h5>
              </div>
            </Link>
          </div>
          {/* Archived Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/employees/archived"
              className="text-decoration-none text-dark"
            >
              <div
                className={`agents-grid card rounded-4 border p-4 text-center h-100 shadow-sm-hover ${styles["manual-card"]}`}
              >
                <div className="mt-4 mb-3">
                  <FaUserSlash className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Archived Employees</h5>
              </div>
            </Link>
          </div>
          {/* Deployed Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/employees/deployed"
              className="text-decoration-none text-dark"
            >
              <div
                className={`agents-grid card rounded-4 border p-4 text-center h-100 shadow-sm-hover ${styles["manual-card"]}`}
              >
                <div className="mt-4 mb-3">
                  <FaPlaneDeparture className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Deployed Employees</h5>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerDashboard;

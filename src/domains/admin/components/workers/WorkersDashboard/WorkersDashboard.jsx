import React from "react";
import { FaUserPlus, FaUsers, FaUserSlash, FaFolderPlus } from "react-icons/fa";
import { Link } from "react-router-dom";

function WorkersDashboard() {
  return (
    <section className=" dashboard-wraper">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Worker Management</h2>
        <p className="text-muted mb-0">
          Add new workers, manage active profiles, review archived records, and
          configure worker modules.
        </p>
      </div>

      <div className="container">
        <div className="row justify-content-center g-lg-3 g-4">
          {/* Add Worker */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/workers/add">
                  <FaUserPlus className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/workers/add">Add Worker</Link>
              </h5>
            </div>
          </div>

          {/* Active Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/workers/active">
                  <FaUsers className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/workers/active">Active Workers</Link>
              </h5>
            </div>
          </div>

          {/* Archived Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/workers/archived">
                  <FaUserSlash className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/workers/archived">Archived Workers</Link>
              </h5>
            </div>
          </div>

          {/* Add Modules */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/workers/modules">
                  <FaFolderPlus className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/workers/modules">Add Modules</Link>
              </h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkersDashboard;

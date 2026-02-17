import React from "react";
import { FaUserPlus, FaUsers, FaUserSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

function Workers() {
  return (
    <section className="gray-simple">
      <div className="container">
        <div className="row justify-content-center g-lg-3 g-4">
          {/* Add Worker */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/workers/add">
                  <FaUserPlus color="text-info" size={50} />
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
                  <FaUsers color="text-info" size={50} />
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
                  <FaUserSlash color="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/workers/archived">Archived Workers</Link>
              </h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Workers;

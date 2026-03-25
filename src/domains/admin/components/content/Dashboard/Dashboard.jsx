import React from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { MdPermMedia } from "react-icons/md";
import { FaShareAltSquare } from "react-icons/fa";

import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <section className="dashboard-wraper">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Public Content Management</h2>
        <p className="text-muted mb-0">
          Manage public-facing content such as company locations, galleries, and
          social media accounts.
        </p>
      </div>

      <div className="container">
        <div className="row  g-lg-3 g-4">
          {/* Location */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/public-content/location"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <FaMapLocationDot className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Location</h5>
              </div>
            </Link>
          </div>

          {/* Gallery */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/public-content/gallery"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <MdPermMedia className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Gallery</h5>
              </div>
            </Link>
          </div>

          {/* Social Media */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/public-content/social-media"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <FaShareAltSquare className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Social Media</h5>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;

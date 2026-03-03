import React from "react";
import { IoMdGlobe } from "react-icons/io";
import { FaMapLocationDot } from "react-icons/fa6";
import { IoLanguage } from "react-icons/io5";
import { MdOutlineWorkOutline } from "react-icons/md";
import { GiBrain } from "react-icons/gi";
import { FaMap } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiActivity } from "react-icons/fi";

function MetaDataDashboard() {
  return (
    <section className=" dashboard-wraper">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Metadata Management</h2>
        <p className="text-muted mb-0">
          Manage reference data such as countries, regions, skills, job
          positions, languages, and system statuses used across the platform.
        </p>
      </div>

      <div className="container">
        <div className="row justify-content-center g-lg-3 g-4">
          {/* Add Worker */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/meta-data/country">
                  <IoMdGlobe className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/meta-data/country">Country</Link>
              </h5>
            </div>
          </div>

          {/* Active Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/meta-data/language">
                  <IoLanguage className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/meta-data/language">Language</Link>
              </h5>
            </div>
          </div>

          {/* Add Modules */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/meta-data/region">
                  <FaMap className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/meta-data/region"> Region</Link>
              </h5>
            </div>
          </div>

          {/* Archived Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/meta-data/city">
                  <FaMapLocationDot className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/meta-data/city">City</Link>
              </h5>
            </div>
          </div>

          {/* Archived Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/meta-data/job-position">
                  <MdOutlineWorkOutline className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/meta-data/job-position">Job Position</Link>
              </h5>
            </div>
          </div>

          {/* Archived Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/meta-data/skill">
                  <GiBrain className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/meta-data/skill">Skill</Link>
              </h5>
            </div>
          </div>

          {/* Archived Workers */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <div className="agents-grid card rounded-3 border p-4 text-center">
              <div className="mt-4 mb-3">
                <Link to="/admin/meta-data/worker-status">
                  <FiActivity className="text-info" size={50} />
                </Link>
              </div>
              <h5 className="fr-can-name lh-base mb-2">
                <Link to="/admin/meta-data/worker-status"> Status</Link>
              </h5>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MetaDataDashboard;

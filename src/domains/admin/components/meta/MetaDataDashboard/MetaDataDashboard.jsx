import React from "react";
import { IoMdGlobe } from "react-icons/io";
import { FaMapLocationDot } from "react-icons/fa6";
import { IoLanguage } from "react-icons/io5";
import { MdOutlineWorkOutline } from "react-icons/md";
import { GiBrain } from "react-icons/gi";
import { FaMap } from "react-icons/fa";
import { AiOutlineApartment } from "react-icons/ai";
import { RiMapPinLine } from "react-icons/ri";
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
          {/* Country */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/country"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <IoMdGlobe className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Country</h5>
              </div>
            </Link>
          </div>

          {/* Language */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/language"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <IoLanguage className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Language</h5>
              </div>
            </Link>
          </div>

          {/* Region */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/region"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <FaMap className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Region</h5>
              </div>
            </Link>
          </div>
          {/* Woreda */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/wereda"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <AiOutlineApartment className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Woreda</h5>
              </div>
            </Link>
          </div>

          {/* City */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/city"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <FaMapLocationDot className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">City</h5>
              </div>
            </Link>
          </div>
          {/* Sub-City */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/sub-city"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <RiMapPinLine className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Sub-City</h5>
              </div>
            </Link>
          </div>

          {/* Job Position */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/job-position"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <MdOutlineWorkOutline className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Job Position</h5>
              </div>
            </Link>
          </div>

          {/* Skill */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/skill"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <GiBrain className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Skill</h5>
              </div>
            </Link>
          </div>

          {/* Worker Status */}
          <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to="/admin/meta-data/worker-status"
              className="text-decoration-none text-dark"
            >
              <div className="agents-grid card rounded-3 border p-4 text-center h-100">
                <div className="mt-4 mb-3">
                  <FiActivity className="text-info" size={50} />
                </div>
                <h5 className="fr-can-name lh-base mb-2">Status</h5>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MetaDataDashboard;

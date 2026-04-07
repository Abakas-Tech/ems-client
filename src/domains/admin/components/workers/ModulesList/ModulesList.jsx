import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPassport,
  FaFileAlt,
  FaFileMedical,
  FaPhoneAlt,
  FaPlane,
  FaFileContract,
  FaFile,
  FaEnvelope,
} from "react-icons/fa";
import { PiCertificateFill } from "react-icons/pi";
import { TbFileCv } from "react-icons/tb";
import { MdContactPhone } from "react-icons/md";
import { IoDocumentAttach } from "react-icons/io5";
import { HiDocumentDuplicate } from "react-icons/hi";
import { FiGrid } from "react-icons/fi";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import styles from "../../UserManual/UserManual.module.css";

function ModulesList() {
  const navigate = useNavigate();
  const { id } = useParams();

  const modules = [
    { name: "Personal Information", icon: <FaUser />, path: `personal` },
    { name: "Passport", icon: <FaPassport />, path: `passport` },
    { name: "COC", icon: <PiCertificateFill />, path: `coc` },
    { name: "Medical", icon: <FaFileMedical />, path: `medical` },
    {
      name: "Emergency Contact",
      icon: <MdContactPhone />,
      path: `emergency-contact`,
    },
    { name: "Visa", icon: <HiDocumentDuplicate />, path: `visa` },
    { name: "LMIS", icon: <IoDocumentAttach />, path: `lmis` },
    { name: "Travel Records", icon: <FaPlane />, path: `travel-records` },
    { name: "Contract", icon: <FaFileContract />, path: `contract` },
    { name: "Attributes", icon: <FiGrid />, path: `attributes` },
    { name: "CV", icon: <FaFileAlt />, path: `cv` },
  ];

  // Go back to previous page
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
        <div className="mb-4">
          <BackButton onClick={goBack} />
          <h2 className="fw-bold text-dark mb-2">Add employee Modules</h2>
          <p className="text-muted mb-0">
            Assign or manage modules for this employee. Select the modules they
            should have and update their profile as needed.
          </p>
        </div>
      </div>
      <div className="row justify-content-center g-lg-3 g-4">
        {modules.map((mod, index) => (
          <div key={index} className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
            <Link
              to={`/admin/employee/modules/${id}/${mod.path}`}
              className="text-decoration-none text-dark"
            >
              <div className={`agents-grid card rounded-4 border p-4 text-center h-100 ${styles["manual-card"]}`}>
                <div className="mt-4 mb-3">
                  {React.cloneElement(mod.icon, {
                    className: "text-info",
                    size: 50,
                  })}
                </div>
                <h5 className="fr-can-name lh-base mb-2">{mod.name}</h5>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModulesList;

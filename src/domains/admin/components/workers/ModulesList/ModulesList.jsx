import React, { useState, useEffect } from "react";
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
import { getWorkerProfile } from "../../../api/worker.api"; // ← add
import useloader from "../../../../../context/Loader/useLoader"; // ← add

function ModulesList() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ── new: fetch profile so each module gets its data as state ──
  const { showLoader, hideLoader } = useloader();
  const [workerData, setWorkerData] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      showLoader();
      try {
        const { data } = await getWorkerProfile(id);
        setWorkerData(data);
      } catch {
        console.error("Failed to fetch worker profile for ModulesList");
      } finally {
        hideLoader();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── map each path to the slice of workerData it needs ──
  // mirrors exactly what WorkerProfile passes via navigate state
  const stateFor = (path) => {
    if (!workerData) return undefined;
    const map = {
      personal: { personal: workerData.personal_information },
      passport: { passport: workerData.passport },
      coc: { coc: workerData.coc },
      medical: { medical: workerData.medical },
      "emergency-contact": { guarantor: workerData.emergency },
      visa: { visa: workerData.visa },
      lmis: { lmis: workerData.lmis },
      "travel-records": { travel: workerData.travel_records },
      contract: { contract: workerData.contracts },
      // attributes and cv carry no prefetched state
    };
    return map[path];
  };

  const modules = [
    { name: "Personal Information", icon: <FaUser />, path: "personal" },
    { name: "Passport", icon: <FaPassport />, path: "passport" },
    { name: "COC", icon: <PiCertificateFill />, path: "coc" },
    { name: "Medical", icon: <FaFileMedical />, path: "medical" },
    {
      name: "Emergency Contact",
      icon: <MdContactPhone />,
      path: "emergency-contact",
    },
    { name: "Visa", icon: <HiDocumentDuplicate />, path: "visa" },
    { name: "Travel Records", icon: <FaPlane />, path: "travel-records" },
    { name: "Contract", icon: <FaFileContract />, path: "contract" },
    { name: "Attributes", icon: <FiGrid />, path: "attributes" },
    { name: "CV", icon: <FaFileAlt />, path: "cv" },
  ];

  const goBack = () => navigate(-1);

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
            {/* ← only change: add state prop to Link */}
            <Link
              to={`/admin/employee/modules/${id}/${mod.path}`}
              state={stateFor(mod.path)}
              className="text-decoration-none text-dark"
            >
              <div
                className={`agents-grid card rounded-4 border p-4 text-center h-100 ${styles["manual-card"]}`}
              >
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

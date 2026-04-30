import React, { useState, useEffect, useCallback } from "react";
import DeployedWorkerFilters from "../DeployedWorkerFilters/DeployedWorkerFilters";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { listDeployedWorkers } from "../../../api/worker.api";
import { getUsers } from "../../../api/user.api";
import { useNavigate } from "react-router-dom";

function DeployedWorkers() {
  const [workers, setWorkers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [filters, setFilters] = useState({
    partnerId: "",
    start_date: "",
    end_date: "",
    page: 1,
  });

  const navigate = useNavigate();
  // Fethc partners
  const fetchPartners = useCallback(async () => {
    try {
      const res = await getUsers({ role_id: 3, is_active: 1 });
      setPartners(res?.data || []);
    } catch (err) {
      console.log(err);
    }
  });
  // Fetch deployed workers
  const fetchDeployedWorkers = useCallback(async () => {
    try {
      // For a real 'Print All' feature, you might need a separate call
      // or pass a high limit if the user clicks print.
      const res = await listDeployedWorkers(filters);
      setWorkers(res?.data?.data || []);
    } catch (err) {
      console.log(err);
    }
  }, [filters]);

  useEffect(() => {
    fetchDeployedWorkers();
    fetchPartners();
  }, [fetchDeployedWorkers]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ partnerId: "", start_date: "", end_date: "", page: 1 });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-wraper">
      {/* Header Section */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-4">
        <div>
          <div className="d-flex align-items-center gap-3">
            <BackButton onClick={() => navigate(-1)} />
            <h2 className="fw-bold text-dark mb-0">Deployed Employees</h2>
          </div>
          <p className="text-muted mt-2 mb-0">
            A list of all successfully deployed personnel.
          </p>
          {/* Print Button positioned similar to Finance page */}
          <div className="d-flex align-items-center gap-3 mt-3">
            <button
              className="btn btn-main px-4 py-3  rounded-3 shadow-sm fw-semibold text-white d-print-none"
              onClick={handlePrint}
            >
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="d-print-none">
        <DeployedWorkerFilters
          filters={filters}
          partners={partners}
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
        />
      </div>

      <div className="card shadow-sm border-0 mt-4" id="printable-report">
        {/* Visible only during print to show active filters */}
        <div className="d-none d-print-block p-4 border-bottom">
          <h4 className="fw-bold">Deployed Workers Report</h4>
          <div className="small text-muted">
            Generated on: {new Date().toLocaleString()} <br />
            Filters: {filters.start_date || "All Time"} to{" "}
            {filters.end_date || "Present"}
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th style={{ width: "50px" }}>No.</th>
                <th>Employee Name</th>
                <th>Labour ID</th>
                <th>Flight Day</th>
                <th>Location</th>
                <th>Partner</th>
              </tr>
            </thead>
            <tbody>
              {workers.length > 0 ? (
                workers.map((worker, index) => (
                  <tr key={index}>
                    <td className="text-muted">{index + 1}</td>
                    <td>
                      <strong>{worker.worker_name}</strong>
                    </td>
                    <td>
                      <span className="badge bg-info-soft text-info border">
                        {worker.labour_id}
                      </span>
                    </td>
                    <td>{new Date(worker.flight_day).toLocaleDateString()}</td>
                    <td>{worker.location || "N/A"}</td>
                    <td>{worker.partner_name || "Direct"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No deployed employees matching these criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DeployedWorkers;

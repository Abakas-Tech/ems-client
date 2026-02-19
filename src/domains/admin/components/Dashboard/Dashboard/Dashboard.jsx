import React, { useState, useEffect } from "react";
import StatCard from "../StatCard/StatCard";
import DashboardFilters from "../DashboardFilters/DashboardFilters"; // Externalized
import { fetchDashboardData } from "../../../api/analytics.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";

const Dashboard = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    period: "monthly",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const loadDashboard = async () => {
    showLoader();
    try {
      const result = await fetchDashboardData(filters);
      setData(result);
    } catch (err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "month" ? parseInt(value) : value,
    }));
  };

  const handleClear = () => {
    setFilters({
      period: "monthly",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });
  };

  if (!data) return null;

  return (
    <div className="dashboard-wraper">
      {/* Page Title Section */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Dashboard Overview</h2>
        <p className="text-muted mb-0">
          Tracking operations and finance for{" "}
          {filters.period === "monthly" ? `${months[filters.month - 1]} ` : ""}
          {filters.year}
        </p>
      </div>

      {/* Externalized Filter Component */}
      <DashboardFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
        months={months}
      />

      {/* Workers Section */}
      <h5 className="fw-bold mb-3 mt-4">Worker Operations</h5>
      <div className="row">
        <StatCard
          title="Total Registered"
          value={data.workers.total_registered}
          icon="bi bi-people"
          colorClass="widget-1"
        />
        <StatCard
          title="Active In Process"
          value={data.workers.active_in_process}
          icon="bi bi-gear-wide-connected"
          colorClass="widget-2"
        />
        <StatCard
          title="Pending Visa"
          value={data.workers.pending_visa}
          icon="bi bi-passport"
          colorClass="widget-3"
        />
        <StatCard
          title="Deployed"
          value={data.workers.deployed_this_period}
          icon="bi bi-airplane-engines"
          colorClass="widget-4"
        />
      </div>

      {/* Finance Section */}
      <h5 className="fw-bold mb-3 mt-4">Finance Summary</h5>
      <div className="row">
        <StatCard
          title="Total Income"
          value={data.finance.period_income}
          prefix=""
          icon="bi bi-graph-up-arrow"
          colorClass="widget-1"
        />
        <StatCard
          title="Expenses"
          value={data.finance.period_expenses}
          prefix=""
          icon="bi bi-cart-dash"
          colorClass="widget-5"
        />
        <StatCard
          title="Net Profit"
          value={data.finance.period_net_profit}
          prefix=""
          icon="bi bi-cash-stack"
          colorClass="widget-2"
        />
        <StatCard
          title="Transactions"
          value={data.finance.transaction_count}
          icon="bi bi-list-check"
          colorClass="widget-6"
        />
      </div>

      {/* Lower Summary Cards */}
      <div className="row mt-2">
        <div className="col-md-6 mb-4">
          <div className="bg-white p-4 rounded shadow-sm d-flex justify-content-between align-items-center border-start border-warning border-5">
            <div>
              <span className="text-muted d-block small fw-bold text-uppercase">
                Pending Contracts
              </span>
              <h3 className="mb-0 fw-bold">
                {data.operations.pending_contracts}
              </h3>
            </div>
            <i className="bi bi-file-earmark-text fs-1 text-warning"></i>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="bg-white p-4 rounded shadow-sm d-flex justify-content-between align-items-center border-start border-primary border-5">
            <div>
              <span className="text-muted d-block small fw-bold text-uppercase">
                Pending QR Codes
              </span>
              <h3 className="mb-0 fw-bold">
                {data.operations.pending_qr_codes}
              </h3>
            </div>
            <i className="bi bi-qr-code fs-1 text-primary"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

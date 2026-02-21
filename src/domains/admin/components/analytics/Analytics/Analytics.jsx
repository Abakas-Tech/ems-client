import React, { useState, useEffect } from "react";
import StatCard from "../StatCard/StatCard";
import AnalyticsFilter from "../AnalyticsFilter/AnalyticsFilter";
import { fetchDashboardData } from "../../../api/analytics.api";
import useLoader from "../../../../../context/Loader/UseLoader";
import useResponse from "../../../../../context/response/UseResponse";

const Analytics = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({
    period: "monthly",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  // Months
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

  // Fetch dashboard data
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

  //  Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === "month" ? parseInt(value) : value,
    }));
  };

  // Handle clear
  const handleClear = () => {
    setFilters({
      period: "monthly",
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    });
  };

  if (!data) return null;

  // Only showing the modified return section for brevity
  return (
    <div className="dashboard-wraper">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Analytics Dashboard</h2>
        <p className="text-muted mb-0">
          Data for{" "}
          {filters.period === "monthly" ? `${months[filters.month - 1]} ` : ""}
          {filters.year}
        </p>
      </div>

      <AnalyticsFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
        months={months}
      />

      <div className="row mt-4">
        <div className="col-12">
          <h6 className="fw-bold text-muted text-uppercase mb-3">
            Worker Metrics
          </h6>
        </div>
        <StatCard
          title="Total Registered"
          value={data.workers.total_registered}
          icon="bi bi-people"
          colorClass="widget-1"
        />
        <StatCard
          title="Active Process"
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

      <div className="row mt-2">
        <div className="col-12">
          <h6 className="fw-bold text-muted text-uppercase mb-3">
            Financial Performance
          </h6>
        </div>
        <StatCard
          title="Total Income"
          value={data.finance.period_income}
          icon="bi bi-graph-up-arrow"
          colorClass="widget-2"
        />
        <StatCard
          title="Expenses"
          value={data.finance.period_expenses}
          icon="bi bi-cart-dash"
          colorClass="widget-5"
        />
        <StatCard
          title="Net Profit"
          value={data.finance.period_net_profit}
          icon="bi bi-cash-stack"
          colorClass="widget-1"
        />
        <StatCard
          title="Transactions"
          value={data.finance.transaction_count}
          icon="bi bi-list-check"
          colorClass="widget-6"
        />
      </div>

      {/* Modernized Bottom Summary Section */}
      <div className="row mt-3">
        <div className="col-md-6 mb-4">
          <div
            className="stat-card-v2 widget-3 border-0 shadow-sm"
            style={{ borderBottom: "4px solid #ffc107" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="fw-bold mb-0">
                  {data.operations.pending_contracts}
                </h3>
                <span className="small text-muted fw-bold text-uppercase">
                  Pending Contracts
                </span>
              </div>
              <div className="stat-icon-circle">
                <i className="bi bi-file-earmark-text"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div
            className="stat-card-v2 widget-4 border-0 shadow-sm"
            style={{ borderBottom: "4px solid #17a2b8" }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3 className="fw-bold mb-0">
                  {data.operations.pending_qr_codes}
                </h3>
                <span className="small text-muted fw-bold text-uppercase">
                  Pending QR Codes
                </span>
              </div>
              <div className="stat-icon-circle">
                <i className="bi bi-qr-code"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

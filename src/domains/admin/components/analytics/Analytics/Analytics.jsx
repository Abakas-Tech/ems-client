import React, { useState, useEffect } from "react";
import StatCard from "../StatCard/StatCard";
import AnalyticsFilter from "../AnalyticsFilter/AnalyticsFilter";
import fetchDashboardData from "../../../api/analytics.api";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";

const Analytics = () => {
  const { showLoader, hideLoader } = useloader();
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
      setData(result.data);
    } catch (err) {
      addMessage(false, err.message);
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
          title="Commissions"
          value={data.finance.period_commission}
          icon="bi bi-cash-coin"
          colorClass="widget-6"
        />
        <StatCard
          title="Vat"
          value={data.finance.period_vat}
          icon="bi bi-percent"
          colorClass="widget-7"
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
      <div className="row mt-2">
        <div className="col-12">
          <h6 className="fw-bold text-muted text-uppercase mb-3">Operations</h6>
        </div>
        <StatCard
          title="Pending Contracts"
          value={data.operations.pending_contracts}
          icon="bi bi-file-earmark-text"
          colorClass="widget-3"
        />
        <StatCard
          title="Pending QR Codes"
          value={data.operations.pending_qr_codes}
          icon="bi bi-qr-code"
          colorClass="widget-4"
        />
      </div>
    </div>
  );
};

export default Analytics;

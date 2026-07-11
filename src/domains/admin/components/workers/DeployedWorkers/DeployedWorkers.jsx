import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// API
import { listDeployedWorkers } from "../../../api/worker.api";
import { getUsers } from "../../../api/user.api";

// Shared Components
import ListingComponent from "../../../../../shared/components/ListingComponent/ListingComponent";
import ReportGenerator from "../../../../../shared/components/Report/Report.jsx";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";

// Contexts
import useLoader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";

// Styles (Reusing the candidate filters style as requested)
import styles from "../WorkerFilter/WorkerFilter.module.css";

const LIMIT = 70;

const DEPLOYED_REPORT_COLUMNS = [
  {
    header: "Employee Name",
    accessor: "worker_name",
    printRender: (row) =>
      row.worker_name
        ? `<strong>${row.worker_name}</strong>`
        : `<span class="dash">—</span>`,
  },
  {
    header: "Labour ID",
    accessor: "labour_id",
    printRender: (row) => row.labour_id || `<span class="dash">—</span>`,
  },
  {
    header: "Flight Day",
    accessor: "flight_day",
    printRender: (row) =>
      row.flight_day
        ? new Date(row.flight_day).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : `<span class="dash">—</span>`,
  },
  {
    header: "Location",
    accessor: "location",
    printRender: (row) => row.location || `<span class="dash">—</span>`,
  },
  {
    header: "Partner",
    accessor: "partner_name",
    printRender: (row) => row.partner_name || `Direct`,
  },
];

function DeployedWorkers() {
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [workers, setWorkers] = useState([]);
  const [partners, setPartners] = useState([]);

  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    partnerId: "",
    start_date: "",
    end_date: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
  });

  // Fetch Partners for Dropdown
  const fetchPartners = useCallback(async () => {
    try {
      const res = await getUsers({ role_id: 3, is_active: 1 });
      setPartners(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch Paginated Data for ListingComponent
  const fetchDeployedWorkers = useCallback(
    async (page = 1) => {
      showLoader();
      try {
        const params = {
          page,
          limit: LIMIT,
          search: filters.search || undefined,
          partnerId: filters.partnerId || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
        };

        const res = await listDeployedWorkers(params);
        const data = res?.data?.data || res?.data || [];
        const pg = res?.pagination || res?.data?.pagination || {};

        setWorkers(data);
        setPagination({
          page: pg.page || page,
          limit: LIMIT,
          total: pg.total || (pg.pages ? pg.pages * LIMIT : data.length),
        });
      } catch (err) {
        addMessage(false, err.message || "Failed to fetch deployed workers");
      } finally {
        hideLoader();
      }
    },
    [filters, showLoader, hideLoader, addMessage],
  );

  // Fetch All Data for the ReportGenerator
  const fetchReportData = async () => {
    setReportLoading(true);
    try {
      const params = {
        page: 1,
        limit: 99999, // High limit for report
        search: filters.search || undefined,
        partnerId: filters.partnerId || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      };

      const response = await listDeployedWorkers(params);
      const data = response?.data?.data || response?.data || [];

      const sortedReportData = [...data].sort((a, b) => {
        const dateA = a.flight_day ? new Date(a.flight_day) : new Date(0);
        const dateB = b.flight_day ? new Date(b.flight_day) : new Date(0);
        return dateA - dateB;
      });

      setReportData(sortedReportData);
      return sortedReportData;
    } catch (err) {
      addMessage(false, err.message || "Failed to generate report data");
      return [];
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployedWorkers(1);
    setReportData([]); // Clear previous report data when filters change
  },[]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ search: "", partnerId: "", start_date: "", end_date: "" });
  };

  const handlePageChange = (newPage) => {
    fetchDeployedWorkers(newPage);
  };

  // Define ListingComponent Columns
  const columns = [
    {
      header: "Employee Name",
      accessor: "worker_name",
      render: (row) => <span className="fw-bold">{row.worker_name}</span>,
    },
    {
      header: "Labour ID",
      accessor: "labour_id",
      render: (row) =>
        row.labour_id ? (
          <span className="badge bg-info-soft text-info border">
            {row.labour_id}
          </span>
        ) : (
          "—"
        ),
    },
    {
      header: "Flight Day",
      accessor: "flight_day",
      render: (row) =>
        row.flight_day
          ? new Date(row.flight_day).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      header: "Location",
      accessor: "location",
      render: (row) => row.location || "—",
    },
    {
      header: "Partner",
      accessor: "partner_name",
      render: (row) => row.partner_name || "Direct",
    },
  ];

  return (
    <div className="dashboard-wraper">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-3 mb-2">
            <BackButton onClick={() => navigate(-1)} />
            <h2 className="fw-bold text-dark mb-0">Deployed Employees</h2>
          </div>
          <p className="text-muted mb-0">
            A list of all successfully deployed personnel.
          </p>
        </div>

        {/* Report Generator Button */}
        {reportLoading ? (
          <button type="button" className="btn btn-main px-4" disabled>
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            />
            Loading...
          </button>
        ) : (
          <ReportGenerator
            reportType="Deployed Workers"
            columns={DEPLOYED_REPORT_COLUMNS}
            data={reportData}
            onBeforeGenerate={fetchReportData}
          />
        )}
      </div>

      <ListingComponent
        data={workers}
        columns={columns}
        actions={[]} // No row actions specified originally, leave empty
        emptyState={{
          title: "No deployed employees found",
          subtitle: "Employees matching your criteria will appear here",
        }}
        filtersComponent={
          <div className={`card shadow-sm mb-4 ${styles["filters-card"]}`}>
            <div className="card-body">
              <div className="row g-3 align-items-center">
                {/* Search */}
                <div className="col-md-4 col-xl-2">
                  <input
                    type="text"
                    name="search"
                    className={`form-control ${styles.input}`}
                    style={{ height: "42px" }}
                    placeholder="Search details..."
                    value={filters.search}
                    onChange={handleFilterChange}
                  />
                </div>

                {/* Partner Dropdown */}
                <div className="col-md-4 col-xl-2">
                  <select
                    name="partnerId"
                    className={`form-select ${styles.input}`}
                    style={{ height: "42px" }}
                    value={filters.partnerId}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Partners</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="col-md-4 col-xl-2">
                  <input
                    type="date"
                    name="start_date"
                    className={`form-control ${styles.input}`}
                    style={{ height: "42px" }}
                    value={filters.start_date}
                    onChange={handleFilterChange}
                  />
                </div>

                {/* End Date */}
                <div className="col-md-4 col-xl-2">
                  <input
                    type="date"
                    name="end_date"
                    className={`form-control ${styles.input}`}
                    style={{ height: "42px" }}
                    value={filters.end_date}
                    onChange={handleFilterChange}
                  />
                </div>

                {/* Clear Button */}
                <div className="col-md-4 col-xl-2 d-grid ms-auto">
                  <button
                    type="button"
                    className={`btn btn-outline-secondary ${styles["clear-btn"]}`}
                    style={{ height: "42px" }}
                    onClick={handleClearFilters}
                    disabled={
                      !filters.search &&
                      !filters.partnerId &&
                      !filters.start_date &&
                      !filters.end_date
                    }
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        pagination={{
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
        }}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default DeployedWorkers;

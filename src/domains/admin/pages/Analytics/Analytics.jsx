import React, { useState, useEffect } from "react";
import AnalyticsChart from "../../components/Analytics/AnalyticsChart/AnalyticsChart";
import AnalyticsCard from "../../components/Analytics/AnalyticsCard/AnalyticsCard";
import AnalyticsFilters from "../../components/Analytics/AnalyticsFilters/AnalyticsFilters";
import {
  fetchPropertiesAnalytics,
  fetchAppointmentAnalytics,
  fetchFileAnalytics,
  fetchPropertiesCount,
} from "../../api/analytics.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaFileAlt } from "react-icons/fa";

const Analytics = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [propertiesData, setPropertiesData] = useState({
    analytics: [],
    total: 0,
  });
  const [propertyCount, setPropertyCount] = useState(null);
  const [appointmentData, setAppointmentData] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 5,
    title: "",
    startDate: "",
    endDate: "",
    sortBy: "viewCount",
  });

  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        //  Prepare filters here
        const cleanFilters = {};

        if (filters.page) cleanFilters.page = parseInt(filters.page, 10);
        if (filters.limit) cleanFilters.limit = parseInt(filters.limit, 10);

        if (filters.startDate && !isNaN(Date.parse(filters.startDate))) {
          cleanFilters.startDate = new Date(filters.startDate).toISOString();
        }

        if (filters.endDate && !isNaN(Date.parse(filters.endDate))) {
          cleanFilters.endDate = new Date(filters.endDate).toISOString();
        }

        //  Only include title if it's not empty after trimming
        if (
          filters.title !== undefined &&
          filters.title !== null &&
          String(filters.title).trim() !== ""
        ) {
          cleanFilters.title = String(filters.title).trim();
        }

        if (filters.sortBy) cleanFilters.sortBy = filters.sortBy;

        //  Call APIs in parallel
        const [properties, appointments, files, propertyCount] =
          await Promise.all([
            fetchPropertiesAnalytics(cleanFilters),
            fetchAppointmentAnalytics(),
            fetchFileAnalytics(),
            fetchPropertiesCount(),
          ]);

        setPropertiesData(properties);
        setAppointmentData(appointments);
        setFileData(files);
        setPropertyCount(propertyCount);
      } catch (err) {
        addMessage("error", err.message);
      } finally {
        hideLoader();
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    if (page === "properties") page = "my-listings";
    if (page === "files") page = "my-files";
    navigate(`/admin/${page}`);
  };

  return (
    <div className="dashboard-wraper  ">
      {/* Header */}
      <div className=" mb-4 text-start">
        <h2 className="fw-bold ">Analytics </h2>
        <p className="text-muted">
          Track properties, appointments & file usage
        </p>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <AnalyticsCard
            title="Properties"
            count={propertyCount?.propertyCount}
            lastAction={propertyCount?.lastCreatedAt}
            icon={FaHome}
            onClick={handlePageChange}
          />
        </div>
        <div className="col-md-4">
          <AnalyticsCard
            title="Appointments"
            count={appointmentData?.appointmentCount}
            lastAction={appointmentData?.lastScheduledAt}
            icon={FaCalendarAlt}
            onClick={handlePageChange}
          />
        </div>
        <div className="col-md-4">
          <AnalyticsCard
            title="Files"
            count={fileData?.uploadCount}
            lastAction={fileData?.lastUploadedAt}
            icon={FaFileAlt}
            onClick={handlePageChange}
          />
        </div>
      </div>

      {/* Filters Component */}
      <AnalyticsFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateChange={handleDateChange}
        onClear={() =>
          setFilters({
            page: 1,
            limit: 5,
            title: "",
            startDate: "",
            endDate: "",
            sortBy: "viewCount",
          })
        }
      />

      {/* Chart */}
      <AnalyticsChart
        data={propertiesData.analytics}
        pagination={propertiesData.pagination}
        onPageChange={(newPage) =>
          setFilters((prev) => ({ ...prev, page: newPage }))
        }
      />
    </div>
  );
};

export default Analytics;

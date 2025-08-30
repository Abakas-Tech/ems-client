import React, { useState, useEffect, useRef } from "react";
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
  const isFirstLoad = useRef(true); // 👈 show success only once

  useEffect(() => {
    const fetchData = async () => {
      showLoader();
      try {
        const [properties, appointments, files, propertyCount] =
          await Promise.all([
            fetchPropertiesAnalytics({
              ...filters,
              title: filters.title || undefined,
            }),
            fetchAppointmentAnalytics(),
            fetchFileAnalytics(),
            fetchPropertiesCount(),
          ]);

        setPropertiesData(properties);
        setAppointmentData(appointments);
        setFileData(files);
        setPropertyCount(propertyCount);

        if (isFirstLoad.current) {
          addMessage(
            "success",
            properties?.message || "Analytics data loaded successfully!"
          );
          isFirstLoad.current = false;
        }
      } catch (err) {
        const message =
          typeof err.message === "string"
            ? err.message
            : "Failed to load analytics data!";
        addMessage("error", message);
      } finally {
        hideLoader();
      }
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = () => {
    navigate(`/dashboard`);
  };

  return (
    <div className="dashboard-wraper container py-5">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">📊 Analytics Dashboard</h2>
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

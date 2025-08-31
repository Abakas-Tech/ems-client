import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import BottomPagination from "../../../../public/components/properties/bottomPagination";
import styles from "./AnalyticsChart.module.css";

// const COLORS = ["#6FA8DC", "#93C47D", "#FFD966", "#E06666", "#8E7CC3"];
const COLORS = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#6610f2"];
// const COLORS = ["#A8D5BA", "#FFDAC1", "#FFB3C6", "#C7CEEA", "#E2F0CB"];

const AnalyticsChart = ({ data, pagination, onPageChange }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`card shadow-sm text-center p-5 ${styles.emptyCard}`}>
        <p className="text-muted mb-0">
          <i className="lni lni-stats-down fs-3 d-block mb-2"></i>
          No analytics available
        </p>
      </div>
    );
  }

  const chartViews = data.map((item) => ({
    name: item.title || "Untitled",
    value: item.viewCount || 0,
  }));
  const chartInquiries = data.map((item) => ({
    name: item.title || "Untitled",
    value: item.inquiryCount || 0,
  }));

  return (
    <div className="row g-4">
      {/* Views Pie Chart */}
      <div className="col-md-6">
        <div className={`card shadow-sm p-4 h-100 ${styles.chartCard}`}>
          <h5 className={styles.chartTitle}>Most Viewed</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartViews}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                startAngle={90}
              >
                {chartViews.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend height={70} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inquiries Pie Chart */}
      <div className="col-md-6">
        <div className={`card shadow-sm p-4 h-100 ${styles.chartCard}`}>
          <h5 className={styles.chartTitle}>Most Inquired</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartInquiries}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartInquiries.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend height={70} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ Use shared BottomPagination */}
      <div className="col-12">
        <BottomPagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default AnalyticsChart;

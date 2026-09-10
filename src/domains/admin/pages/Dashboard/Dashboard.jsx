// pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import StatCard from "../../components/dashboard/StatCard/StatCard.jsx";
import PipelineFlow from "../../components/dashboard/PipelineFlow/PipelineFlow";
import styles from "./Dashboard.module.css";
import { fetchDashboardOverview } from "../../api/analytics.api.js";

const DONUT_COLORS = ["#06b6d4", "#8b5cf6", "#ec4899", "#3b82f6"];

// Static display metadata for each KPI — the live value/delta/sparkline
// come from the API and are merged in by key.
const KPI_META = [
  {
    key: "total_registered",
    label: "Total Registered",
    icon: "bi-person-plus",
    gradient: "cyan",
  },
  {
    key: "active_workers",
    label: "Active Workers",
    icon: "bi-person-check",
    gradient: "purple",
  },
  {
    key: "tickets_issued",
    label: "Tickets Issued",
    icon: "bi-ticket-perforated",
    gradient: "pink",
  },
  {
    key: "departed_30d",
    label: "Departed (30d)",
    icon: "bi-airplane",
    gradient: "blue",
  },
];

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
};

const Dashboard = () => {
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [kpis, setKpis] = useState([]);
  const [pipeline, setPipeline] = useState([]);
  const [trend, setTrend] = useState([]);
  const [offices, setOffices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activity, setActivity] = useState([]);

  const fetchDashboard = async () => {
    showLoader();

    try {
      const response = await fetchDashboardOverview();
      const data = response?.data || {};

      setKpis(
        KPI_META.map((meta) => ({
          ...meta,
          value: data.kpis?.[meta.key]?.value || 0,
          delta: data.kpis?.[meta.key]?.delta || 0,
          sparkline: data.kpis?.[meta.key]?.sparkline || [],
        })),
      );
      setPipeline(data.pipeline || []);
      setTrend(data.registration_trend || []);
      setOffices(data.office_distribution || []);
      setAgents(data.top_agents || []);
      setActivity(
        (data.recent_activity || []).map((item) => ({
          ...item,
          time: timeAgo(item.time),
        })),
      );
    } catch (err) {
      console.error("Failed to load dashboard", err);
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="dashboard-wraper">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Dashboard</h2>
        <p className="text-muted mb-0">
          Candidate pipeline performance and placement trends across offices.
        </p>
      </div>

      {/* KPI row */}
      <div className="row g-3 g-lg-4 mb-4">
        {kpis.map((kpi) => (
          <div className="col-xl-3 col-md-6 col-sm-12" key={kpi.key}>
            <StatCard {...kpi} />
          </div>
        ))}
      </div>

      {/* Signature: pipeline flow */}
      <div
        className={`card border-0 shadow-sm rounded-4 mb-4 ${styles.chartCard}`}
      >
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <h6 className="fw-bold text-dark mb-0">Candidate Pipeline</h6>
            <span className={styles.badgeMuted}>Live conversion by stage</span>
          </div>
          {pipeline.length > 0 ? (
            <PipelineFlow stages={pipeline} />
          ) : (
            <p className="text-muted mb-0">
              No worker statuses configured yet.
            </p>
          )}
        </div>
      </div>

      <div className="row g-3 g-lg-4 mb-4">
        {/* Registration trend */}
        <div className="col-lg-8 col-12">
          <div
            className={`card border-0 shadow-sm rounded-4 h-100 ${styles.chartCard}`}
          >
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold text-dark mb-0">Registration Trend</h6>
                <span className={styles.badgeMuted}>Last 12 months</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#06b6d4"
                        stopOpacity={0.35}
                      />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #eee",
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#trendFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Office distribution */}
        <div className="col-lg-4 col-12">
          <div
            className={`card border-0 shadow-sm rounded-4 h-100 ${styles.chartCard}`}
          >
            <div className="card-body">
              <h6 className="fw-bold text-dark mb-3">By Partner</h6>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={offices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {offices.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #eee",
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.legendList}>
                {offices.map((o, i) => (
                  <div className={styles.legendItem} key={o.name}>
                    <span
                      className={styles.legendDot}
                      style={{
                        background: DONUT_COLORS[i % DONUT_COLORS.length],
                      }}
                    />
                    <span className={styles.legendLabel}>{o.name}</span>
                    <span className={styles.legendValue}>{o.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 g-lg-4">
        {/* Top agents */}
        <div className="col-lg-6 col-12">
          <div
            className={`card border-0 shadow-sm rounded-4 h-100 ${styles.chartCard}`}
          >
            <div className="card-body">
              <h6 className="fw-bold text-dark mb-3">Top Agents</h6>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={agents} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#374151" }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #eee",
                      fontSize: 13,
                    }}
                  />
                  <Bar
                    dataKey="workers"
                    fill="#8b5cf6"
                    radius={[0, 6, 6, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="col-lg-6 col-12">
          <div
            className={`card border-0 shadow-sm rounded-4 h-100 ${styles.chartCard}`}
          >
            <div className="card-body">
              <h6 className="fw-bold text-dark mb-3">Recent Activity</h6>
              {activity.length > 0 ? (
                <ul className={styles.activityList}>
                  {activity.map((item) => (
                    <li className={styles.activityItem} key={item.id}>
                      <span className={styles.activityIcon}>
                        <i className={`bi ${item.icon}`} />
                      </span>
                      <div>
                        <div className={styles.activityMessage}>
                          {item.message}
                        </div>
                        <div className={styles.activityTime}>{item.time}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">No recent activity yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

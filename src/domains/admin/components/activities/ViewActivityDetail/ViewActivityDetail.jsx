import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import Badge from "../../../../../shared/components/Badge/Badge";
import { listLoginActivity } from "../../../api/activity.api";
import { getWorkerStatuses } from "../../../api/meta.api";

const formatDateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const diffValues = (oldVal, newVal) => {
  const parse = (v) => {
    if (!v) return {};
    if (typeof v === "string") {
      try {
        return JSON.parse(v);
      } catch {
        return {};
      }
    }
    return v;
  };

  const oldObj = parse(oldVal);
  const newObj = parse(newVal);
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  const changes = [];
  keys.forEach((key) => {
    const from = oldObj[key];
    const to = newObj[key];
    if (String(from ?? "") !== String(to ?? "")) {
      changes.push({ field: key, from: from ?? "—", to: to ?? "—" });
    }
  });

  return changes;
};

const parseValue = (v) => {
  if (!v) return {};
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return {};
    }
  }
  return v;
};

const formatFieldLabel = (key) =>
  key
    .replace(/_id$/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Any diff field ending in "_status_id" (embassy_status_id, lmis_status_id, etc.)
// is resolved through the shared /statuses lookup table instead of showing
// the raw numeric id.
const isStatusIdField = (field) => /_status_id$/i.test(field);

// Detects ISO date ("2026-06-13") or datetime ("2026-06-13T07:33:00.000Z")
// strings inside audit diffs and renders them in the same readable,
// 12-hour format used across the rest of the page.
const formatDiffValue = (value) => {
  if (value === null || value === undefined || value === "" || value === "—") {
    return "—";
  }

  const str = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      const hasTime = /T\d{2}:\d{2}/.test(str);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        ...(hasTime && { hour: "2-digit", minute: "2-digit", hour12: true }),
      });
    }
  }

  return str;
};

const ACTION_COLOR = {
  create: "green",
  update: "cyan",
  delete: "red",
  status_change: "gray",
};

// On create, only these fields are shown by default — everything else
// is available on the registration page.
const CREATE_SUMMARY_FIELDS = [
  "candidate_name",
  "passport_number",
  "labour_id",
];

const ViewActivityDetail = ({ activity, type }) => {
  const navigate = useNavigate();

  const isLogin = type === "login";
  const isSuccess = activity?.status === "success";
  const isCreate = activity?.action === "create";
  const changes =
    activity && !isLogin && !isCreate
      ? diffValues(activity.old_value, activity.new_value)
      : [];
  const createdFields =
    activity && !isLogin && isCreate
      ? Object.entries(parseValue(activity.new_value)).map(
          ([field, value]) => ({ field, value }),
        )
      : [];

  const createdSummaryFields = createdFields.filter((c) =>
    CREATE_SUMMARY_FIELDS.includes(c.field),
  );
  const createdExtraFields = createdFields.filter(
    (c) => !CREATE_SUMMARY_FIELDS.includes(c.field),
  );

  const [recentLogins, setRecentLogins] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);

  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    if (!activity || isLogin) return;

    // Only bother fetching if this diff (or, on create, the created snapshot)
    // actually touches a *_status_id field.
    const needsStatusLookup =
      changes.some((c) => isStatusIdField(c.field)) ||
      createdFields.some((c) => isStatusIdField(c.field));
    if (!needsStatusLookup) return;

    const fetchStatuses = async () => {
      try {
        const response = await getWorkerStatuses({ limit: 1000 });
        const map = {};
        (response?.data || []).forEach((s) => {
          map[s.id] = s.name || s.title || s.status_name || s.label;
        });
        setStatusMap(map);
      } catch {
        setStatusMap({});
      }
    };

    fetchStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity?.id, isLogin]);

  useEffect(() => {
    if (!activity || !isLogin || !activity.user_id) return;

    const fetchRecent = async () => {
      setLoadingRecent(true);
      try {
        const response = await listLoginActivity({
          user_id: activity.user_id,
          limit: 6, // fetch one extra to account for filtering out the current row
        });
        const others = (response?.data || []).filter(
          (r) => r.id !== activity.id,
        );
        setRecentLogins(others.slice(0, 5));
      } catch {
        setRecentLogins([]);
      } finally {
        setLoadingRecent(false);
      }
    };

    fetchRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity?.id]);

  if (!activity) return null;

  return (
    <div className="dashboard-wraper">
      <div className="mb-3">
        <BackButton onClick={() => navigate(-1)} />
      </div>

      {/* Hero card */}
      <div
        className="card border-0 rounded-4 shadow-sm mb-4 overflow-hidden"
        style={{
          background: isLogin
            ? isSuccess
              ? "linear-gradient(135deg, #e9fbf0 0%, #ffffff 60%)"
              : "linear-gradient(135deg, #fdeeee 0%, #ffffff 60%)"
            : "linear-gradient(135deg, #eef4fd 0%, #ffffff 60%)",
        }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <div className="d-flex gap-2 mb-3">
                {isLogin ? (
                  <>
                    <Badge
                      content={isSuccess ? "Success" : "Failed"}
                      color={isSuccess ? "green" : "red"}
                    />
                    {activity.role && (
                      <Badge content={activity.role} color="gray" />
                    )}
                  </>
                ) : (
                  <>
                    <Badge
                      content={activity.action}
                      color={ACTION_COLOR[activity.action] || "gray"}
                    />
                    <Badge content={activity.module} color="gray" />
                  </>
                )}
              </div>
              <h2 className="fw-bold text-dark mb-1">
                {isLogin
                  ? activity.full_name || activity.email_attempted || "Unknown"
                  : activity.message}
              </h2>
              <p className="text-muted mb-0">
                {formatDateTime(activity.created_at)}
              </p>
            </div>

            {isLogin && (
              <div className="text-md-end">
                <div className="text-muted small">
                  {[activity.city, activity.region, activity.country]
                    .filter(Boolean)
                    .join(", ") || "Unknown location"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border rounded-4 h-100">
            <div className="card-body p-4 overflow-auto">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                Details
              </h6>

              {isLogin ? (
                <>
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom">
                    <span className="text-muted">Email Attempted</span>
                    <span className="fw-semibold">
                      {activity.email_attempted || "—"}
                    </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom">
                    <span className="text-muted">IP Address</span>
                    <span className="fw-semibold">
                      {activity.ip_address || "—"}
                    </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom">
                    <span className="text-muted">Role</span>
                    <span className="fw-semibold text-capitalize">
                      {activity.role || "—"}
                    </span>
                  </div>
                  {!isSuccess && (
                    <div className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom">
                      <span className="text-muted">Failure Reason</span>
                      <span className="fw-semibold">
                        {activity.failure_reason || "—"}
                      </span>
                    </div>
                  )}
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom">
                    <span className="text-muted">Device</span>
                    <span className="fw-semibold">
                      {activity.device_name || "—"}
                    </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2">
                    <span className="text-muted">Login Time</span>
                    <span className="fw-semibold">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom">
                    <span className="text-muted">Staff</span>
                    <span className="fw-semibold">
                      {activity.actor_name || "—"}
                    </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom">
                    <span className="text-muted">Module</span>
                    <span className="fw-semibold text-capitalize">
                      {activity.module || "—"}
                    </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom">
                    <span className="text-muted">IP Address</span>
                    <span className="fw-semibold">
                      {activity.ip_address || "—"}
                    </span>
                  </div>
                  <div className="d-flex flex-column flex-md-row justify-content-md-between py-2">
                    <span className="text-muted">Date / Time</span>
                    <span className="fw-semibold">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="text-uppercase text-muted small fw-bold mb-3">
                {isLogin
                  ? "Recent Logins by This User"
                  : isCreate
                    ? "Record Details"
                    : "What Changed"}
              </h6>

              {isLogin ? (
                loadingRecent ? (
                  <p className="text-muted mb-0">Loading...</p>
                ) : recentLogins.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0 text-nowrap">
                      <thead>
                        <tr className="text-muted small text-uppercase">
                          <th>Date</th>
                          <th>Status</th>
                          <th>Location</th>
                          <th>Device</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLogins.map((r) => (
                          <tr key={r.id}>
                            <td className="text-muted">
                              {formatDateTime(r.created_at)}
                            </td>
                            <td>
                              <Badge
                                content={
                                  r.status === "success" ? "Success" : "Failed"
                                }
                                color={r.status === "success" ? "green" : "red"}
                              />
                            </td>
                            <td>
                              {[r.city, r.country].filter(Boolean).join(", ") ||
                                "Unknown"}
                            </td>
                            <td>{r.device_name || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted mb-0">
                    No previous login history for this user.
                  </p>
                )
              ) : isCreate ? (
                createdSummaryFields.length > 0 ? (
                  <>
                    {createdSummaryFields.map((c) => {
                      const isStatusId = isStatusIdField(c.field);
                      const display = isStatusId
                        ? statusMap[c.value] || formatDiffValue(c.value)
                        : formatDiffValue(c.value);
                      return (
                        <div
                          key={c.field}
                          className="d-flex flex-column flex-md-row justify-content-md-between py-2 border-bottom"
                        >
                          <span className="text-muted">
                            {formatFieldLabel(c.field)}
                          </span>
                          <span className="fw-semibold">{display}</span>
                        </div>
                      );
                    })}

                    {createdExtraFields.length > 0 && (
                      <Link
                        to="/admin/candidates"
                        className="btn btn-link btn-sm px-0 mt-2"
                      >
                        Check registration page for detail
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="text-muted mb-0">No details recorded.</p>
                )
              ) : changes.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle mb-0 text-nowrap">
                    <thead>
                      <tr className="text-muted small text-uppercase">
                        <th>Field</th>
                        <th>From</th>
                        <th>To</th>
                      </tr>
                    </thead>
                    <tbody>
                      {changes.map((c) => {
                        const isStatusId = isStatusIdField(c.field);
                        const fromDisplay = isStatusId
                          ? statusMap[c.from] || formatDiffValue(c.from)
                          : formatDiffValue(c.from);
                        const toDisplay = isStatusId
                          ? statusMap[c.to] || formatDiffValue(c.to)
                          : formatDiffValue(c.to);

                        return (
                          <tr key={c.field}>
                            <td className="fw-semibold">
                              {formatFieldLabel(c.field)}
                            </td>
                            <td className="text-muted">{fromDisplay}</td>
                            <td className="fw-semibold text-dark">
                              {toDisplay}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted mb-0">
                  No field-level changes recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewActivityDetail;

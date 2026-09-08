import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ViewActivityDetailComponent from "../../components/activities/ViewActivityDetail/ViewActivityDetail";
import { getLoginActivityById, getAuditLogById } from "../../api/activity.api";
import useResponse from "../../../../context/Response/useResponse";
import useNotifications from "../../../../context/Notification/useNotifications";

function ViewActivityDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { type, id } = useParams();
  const { addMessage } = useResponse();
  const { markAsReadByReference } = useNotifications();

  const [activity, setActivity] = useState(state?.activity || null);
  const [loading, setLoading] = useState(!state?.activity);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (state?.activity) return;

    if (!id || !type) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchActivity = async () => {
      setLoading(true);
      try {
        const response =
          type === "login"
            ? await getLoginActivityById(id)
            : await getAuditLogById(id);

        if (cancelled) return;

        const record = response?.data || response;
        if (!record) {
          setNotFound(true);
        } else {
          setActivity(record);
        }
      } catch (error) {
        if (!cancelled) {
          setNotFound(true);
          addMessage(false, error.message || "Failed to load activity");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchActivity();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  // Mark the corresponding notification read once we know which activity is
  // being viewed — covers arriving here from the bell dropdown, a list
  // page's view icon, or a direct URL, since all of them hit this route.
  useEffect(() => {
    if (!activity || !type || !id) return;
    markAsReadByReference(type, Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity, type, id]);

  if (loading) {
    return (
      <div className="dashboard-wraper">
        <p className="text-muted">Loading activity...</p>
      </div>
    );
  }

  if (notFound || !activity) {
    return (
      <div className="dashboard-wraper">
        <p className="text-muted">
          No activity selected.{" "}
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => navigate("/admin/activities")}
          >
            Back to Activities
          </button>
        </p>
      </div>
    );
  }

  return (
    <ViewActivityDetailComponent
      activity={activity}
      type={state?.type || type}
    />
  );
}

export default ViewActivityDetail;

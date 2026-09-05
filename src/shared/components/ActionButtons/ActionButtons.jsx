import React, { useEffect, useState } from "react";
import {
  FaFolderPlus,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
  FaUserSlash,
} from "react-icons/fa";
import { AiOutlineFolderView } from "react-icons/ai";
import ACTION_ROLE_CONFIG from "../../../config/btn.config";
import { getPermission } from "../../../domains/admin/api/permission.api";
import useProfile from "../../../context/Profile/useProfile";
import styles from "./ActionButtons.module.css";

let permissionsRequest = null;

const fetchOwnPermissions = (userId) => {
  if (!userId) return Promise.resolve(null);
  if (permissionsRequest?.userId === userId) {
    return permissionsRequest.promise;
  }
  const promise = getPermission(userId)
    .then((res) => (Array.isArray(res?.data) ? res.data[0] || null : null))
    .catch((err) => {
      console.error("Failed to fetch logged-in user's permissions:", err);
      return null;
    });
  permissionsRequest = { userId, promise };
  return promise;
};

// Action types that additionally require a specific permission on the
// logged-in user's own permissions record, on top of the role check below.
// Currently only "transaction" is gated this way — always against
// manage_finance — with no need for callers to pass anything extra.
const ACTION_PERMISSION_CONFIG = {
  transaction: "manage_finance",
};

const ActionButtons = ({ actions = [], row }) => {
  const { profile } = useProfile();
  const role = profile?.role_id;

  // Flat permissions record for the logged-in user (e.g.
  // { manage_finance: 0, manage_users: 1, ... }) — only fetched when at
  // least one action in this instance actually declares a `permission`.
  const [permissions, setPermissions] = useState(null);
  const needsPermissionCheck = actions.some(
    (a) => ACTION_PERMISSION_CONFIG[a.type],
  );

  useEffect(() => {
    if (!needsPermissionCheck || !profile?.id) return;
    let cancelled = false;
    fetchOwnPermissions(profile.id).then((data) => {
      if (!cancelled) setPermissions(data);
    });
    return () => {
      cancelled = true;
    };
  }, [needsPermissionCheck, profile?.id]);

  if (!role) return null;

  // Action config: styling, icon, title
  const ACTION_CONFIG = {
    view: {
      className: "btn-outline-info",
      icon: <i className="fa-solid fa-eye"></i>,
      title: "View",
    },
    edit: {
      className: "btn-outline-primary",
      icon: <i className="fa-solid fa-pen-to-square"></i>,
      title: "Edit",
    },
    delete: {
      className: "btn-outline-danger",
      icon: <i className="fa-solid fa-trash"></i>,
      title: "Delete",
    },
    archive: {
      className: "btn-outline-secondary",
      icon: <FaUserSlash />,
      title: "Archive",
    },
    restore: {
      className: "btn-outline-success",
      icon: <i className="fa-solid fa-rotate-left"></i>,
      title: "Restore",
    },
    addModule: {
      className: "btn-outline-info",
      icon: <FaFolderPlus />,
      title: "Add Module",
    },
    rename: {
      className: "btn-outline-secondary",
      icon: <i className="fa-solid fa-pen"></i>,
      title: "Rename",
    },
    download: {
      className: "btn-outline-info",
      icon: <i className="fa-solid fa-download"></i>,
      title: "Download",
    },
    viewModule: {
      className: "btn-outline-info",
      icon: <AiOutlineFolderView />,
      title: "View Module",
    },
    leftArrow: {
      className: "btn-outline-info",
      icon: <FaChevronLeft />,
      title: "Back",
    },
    rightArrow: {
      className: "btn-outline-info",
      icon: <FaChevronRight />,
      title: "Next",
    },
    notify: {
      className: "btn-outline-info",
      icon: <FaBell />,
      title: "Notify",
    },
    transaction: {
      className: "btn-outline-success",
      icon: <i className="fa-solid fa-wallet"></i>, // Or fa-money-bill-transfer
      title: "Record Transaction",
    },
    deleteBadge: {
      className: "btn p-0 d-flex align-items-center justify-content-center",
      icon: <span className={styles["delete-button"]}>&times;</span>,
      title: "Delete",
    },
    viewCV: {
      className: "btn-outline-info",
      icon: <i className="fa-solid fa-file-pdf"></i>,
      title: "View CV",
    },
    downloadVisa: {
      className: "btn-outline-dark",
      icon: <i className="fa-solid fa-passport"></i>,
      title: "Download Visa Application",
    },
    files: {
      className: "btn-outline-warning",
      icon: <i className="fa-solid fa-folder-open"></i>,
      title: "View Files",
    },
  };

  // Filter actions by role (ignore showOn) and, for action types listed in
  // ACTION_PERMISSION_CONFIG (currently just "transaction"), additionally
  // require the logged-in user to hold the mapped permission before the
  // button renders — same idea as the role gate above, just keyed off a
  // fixed action-type -> permission map instead of a per-call-site field.
  const allowedActions = actions.filter((actionObj) => {
    // Custom render type doesn't need role or permission checks
    if (actionObj.type === "custom" && actionObj.render) {
      return true;
    }

    const hasRoleAccess =
      actionObj.type &&
      ACTION_CONFIG[actionObj.type] &&
      (ACTION_ROLE_CONFIG[actionObj.type]?.includes(role) ||
        actionObj.bypassRole === true);

    if (!hasRoleAccess) return false;

    const requiredPermission = ACTION_PERMISSION_CONFIG[actionObj.type];
    if (requiredPermission) {
      return Number(permissions?.[requiredPermission]) === 1;
    }

    return true;
  });

  return (
    <div className="d-flex gap-2 justify-content-start">
      {allowedActions.map((actionObj, index) => {
        // Handle custom render type (for ApplicantReportGenerator)
        if (actionObj.type === "custom" && actionObj.render) {
          return (
            <div key={`custom-${index}`} className="d-inline-block">
              {actionObj.render(row)}
            </div>
          );
        }

        // Existing: Handle standard button actions
        const { type, onClick, disabled } = actionObj;
        const config = ACTION_CONFIG[type];

        return (
          <button
            key={type}
            className={`btn btn-sm ${config.className}`}
            onClick={() => onClick?.(row)}
            title={config.title}
            aria-label={config.title}
            disabled={disabled || config.disabled}
          >
            {config.icon}
          </button>
        );
      })}
    </div>
  );
};

export default ActionButtons;

import React from "react";
import {
  FaFolderPlus,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
} from "react-icons/fa";
import { AiOutlineFolderView } from "react-icons/ai";
import ACTION_ROLE_CONFIG from "../../../config/btn.config";
import useProfile from "../../../context/Profile/useProfile";
import styles from "./ActionButtons.module.css";

const ActionButtons = ({ actions = [], row }) => {
  const { profile } = useProfile();
  const role = profile?.role_id;

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
      className: "btn-outline-warning",
      icon: <i className="fa-solid fa-folder-open"></i>,
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
    files: {
      className: "btn-outline-info",
      icon: <i className="bi-folder2-open"></i>,
      title: "View Files",
    },
  };

  // Filter actions by role only (ignore showOn)
  const allowedActions = actions.filter(
    (actionObj) =>
      actionObj.type &&
      ACTION_CONFIG[actionObj.type] &&
      (ACTION_ROLE_CONFIG[actionObj.type]?.includes(role) ||
        actionObj.bypassRole === true),
  );

  return (
    <div className="d-flex gap-2 justify-content-start">
      {allowedActions.map((actionObj) => {
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

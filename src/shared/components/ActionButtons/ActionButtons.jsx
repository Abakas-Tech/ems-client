import { FaFolderPlus, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AiOutlineFolderView } from "react-icons/ai";

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
    icon: <FaFolderPlus/>,
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
    icon: <AiOutlineFolderView/>,
    title: "View Module",
  },
  leftArrow: {
    className: "btn-outline-info",
    icon: <FaChevronLeft />,
    title: "Back",
  },
  rightArrow: {
    className: "btn-outline-info",
    icon:<FaChevronRight />,
    title: "Next",
  },
  
};

const ActionButtons = ({ actions = [], row }) => {
  return (
    <div className="d-flex gap-2 justify-content-start">
      {actions.map((action) => {
        const config = ACTION_CONFIG[action.type];
        if (!config) return null;

        if (action.show && !action.show(row)) return null;

        return (
          <button
            key={action.type}
            className={`btn btn-sm ${config.className}`}
            onClick={() => action.onClick(row)}
            title={config.title}
            aria-label={config.title}
            disabled={action.disabled}
          >
            {config.icon}
          </button>
        );
      })}
    </div>
  );
};

export default ActionButtons;

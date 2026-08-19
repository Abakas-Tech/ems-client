import ROLES from "./role.config";
import PERMISSIONS from "./permission.config";

const MENU_CONFIG = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "bi-speedometer2",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_ANALYTICS,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: "bi bi-people",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_USERS,
  },
  {
    label: "Employees",
    path: "/admin/employees",
    icon: "bi bi-person-check",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_WORKERS,
  },
  {
    label: "Employee Modules",
    path: "/admin/employee/modules",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_WORKERS,
    isHidden: true,
  },
  {
    label: "Autofill",
    path: "/admin/autofill",
    icon: "bi bi-ui-checks",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_WORKERS,
  },
  {
    label: "Tickets",
    path: "/admin/tickets",
    icon: "bi bi-ticket-detailed",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_WORKERS,
  },
  {
    label: "Finance",
    path: "/admin/finances",
    icon: "bi bi-wallet-fill",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_FINANCE,
  },
  {
    label: "Status",
    path: "/admin/meta-data/employee-status",
    icon: "bi bi-database-add",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },


  {
    label: "External Links",
    path: "/admin/external-links",
    icon: "bi bi-link-45deg",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Complaints",
    path: "/admin/complaints",
    icon: "bi bi-exclamation-triangle",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_COMPLAINT,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: "bi-gear",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },


  // Partner Menus

  {
    label: "Active Employees",
    path: "/partner/active-employees",
    icon: "bi bi-people",
    roles: [ROLES.PARTNER],
  },

  {
    label: "File Manager",
    path: "/partner/files",
    icon: "bi bi-folder2-open",
    roles: [ROLES.PARTNER],
    isHidden: true,
  },

  {
    label: "Notifications",
    path: "/partner/notifications",
    icon: "bi bi-bell",
    roles: [ROLES.PARTNER],
  },

  {
    label: "Settings",
    path: "/partner/settings",
    icon: "bi-gear",
    roles: [ROLES.PARTNER],
  },


  // Common menu

  {
    label: "Log Out",
    path: "#",
    icon: "bi bi-power",
    isLogout: true,
    roles: [
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
      ROLES.PARTNER,
    ],
  },
];

export default MENU_CONFIG;

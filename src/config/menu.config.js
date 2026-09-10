import ROLES from "./role.config";

const MENU_CONFIG = [
  {
    label: "Stock Dashboard",
    path: "/admin/stock/dashboard",
    icon: "bi bi-clipboard2-pulse",
    roles: [ROLES.ADMIN],
  },
  {
    label: "Import Orders",
    path: "/admin/stock/orders",
    icon: "bi bi-box-seam",
    roles: [ROLES.ADMIN],
  },
  {
    label: "Inventory",
    path: "/admin/stock/inventory",
    icon: "bi bi-boxes",
    roles: [ROLES.ADMIN],
  },
  {
    label: "Sales & Delivery",
    path: "/admin/stock/sales",
    icon: "bi bi-truck",
    roles: [ROLES.ADMIN, ROLES.SALES_REP],
  },
  {
    label: "Cash & Credit",
    path: "/admin/stock/cash-credit",
    icon: "bi bi-cash-coin",
    roles: [ROLES.ADMIN],
  },
  {
    label: "Stock Reports",
    path: "/admin/stock/reports",
    icon: "bi bi-bar-chart-line",
    roles: [ROLES.ADMIN],
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: "bi bi-people",
    roles: [ROLES.ADMIN],
  },
  {
    label: "My Profile",
    path: "/admin/my-profile",
    icon: "bi bi-person-bounding-box",
    roles: [ROLES.ADMIN, ROLES.SALES_REP],
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: "bi-gear",
    roles: [ROLES.ADMIN, ROLES.SALES_REP],
  },

  // Common menu

  {
    label: "Log Out",
    path: "#",
    icon: "bi bi-power",
    isLogout: true,
    roles: [ROLES.ADMIN, ROLES.SALES_REP],
  },
];

export default MENU_CONFIG;

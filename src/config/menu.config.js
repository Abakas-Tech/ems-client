import ROLES from "./role.config";

const MENU_CONFIG = [
  {
    label: "Stock Dashboard",
    path: "/admin/stock/dashboard",
    icon: "bi bi-clipboard2-pulse",
    roles: [ROLES.ADMIN],
  },
  {
    label: "Directory",
    path: "/admin/stock/directory",
    icon: "bi bi-diagram-3",
    roles: [ROLES.ADMIN],
  },
  // Reachable only via the Directory cards, not shown in the sidebar -
  // still need an entry here or ProtectedRoute treats them as undefined
  // routes and bounces back to the dashboard.
  {
    label: "Suppliers",
    path: "/admin/stock/suppliers",
    icon: "bi bi-building",
    roles: [ROLES.ADMIN],
    isHidden: true,
  },
  {
    label: "Pharmacies",
    path: "/admin/stock/pharmacies",
    icon: "bi bi-hospital",
    roles: [ROLES.ADMIN],
    isHidden: true,
  },
  {
    label: "Sales Team",
    path: "/admin/stock/sales-reps",
    icon: "bi bi-person-badge",
    roles: [ROLES.ADMIN],
    isHidden: true,
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
    label: "Account",
    path: "/admin/account",
    icon: "bi bi-person-circle",
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

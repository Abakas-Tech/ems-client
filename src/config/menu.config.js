import ROLES  from "./role.config";

const MENU_CONFIG = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "bi-speedometer2",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "My Profile",
    path: "/admin/my-profile",
    icon: "bi bi-person-bounding-box",
    roles: [
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
      ROLES.PARTNER,
      ROLES.WORKER,
      ROLES.EMPLOYER,
    ],
  },
  {
    label: "User Management",
    path: "/admin/user-management",
    icon: "bi bi-people",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Workers",
    path: "/admin/workers",
    icon: "bi bi-file-earmark-person-fill",
    roles: [
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
      ROLES.PARTNER,
      ROLES.EMPLOYER,
      ROLES.WORKER,

    ],
  },
  {
    label: "Finance",
    path: "/admin/finances",
    icon: "bi bi-wallet",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Files",
    path: "/admin/my-files",
    icon: "bi bi-files",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Meta Data",
    path: "/admin/meta-data",
    icon: "bi bi-database-add",
    roles: [ROLES.ADMIN],
  },
  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: "bi bi-bell",
    roles: [
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
      ROLES.PARTNER,
      ROLES.WORKER,
      ROLES.EMPLOYER,
    ],
  },
  {
    label: "Public Content",
    path: "/admin/public-content",
    icon: "bi bi-layout-text-sidebar-reverse",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: "bi-gear",
    roles: [
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
      ROLES.PARTNER,
      ROLES.WORKER,
      ROLES.EMPLOYER,
    ],
  },
  {
    label: "Log Out",
    path: "#",
    icon: "bi bi-power",
    isLogout: true,
    roles: [
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
      ROLES.PARTNER,
      ROLES.WORKER,
      ROLES.EMPLOYER,
    ],
  },
];

export default MENU_CONFIG;

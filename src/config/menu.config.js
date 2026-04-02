import ROLES from "./role.config";
import PERMISSIONS from "./permission.config";

const MENU_CONFIG = [
  {
    label: "Home",
    icon: "bi bi-globe",
    path: "/",
    roles: [
      ROLES.EMPLOYER,
      ROLES.ADMIN,
      ROLES.EMPLOYEE,
      ROLES.WORKER,
      ROLES.PARTNER,
    ],
  },

  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: "bi-speedometer2",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_ANALYTICS,
  },
  {
    label: "My Profile",
    path: "/admin/my-profile",
    icon: "bi bi-person-bounding-box",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "User Management",
    path: "/admin/user-management",
    icon: "bi bi-people",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_USERS,
  },
  {
    label: "Workers",
    path: "/admin/workers",
    icon: "bi bi-person-check",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_WORKERS,
  },
  {
    label: "Finance",
    path: "/admin/finances",
    icon: "bi bi-wallet",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
    permission: PERMISSIONS.MANAGE_FINANCE,
  },
  {
    label: "File Manager",
    path: "/admin/files",
    icon: "bi bi-files",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Meta Data",
    path: "/admin/meta-data",
    icon: "bi bi-database-add",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: "bi bi-bell",
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
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
    roles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },

  // Worker Menus

  {
    label: "My Profile",
    path: "/worker/my-profile",
    icon: "bi bi-person-bounding-box",
    roles: [ROLES.WORKER],
  },
  {
    label: "My Application",
    path: "/worker/my-application",
    icon: "bi bi-person-vcard-fill",
    roles: [ROLES.WORKER],
  },
  {
    label: "My CV",
    path: `/worker/my-cv`,
    icon: "bi bi-file-earmark-text",
    roles: [ROLES.WORKER],
  },
  {
    label: "Notifications",
    path: "/worker/notifications",
    icon: "bi bi-bell",
    roles: [ROLES.WORKER],
  },

  // Partner Menus

  {
    label: "My Profile",
    path: "/partner/my-profile",
    icon: "bi bi-person-bounding-box",
    roles: [ROLES.PARTNER],
  },

  {
    label: "Active Workers",
    path: "/partner/active-workers",
    icon: "bi bi-people",
    roles: [ROLES.PARTNER],
  },

  {
    label: "File Manager",
    path: "/partner/files",
    icon: "bi bi-files",
    roles: [ROLES.PARTNER],
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

  // Employer Menus

  {
    label: "My Profile",
    path: "/employer/my-profile",
    icon: "bi bi-person-bounding-box",
    roles: [ROLES.EMPLOYER],
  },

  {
    label: "My Workers",
    path: "/employer/my-workers",
    icon: "bi bi-person-gear",
    roles: [ROLES.EMPLOYER],
  },

  {
    label: "Notifications",
    path: "/employer/notifications",
    icon: "bi bi-bell",
    roles: [ROLES.EMPLOYER],
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
      ROLES.WORKER,
      ROLES.EMPLOYER,
    ],
  },
];

export default MENU_CONFIG;

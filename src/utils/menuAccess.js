import MENU_CONFIG from "../config/menu.config";
import ROLES from "../config/role.config";

// Same access rules the Sidebar and ProtectedRoute apply to MENU_CONFIG:
// the user's role must be listed on the item, and staff (Employee role)
// additionally need the item's permission switched on. Admins and partners
// are only checked by role.
export const canAccessMenuItem = (user, item) => {
  const roleId = Number(user?.role_id);
  if (!item || !roleId) return false;
  if (item.roles && !item.roles.includes(roleId)) return false;

  if (roleId === ROLES.EMPLOYEE && item.permission) {
    return Number(user?.permissions?.[item.permission]) === 1;
  }
  return true;
};

// True when the user can open the page at `path` (a MENU_CONFIG path such
// as "/admin/finances"). Paths that are not in the menu are never granted.
export const canAccessMenuPath = (user, path) =>
  MENU_CONFIG.some(
    (item) => item.path === path && canAccessMenuItem(user, item),
  );

// Rule object used by documentation/help content:
//   { paths: [...] }      user must reach at least one of these menu pages
//   { allPaths: [...] }   user must reach every one of these menu pages
//   { roles: [...] }      user's role must be listed
//   { permission: "x" }   staff must hold this permission (admins always do)
export const matchesAccessRule = (user, rule = {}) => {
  const roleId = Number(user?.role_id);
  if (!roleId) return false;
  if (rule.roles && !rule.roles.includes(roleId)) return false;
  if (rule.paths && !rule.paths.some((p) => canAccessMenuPath(user, p))) {
    return false;
  }
  if (rule.allPaths && !rule.allPaths.every((p) => canAccessMenuPath(user, p))) {
    return false;
  }
  if (rule.permission && roleId === ROLES.EMPLOYEE) {
    return Number(user?.permissions?.[rule.permission]) === 1;
  }
  return true;
};

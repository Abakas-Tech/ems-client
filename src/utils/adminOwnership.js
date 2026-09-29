import { useEffect, useState } from "react";
import { axiosInstance } from "./axios";
import useProfile from "../context/Profile/useProfile";

// Admin record ownership (enforced by the server; this only decides which
// buttons to show). Every admin has their own user id, and records keep the
// id of the user who created them. An admin can edit/delete a record when
// they created it, when it has no known creator (older records), or when
// it was created by a non-admin (e.g. staff). Records created by ANOTHER
// admin are view-only for them. Staff are not affected.

export const NOT_OWNER_MESSAGE =
  "This record was created by another admin. Only the admin who created it can edit or delete it.";

let adminIdsRequest = null;

const loadAdminIds = () => {
  if (!adminIdsRequest) {
    adminIdsRequest = axiosInstance
      .get("/users/admin-ids")
      .then((res) => new Set((res.data?.data || []).map(Number)))
      .catch(() => {
        adminIdsRequest = null; // retry next time
        return null;
      });
  }
  return adminIdsRequest;
};

export const useAdminOwnership = () => {
  const { profile } = useProfile();
  const isAdmin = Number(profile?.role_id) === 1;
  const [adminIds, setAdminIds] = useState(null);

  useEffect(() => {
    if (!isAdmin) return undefined;
    let cancelled = false;
    loadAdminIds().then((ids) => {
      if (!cancelled && ids) setAdminIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  // true when the logged-in user may edit/delete a record created by
  // `createdBy` (a user id, or null/undefined when unknown)
  const canModify = (createdBy) => {
    if (!isAdmin) return true;
    if (createdBy === null || createdBy === undefined || createdBy === "") {
      return true;
    }
    if (Number(createdBy) === Number(profile?.id)) return true;
    // Until the admin list is known, keep other users' records locked
    if (!adminIds) return false;
    return !adminIds.has(Number(createdBy));
  };

  return { canModify, isAdmin };
};

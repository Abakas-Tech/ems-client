import Profile from "../../components/Profile/Profile";
import OrganizationSettings from "../../components/OrganizationSettings/OrganizationSettings";
import useProfile from "../../../../context/Profile/useProfile";

function ChangePasswordPage() {
  const { profile } = useProfile();

  // Organization Settings (stamp & signature) are Admin only (role_id 1)
  const isAdmin = Number(profile?.role_id) === 1;

  return (
    <>
      <Profile />
      {isAdmin && <OrganizationSettings />}
    </>
  );
}

export default ChangePasswordPage;

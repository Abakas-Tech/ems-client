import { useEffect, useState } from "react";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import useProfile from "../../../../context/Profile/useProfile";
import { updateProfile } from "../../api/profile.api";
import { changePassword } from "../../api/auth.api";
import PasswordInput from "../../../../shared/components/PasswordInput/PasswordInput";
import "../Stock/stock-theme.css";

const Account = () => {
  const { profile, fetchProfile } = useProfile();
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const response = await updateProfile(profileData);
      addMessage(response?.success, response?.message || "Profile updated");
      await fetchProfile();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      addMessage(false, "All password fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      addMessage(false, "New password and confirmation do not match");
      return;
    }

    showLoader();
    try {
      const response = await changePassword({
        current_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      addMessage(response?.success, response?.message || "Password changed");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="stock-app">
      <h2 className="fw-bold mb-1">My Account</h2>
      <p className="text-muted mb-4">
        Manage your profile details and account password.
      </p>

      <div className="stock-card p-3 mb-4">
        <h5 className="fw-semibold mb-3">Profile Information</h5>
        <form onSubmit={handleProfileSubmit} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              name="full_name"
              value={profileData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-control"
              name="phone_number"
              value={profileData.phone_number}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="stock-card p-3">
        <h5 className="fw-semibold mb-3">Change Password</h5>
        <form onSubmit={handlePasswordSubmit} className="row g-3">
          <div className="col-md-4">
            <PasswordInput
              label="Old Password"
              id="oldPassword"
              value={oldPassword}
              onChange={setOldPassword}
              required
              variant="standard"
            />
          </div>
          <div className="col-md-4">
            <PasswordInput
              label="New Password"
              id="newPassword"
              value={newPassword}
              onChange={setNewPassword}
              required
              variant="standard"
            />
          </div>
          <div className="col-md-4">
            <PasswordInput
              label="Confirm Password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              variant="standard"
            />
          </div>
          <div className="col-12">
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Account;

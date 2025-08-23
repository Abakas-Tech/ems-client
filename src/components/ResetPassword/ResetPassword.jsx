import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/admin/auth.api";
import useLoader from "../../context/Loader/useLoader";
import useResponse from "../../context/response/UseResponse";
import logo from "../../assets/img/logo.svg";

const ResetPassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();

  const validateFields = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      addMessage("error", "All fields are required.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      addMessage("error", "Passwords do not match.");
      return false;
    }
    if (newPassword.length < 8) {
      addMessage("error", "New password must be at least 8 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    showLoader();
    try {
      const response = await resetPassword({ oldPassword, newPassword });
      addMessage("success", response.message || "Password reset successful!");
      navigate("/admin/profile");
    } catch (error) {
      addMessage("error", error.message || "Reset failed.");
    } finally {
      hideLoader();
    }
  };

  return (
    <div
      className="login-page d-flex justify-content-center align-items-center rounded"
      style={{ minHeight: "80vh" }}
    >
      <div
        className="login-container p-4 rounded shadow-lg my-4"
        style={{ maxWidth: "500px", width: "100%", minHeight: "400px" }}
      >
        <h1 className="text-center mb-3 fw-bolder pt-0">Reset Password</h1>
        <img src={logo} className="mx-auto d-block mb-4 img-fluid" />
        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="oldPassword"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
            <label htmlFor="oldPassword">Old Password</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="newPassword"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <label htmlFor="newPassword">New Password</label>
          </div>
          <div className="form-floating mb-3">
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <label htmlFor="confirmPassword">Confirm New Password</label>
          </div>
          <button
            type="submit"
            className="btn btn-main fw-medium w-100 rounded-2"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

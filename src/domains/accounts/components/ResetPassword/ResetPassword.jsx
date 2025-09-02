import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetPassword } from "../../api/auth.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import logo from "../../../../assets/img/logo.svg";
import PasswordInput from "../../../../shared/components/PasswordInput/PasswordInput";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from query params
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const validateFields = () => {
    if (!newPassword || !confirmPassword) {
      addMessage("error", "All fields are required.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      addMessage("error", "Passwords do not match.");
      return false;
    }
    if (newPassword.length < 8) {
      addMessage("error", "Password must be at least 8 characters.");
      return false;
    }
    if (!token) {
      addMessage("error", "Invalid or missing reset token.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    showLoader();
    try {
      const response = await resetPassword({ token, newPassword });
      addMessage("success", response.message || "Password reset successful!");
      navigate("/auth/login");
    } catch (error) {
      addMessage("error", error.message);
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
        style={{ maxWidth: "500px", width: "90%", minHeight: "400px" }}
      >
        <h2 className="text-center mb-3 fw-bold pt-0">Reset Password</h2>
        <img src={logo} className="mx-auto d-block mb-4 img-fluid" alt="logo" />

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-floating mb-3">
            <PasswordInput
              id="newPassword"
              label="New Password"
              icon_input={true}
              value={newPassword}
              onChange={setNewPassword}
              required
              align="right"
              variant="floating"
            />
          </div>

          {/* Confirm Password */}
          <div className="form-floating mb-3">
            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              icon_input={true}
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
              align="right"
              variant="floating"
            />
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

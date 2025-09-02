import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../../accounts/api/auth.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import PasswordInput from "../../../../shared/components/PasswordInput/PasswordInput";
const ChangePassword = () => {
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
      const response = await changePassword({ oldPassword, newPassword });
      if (response.status === "success") {
        addMessage(
          "success",
          response.message || "Password changed successfully!"
        );
        navigate("/admin/my-profile");
      } else {
        addMessage("error", response.message || "Change failed.");
      }
    } catch (error) {
      addMessage("error", error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <div>
          <h2 className="fw-bold text-dark mb-2 d-flex align-items-center">
            Change Your Password
          </h2>
          <p className="text-muted ">
            Update your account password regularly to keep your information
            secure.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="submit-section">
            <div className="row">
              {/* Old Password */}
              <div className="form-group col-lg-12 col-md-6 mb-3">
                <PasswordInput
                  label="Old Password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={setOldPassword}
                  required
                  align="right"
                  variant="standard"
                />
              </div>

              {/* New Password */}
              <div className="form-group col-md-6 mb-3">
                <PasswordInput
                  label="New Password"
                  id="newPassword"
                  value={newPassword}
                  onChange={setNewPassword}
                  required
                  align="right"
                  variant="standard"
                />
              </div>

              {/* Confirm Password */}
              <div className="form-group col-md-6 mb-3">
                <PasswordInput
                  label="Confirm Password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  required
                  align="right"
                  variant="standard"
                />
              </div>

              {/* Submit Button */}
              <div className="form-group col-lg-12 col-md-12 text-start">
                <button type="submit" className="btn btn-main px-5 rounded">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

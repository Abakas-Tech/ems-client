import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/admin/auth.api";
import useLoader from "../../context/Loader/useLoader";
import useResponse from "../../context/response/UseResponse";

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
        navigate("/admin/profile");
      } else {
        addMessage("error", response.message || "Change failed.");
      }
    } catch (error) {
      addMessage("error", error.message || "Change failed.");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="col-lg-9 col-md-12">
      <div className="dashboard-wraper">
        <div className="form-submit">
          <h4>Change Your Password</h4>
          <form onSubmit={handleSubmit}>
            <div className="submit-section">
              <div className="row">
                {/* Old Password */}
                <div className="form-group col-lg-12 col-md-6 mb-3">
                  <label>Old Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>

                {/* New Password */}
                <div className="form-group col-md-6 mb-3">
                  <label>New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="form-group col-md-6 mb-3">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
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
    </div>
  );
};

export default ChangePassword;

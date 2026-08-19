import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../../api/auth.api";
import useloader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import useProfile from "../../../../context/Profile/useProfile";
import { useDelete } from "../../../../context/Delete/useDelete";
import { updateProfile } from "../../api/profile.api";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "../../api/profilePhoto.api";
import PasswordInput from "../../../../shared/components/PasswordInput/PasswordInput";
// import { useDemoInfo } from "./../../../../context/Demo/useDemoInfo";

const Profile = () => {
  // Profile
  const { profile, fetchProfile } = useProfile();

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    national_id: "",
  });

  const fileInputRef = useRef(null);

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Change password

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSubmitLoading, setPasswordSubmitLoading] = useState(false);

  const navigate = useNavigate();

  // const { openModal } = useDemoInfo();

  // Initial fetch on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        await fetchProfile();
      } catch {
        console.error("Failed to fetch profile data.");
      }
    };

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update local state whenever profile changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile?.full_name || "",
        email: profile?.email || "",
        phone_number: profile?.phone_number || "",
        national_id: profile?.national_id || "",
      });
    }
  }, [profile]);

  // Profile functions

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteAvatar = async () => {
    openModal(
      async () => {
        showLoader();

        try {
          const response = await deleteProfilePhoto();

          addMessage(response?.success, response?.message);

          await fetchProfile();
        } catch (err) {
          addMessage(false, err.message);
        } finally {
          hideLoader();
        }
      },
      {
        title: "Do you want to delete your profile photo?",
        confirmText: "Delete",
      },
    );
  };

  // Role helper (loose equality so it works whether role_id is a number or a string)
  const isEmployer = profile?.role_id == 5;

  const validateProfileFields = () => {
    const { full_name, email, phone_number, national_id } = profileData;

    const name = full_name?.trim();
    const mail = email?.trim();
    const phone = phone_number?.trim();
    const nationalId = national_id?.trim();

    if (!name) return addMessage(false, "Full name is required.");

    if (!/^[A-Za-z\s]+$/.test(name))
      return addMessage(false, "Full name must contain letters only.");

    if (name.length < 2 || name.length > 50)
      return addMessage(
        false,
        "Full name must be between 2 and 50 characters.",
      );

    if (profile?.role_id != 4 && profile?.role_id != 5) {
      if (!mail) return addMessage(false, "Email is required.");

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(mail))
        return addMessage(false, "Please enter a valid email address.");
    }

    // National ID is required only for Employer (role_id 5)
    if (isEmployer) {
      if (!nationalId) return addMessage(false, "National ID is required.");
    }

    if (!phone) return addMessage(false, "Phone number is required.");

    const phoneRegex =
      /^(?:\+?(251|254|974|966|971)[0-9]{7,12}|0[179][0-9]{8}|251[79][0-9]{8})$/;

    if (!phoneRegex.test(phone))
      return addMessage(false, "Phone number is invalid.");

    if (phone.length < 8 || phone.length > 15)
      return addMessage(false, "Phone number must be between 7 and 15 digits.");

    return true;
  };

  const profilePhoto = profile?.profile_photo_url;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfileFields()) return;

    const payload = { ...profileData };

    if (profile?.role_id == 4 || profile?.role_id == 5) {
      delete payload.email;
    }

    if (!isEmployer) {
      delete payload.national_id;
    }

    setSubmitLoading(true);
    showLoader();

    try {
      if (selectedFile) {
        try {
          await uploadProfilePhoto(selectedFile);
        } catch (err) {
          addMessage(false, "Failed to upload profile photo: " + err.message);
        }
      }

      try {
        const response = await updateProfile(payload);

        addMessage(
          response?.success,
          response?.message || "Profile updated successfully!",
        );

        await fetchProfile();
      } catch (err) {
        addMessage(false, "Failed to update profile: " + err.message);
      }
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      setSubmitLoading(false);
      hideLoader();
    }
  };

  // Change password functions

  const validatePasswordFields = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      addMessage(false, "All fields are required.");
      return false;
    }

    if (oldPassword.length < 8) {
      addMessage(false, "Old password must be at least 8 characters.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      addMessage(false, "Passwords do not match.");
      return false;
    }

    if (newPassword.length < 8) {
      addMessage(false, "New password must be at least 8 characters.");
      return false;
    }

    return true;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordFields()) return;

    setPasswordSubmitLoading(true);
    showLoader();

    try {
      const response = await changePassword({
        current_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (response.success) {
        addMessage(response.success, response.message);
        navigate("/admin/my-profile");
      } else {
        addMessage(response.success, response.message);
      }
    } catch (error) {
      addMessage(false, error.message);
    } finally {
      setPasswordSubmitLoading(false);
      hideLoader();
    }

    // Instead of API call, show demo modal
    // openModal("changePassword");
  };

  return (
    <div className="dashboard-wraper">
      {/* Profile section */}
      <div className="form-submit">
        <h2 className="fw-bold text-dark mb-2">My Profile</h2>

        <p className="text-muted">Update your profile details.</p>

        <form onSubmit={handleProfileSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label>Profile Image</label>

              <div className="input-group">
                <input
                  type="file"
                  className="form-control w-75 pt-3 px-3"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />

                {profilePhoto && (
                  <button
                    className="form-control btn border-0 pt-3"
                    type="button"
                    onClick={handleDeleteAvatar}
                    title="Delete Image"
                  >
                    <i className="bi bi-trash text-danger"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <label>
                Full Name <span className="text-danger">*</span>
              </label>

              <input
                type="text"
                className="form-control"
                name="full_name"
                required
                value={profileData.full_name}
                onChange={handleChange}
              />
            </div>

            {profile?.role_id != 5 && profile?.role_id != 4 && (
              <div className="col-md-6">
                <label>
                  Email <span className="text-danger">*</span>
                </label>

                <input
                  type="email"
                  className="form-control"
                  name="email"
                  required
                  value={profileData.email}
                  onChange={handleChange}
                />
              </div>
            )}

            {isEmployer && (
              <div className="col-md-6">
                <label>
                  National ID <span className="text-danger">*</span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  name="national_id"
                  required
                  value={profileData.national_id}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="col-md-6">
              <label>
                Phone Number <span className="text-danger">*</span>
              </label>

              <input
                type="text"
                className="form-control"
                name="phone_number"
                required
                value={profileData.phone_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="btn btn-main px-4"
              disabled={submitLoading}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/*Change password section */}
      <div className="form-submit mt-2 pt-2">
        <div>
          <h3 className="fw-bold text-dark mb-2 d-flex align-items-center">
            Change Your Password
          </h3>

          <p className="text-muted">
            Update your account password regularly to keep your information
            secure.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit}>
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

              {/* Change Password Button */}
              <div className="form-group col-lg-12 col-md-12 text-start">
                <button
                  type="submit"
                  className="btn btn-main px-4 rounded"
                  disabled={passwordSubmitLoading}
                >
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

export default Profile;

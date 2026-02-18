import React, { useState, useEffect, useRef } from "react";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useProfile } from "../../../../context/Profile/ProfileProvider";
import { updateProfile } from "../../api/profile.api";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "../../api/profilePhoto.api";
import { useConfirmDelete } from "../../../../context/Delete/UseDelete";

const MyProfile = () => {
  const { profile, fetchProfile } = useProfile();
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    country: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const fileInputRef = useRef(null);

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useConfirmDelete();

  // Prefill form
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        country: profile.id === 4 ? profile.country || "" : "",
      });
      setAvatarPreview(profile.profile_photo_url || null);
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Form input handler =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // ===== Avatar upload =====
  const handleAvatarChange = async (file) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setShowAvatarMenu(false);

    showLoader();
    try {
      const response = await uploadProfilePhoto(file);
      addMessage(response?.success, response?.message);
      await fetchProfile();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  // ===== Avatar delete =====
  const handleDeleteAvatar = () => {
    openModal(async () => {
      showLoader();
      try {
        const response = await deleteProfilePhoto();
        addMessage(response?.success, response?.message);
        setAvatarPreview(null);
        setShowAvatarMenu(false);
        await fetchProfile();
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  const handleFileClick = () => fileInputRef.current.click();

  // ===== Custom Validation =====
  const validateFields = () => {
    const { full_name, email, phone_number, country } = profileData;

    if (!full_name) {
      addMessage(false, "Full name is required.");
      return false;
    }

    if (!email) {
      addMessage(false, "Email is required.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      addMessage(false, "Please enter a valid email address.");
      return false;
    }

    if (!phone_number) {
      addMessage(false, "Phone number is required.");
      return false;
    }

    if (phone_number.length < 7 || phone_number.length > 20) {
      addMessage(false, "invalid Phone number");
      return false;
    }

    if (profile.id === 4 && !country) {
      addMessage(false, "Country is required for this user.");
      return false;
    }

    return true;
  };

  // ===== Submit handler =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    // Prepare API payload
    const payload = { ...profileData };
    if (profile.id !== 4) delete payload.country; // remove country if not allowed

    showLoader();
    try {
      const response = await updateProfile(payload);
      addMessage(
        response?.success,
        response?.message || "Profile updated successfully!",
      );
      await fetchProfile();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const avatarSrc = avatarPreview || "https://placehold.co/120x120";

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <h2>My Account</h2>
        <p className="text-muted">Update your profile details.</p>

        {/* Avatar */}
        <div className="d-flex justify-content-center mb-4 position-relative">
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              overflow: "hidden",
              cursor: "pointer",
              position: "relative",
            }}
            onMouseEnter={() => setShowAvatarMenu(true)}
            onMouseLeave={() => setShowAvatarMenu(false)}
          >
            <img
              src={avatarSrc}
              alt="Avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onClick={handleFileClick}
            />

            {showAvatarMenu && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={handleFileClick}
                  title="Upload / Edit"
                >
                  <i className="bi bi-pencil"></i>
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={handleDeleteAvatar}
                    title="Delete"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              hidden
              onChange={(e) => handleAvatarChange(e.target.files[0])}
            />
          </div>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* First row: Full Name + Email */}
            <div className="form-group col-md-6">
              <label>Full Name</label>
              <input
                type="text"
                className="form-control"
                name="full_name"
                value={profileData.full_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group col-md-6">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={profileData.email}
                onChange={handleChange}
              />
            </div>

            {/* Second row: Phone Number + Save Button */}
            <div className="form-group col-md-6">
              <label>Phone Number</label>
              <input
                type="text"
                className="form-control"
                name="phone_number"
                value={profileData.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="form-group col-md-6 d-flex align-items-end">
              <button className="btn btn-main w-50" type="submit">
                Save Changes
              </button>
            </div>

            {/* Optional Country */}
            {profile.id === 4 && (
              <div className="form-group col-md-6 mt-3">
                <label>Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  value={profileData.country}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;

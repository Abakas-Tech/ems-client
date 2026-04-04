import { useState, useEffect, useRef } from "react";
import useloader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/Response/useResponse";
import useProfile from "../../../../context/Profile/useProfile";
import { useDelete } from "../../../../context/Delete/useDelete";
import { updateProfile } from "../../api/profile.api";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "../../api/profilePhoto.api";

const MyProfile = () => {
  const {profile } = useProfile();
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });
  const fileInputRef = useRef(null);

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    try {
      if (profile) {
        setProfileData({
          full_name: profile?.full_name || "",
          email: profile?.email || "",
          phone_number: profile?.phone_number || "",
        });
      }
    } catch (err) {
      addMessage(false, err.message);
    }
  }, [profile]);



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

  const validateFields = () => {
    const { full_name, email, phone_number } = profileData;

    const name = full_name?.trim();
    const mail = email?.trim();
    const phone = phone_number?.trim();

    if (!name) return addMessage(false, "Full name is required.");
    if (!/^[A-Za-z\s]+$/.test(name))
      return addMessage(false, "Full name must contain letters only.");
    if (name.length < 2 || name.length > 50)
      return addMessage(
        false,
        "Full name must be between 2 and 50 characters.",
      );

    if (profile?.role_id !== 4 && profile?.role_id !== 5) {
      if (!mail) return addMessage(false, "Email is required.");
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(mail))
        return addMessage(false, "Please enter a valid email address.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const payload = { ...profileData };
    if (profile?.role_id == 4 || profile?.role_id == 5) delete payload.email;

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

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <h2 className="fw-bold text-dark mb-2">My Profile</h2>
        <p className="text-muted">Update your profile details.</p>

        <form onSubmit={handleSubmit}>
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

            {profile?.role_id !== 5 && profile?.role_id !== 4 && (
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
    </div>
  );
};

export default MyProfile;

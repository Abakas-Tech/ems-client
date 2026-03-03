import { useState, useEffect, useRef } from "react";
import useLoader from "../../../../context/Loader/useLoader";
import useResponse from "../../../../context/response/useResponse";
import useProfile from "../../../../context/Profile/useProfile";
import { useDelete } from "../../../../context/Delete/useDelete";
import { updateProfile } from "../../api/profile.api";
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
} from "../../api/profilePhoto.api";

const MyProfile = () => {
  const { fetchProfile, profile } = useProfile();
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    country: "",
  });
  const fileInputRef = useRef(null);

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile?.full_name || "",
        email: profile?.email || "",
        phone_number: profile?.phone_number || "",
        country: profile?.role_id == 3 ? profile?.country || "" : "",
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (file) => {
    if (!file) return;

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

  const handleDeleteAvatar = async () => {
    openModal(async () => {
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
    });
  };

  const validateFields = () => {
    const { full_name, email, phone_number, country } = profileData;

    const name = full_name?.trim();
    const mail = email?.trim();
    const phone = phone_number?.trim();
    const countryVal = country?.trim();

    //full name validation
    if (!name) return addMessage(false, "Full name is required.");

    if (!/^[A-Za-z\s]+$/.test(name))
      return addMessage(false, "Full name must contain letters only.");

    if (name.length < 2 || name.length > 50)
      return addMessage(
        false,
        "Full name must be between 2 and 50 characters.",
      );

    // email validation
    if (!mail) return addMessage(false, "Email is required.");

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(mail))
      return addMessage(false, "Please enter a valid email address.");

    if (!phone) return addMessage(false, "Phone number is required.");

    const phoneRegex = /^(?:\+?(251|974|966|971)[0-9]{7,12}|09[0-9]{8})$/;

    if (!phoneRegex.test(phone)) {
      return addMessage(
        false,
        "Phone number must start with 09 or include the country code (e.g. +2519xxx).",
      );
    }

    if (phone.length < 7 || phone.length > 15)
      return addMessage(false, "Phone number must be between 7 and 15 digits.");

    if (profile?.role_id === 4) {
      if (!countryVal) return addMessage(false, "Country is required.");

      if (!/^[A-Za-z\s]+$/.test(countryVal))
        return addMessage(false, "Country must contain letters only.");
    }

    return true;
  };
  const profilePhoto = profile?.profile_photo_url;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    const payload = { ...profileData };
    if (profile?.role_id !== 4) delete payload.country;

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

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <h2>My Account</h2>
        <p className="text-muted">Update your profile details.</p>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* File Upload Input */}
            <div className="col-md-6">
              <label>Profile Image</label>
              <div className="input-group">
                <input
                  type="file"
                  className="form-control w-75 pt-3 px-3"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={(e) => handleAvatarChange(e.target.files[0])}
                />
                {profilePhoto && (
                  <button
                    className="form-control btn  border-0 pt-3"
                    type="button"
                    onClick={handleDeleteAvatar}
                    title="Delete Image"
                  >
                    <i className="bi bi-trash text-danger"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Row 1: Full Name + Email */}
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
            {profile?.role_id !== 5 && profile.role_id !== 4 && (
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

            {profile?.role_id === 3 && profile.role_id === 5 && (
              <div className="col-md-6">
                <label>
                  Country <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  required
                  value={profileData.country}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Submit Button at Bottom */}
          <div className="mt-4">
            <button type="submit" className="btn btn-main px-5">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProfile;

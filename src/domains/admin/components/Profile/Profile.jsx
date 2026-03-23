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
  const { fetchProfile, profile } = useProfile();
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
  });
  const fileInputRef = useRef(null);

  const { showLoader, hideLoader } = useloader();
  const [selectedFile, setSelectedFile] = useState(null);
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile?.full_name || "",
        email: profile?.email || "",
        phone_number: profile?.phone_number || "",
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
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
    const { full_name, email, phone_number, } = profileData;

    const name = full_name?.trim();
    const mail = email?.trim();
    const phone = phone_number?.trim();

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
    if (profile?.role_id !== 4 && profile?.role_id !== 5) {
      if (!mail) return addMessage(false, "Email is required.");

      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net)$/i;

      if (!emailPattern.test(mail)) {
        return addMessage(false, "Email must be a valid .com or .net address.");
      }
    }

    if (!phone) return addMessage(false, "Phone number is required.");

    const phoneRegex = /^(?:\+?(251|974|966|971)[0-9]{7,12}|09[0-9]{8})$/;

    if (!phoneRegex.test(phone)) {
      return addMessage(false, "Phone number is invalid");
    }

    if (phone.length < 7 || phone.length > 15)
      return addMessage(false, "Phone number must be between 7 and 15 digits.")

    return true;
  };
  const profilePhoto = profile?.profile_photo_url;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

  const payload = { ...profileData };

  // remove email for role 4 & 5
  if (profile?.role_id === 4 || profile?.role_id === 5) {
    delete payload.email;
  }



    showLoader();
    try {
      // 1. Update profile first
      const response = await updateProfile(payload);

      // 2. Upload image ONLY if selected
      if (selectedFile) {
        await uploadProfilePhoto(selectedFile);
      }

      addMessage(
        response?.success,
        response?.message || "Profile updated successfully!",
      );

      await fetchProfile();
      setSelectedFile(null); // reset after upload
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
                  onChange={handleFileChange}
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

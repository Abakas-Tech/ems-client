import React, { useState, useEffect, useRef } from "react";
import { getProfile, updateProfile } from "../../api/agent.api";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";

const MyProfile = () => {
  const [profileData, setProfileData] = useState({
    agent_name: "",
    agent_email: "",
    agent_phone: "",
    country: "",
    city: "",
    address: "",
    bio: "",
    title: "",
    facebook_username: "",
    telegram_username: "",
    whatsapp_username: "",
    profile_image_url: "",
  });

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  // Reusable fetch function
  const fetchProfile = async () => {
    showLoader();

    try {
      const { data } = await getProfile();
      setProfileData({
        agent_name: data.agent_name || "",
        agent_email: data.agent_email || "",
        agent_phone: data.agent_phone || "",
        country: data.country || "",
        city: data.city || "",
        address: data.address || "",
        bio: data.bio || "",
        title: data.title || "",
        facebook_username: data.facebook_username || "",
        telegram_username: data.telegram_username || "",
        whatsapp_username: data.whatsapp_username || "",
        profile_image_url: data.profile_image_url || "",
      });
    } catch(err) {
      addMessage("error", err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload profile image
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const formData = new FormData();
    formData.append("image", file);
    Object.entries(profileData).forEach(([key, value]) => {
      if (key !== "profile_image_url") formData.append(key, value);
    });

    showLoader();
   try {
     const response = await updateProfile(formData);
     await fetchProfile();
     addMessage(
       "success",
       response?.message || "Profile image updated successfully!"
     );
   } catch (error) {
     addMessage("error", error.message);
   } finally {
     hideLoader();
   }
  };

  const handleImageClick = () => fileInputRef.current.click();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(profileData).forEach(([key, value]) => {
      if (key !== "profile_image_url") formData.append(key, value);
    });

    showLoader();
    try {
      const response = await updateProfile(formData);
      addMessage(
        "success",
        response.message || "Profile updated successfully!"
      );
    } catch (error) {
      addMessage("error", error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <h4>My Account</h4>
        <div className="submit-section">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Basic Information  */}
              <div className="form-group col-md-6 position-relative">
                <label>Profile Image</label>
                <div
                  className="form-control position-relative"
                  style={{ height: "56px", cursor: "pointer" }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={handleImageClick}
                >
                  {isHovering && (
                    <div
                      className="position-absolute top-50 start-50 translate-middle text-center w-100"
                      style={{
                        color: "#17436C",
                        padding: "2px 5px",
                        borderRadius: "3px",
                        fontSize: "0.875rem",
                      }}
                    >
                      <i className="bi bi-pencil me-1"></i> Change Profile
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                {selectedFileName && (
                  <small className="text-muted mt-1 d-block">
                    Selected file: {selectedFileName}
                  </small>
                )}
              </div>

              {/* Name */}
              <div className="form-group col-md-6">
                <label>Your Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="agent_name"
                  value={profileData.agent_name}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="form-group col-md-6">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="agent_email"
                  value={profileData.agent_email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div className="form-group col-md-6">
                <label>Phone</label>
                <input
                  type="text"
                  className="form-control"
                  name="agent_phone"
                  value={profileData.agent_phone}
                  onChange={handleChange}
                />
              </div>

              {/* Title */}
              <div className="form-group col-md-6">
                <label>Your Title</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={profileData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div className="form-group col-md-6">
                <label>Address</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  value={profileData.address}
                  onChange={handleChange}
                />
              </div>

              {/* City */}
              <div className="form-group col-md-6">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  name="city"
                  value={profileData.city}
                  onChange={handleChange}
                />
              </div>

              {/* Country */}
              <div className="form-group col-md-6">
                <label>Country</label>
                <input
                  type="text"
                  className="form-control"
                  name="country"
                  value={profileData.country}
                  onChange={handleChange}
                />
              </div>

              {/* Bio */}
              <div className="form-group col-md-12">
                <label>About</label>
                <textarea
                  className="form-control"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                />
              </div>

              {/* social accounts  */}
              <div className="form-submit mt-4">
                <h4>Social Accounts</h4>
                <div className="row">
                  <div className="form-group col-md-6">
                    <label>Facebook</label>
                    <input
                      type="text"
                      className="form-control"
                      name="facebook_username"
                      value={profileData.facebook_username}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label>Telegram</label>
                    <input
                      type="text"
                      className="form-control"
                      name="telegram_username"
                      value={profileData.telegram_username}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group col-md-6">
                    <label>WhatsApp</label>
                    <input
                      type="text"
                      className="form-control"
                      name="whatsapp_username"
                      value={profileData.whatsapp_username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group col-lg-12 col-md-12 mt-3">
                <button className="btn btn-main px-5 rounded" type="submit">
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;

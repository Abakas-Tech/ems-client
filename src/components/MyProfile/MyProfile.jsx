import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../api/admin/auth.api";
import useLoader from "../../context/Loader/useLoader";
import useResponse from "../../context/response/UseResponse";

const MyProfile = () => {
  const [profileData, setProfileData] = useState({
    agent_name: "",
    profile_image_url: null,
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
  });
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      showLoader();
      try {
        const response = await getProfile();
        const data = response.data;
        setProfileData({
          agent_name: data.agent_name || "",
          profile_image_url: data.profile_image_url || null,
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
        });
      } catch (error) {
        addMessage("error", "Failed to fetch profile.", error);
      } finally {
        hideLoader();
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_image", file); 
    Object.keys(profileData).forEach((key) => {
      if (key !== "profile_image_url") {
        formData.append(key, profileData[key]);
      }
    });

    showLoader();
    try {
      const response = await updateProfile(formData);
      addMessage(
        "success",
        response.message || "Profile updated successfully!"
      );
      // Refresh profile data
      const newData = await getProfile();
      setProfileData({
        agent_name: newData.data.agent_name || "",
        profile_image_url: newData.data.profile_image_url || null,
        agent_email: newData.data.agent_email || "",
        agent_phone: newData.data.agent_phone || "",
        country: newData.data.country || "",
        city: newData.data.city || "",
        address: newData.data.address || "",
        bio: newData.data.bio || "",
        title: newData.data.title || "",
        facebook_username: newData.data.facebook_username || "",
        telegram_username: newData.data.telegram_username || "",
        whatsapp_username: newData.data.whatsapp_username || "",
      });
    } catch (error) {
      addMessage("error", error.message || "Failed to update profile.");
    } finally {
      hideLoader();
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const formData = new FormData();
      Object.keys(profileData).forEach((key) => {
        if (key !== "profile_image_url") {
          formData.append(key, profileData[key]);
        }
      });
      const response = await updateProfile(formData);
      addMessage(
        "success",
        response.message || "Profile updated successfully!"
      );
    } catch (error) {
      addMessage("error", error.message || "Update failed.");
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      {/* Basic Information */}
      <div className="form-submit">
        <h4>My Account</h4>
        <div className="submit-section">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="form-group col-md-6 position-relative">
                <label>Profile Image</label>
                <div
                  className="form-control position-relative"
                  style={{ height: "55px", cursor: "pointer" }}
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
              </div>
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

              <div className="form-group col-md-12">
                <label>About</label>
                <textarea
                  className="form-control"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Social Accounts */}
      <div className="form-submit">
        <h4>Social Accounts</h4>
        <div className="submit-section">
          <form onSubmit={handleSubmit}>
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

              <div className="form-group col-lg-12 col-md-12">
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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../api/admin/auth.api";
import useLoader from "../../context/Loader/useLoader";
import useResponse from "../../context/response/UseResponse";

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
  });

  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      showLoader();
      try {
        const response = await getProfile();
        const data = response.data;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    showLoader();
    try {
      const response = await updateProfile(profileData);
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

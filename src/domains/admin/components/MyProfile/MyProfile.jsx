import React, { useState, useEffect, useRef } from "react";
import useLoader from "../../../../context/Loader/UseLoader";
import useResponse from "../../../../context/response/UseResponse";
import { useProfile } from "../../../../context/Profile/ProfileProvider";
import { updateProfile } from "../../api/agent.api";

const MyProfile = () => {
  const { profile, fetchProfile } = useProfile();
  const [profileData, setProfileData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const { showLoader, hideLoader } = useLoader();
  const { addMessage } = useResponse();
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Update profileData when profile changes
  useEffect(() => {
    if (profile) {
      setProfileData({
        agent_name: profile.agent_name || "",
        agent_email: profile.agent_email || "",
        agent_phone: profile.agent_phone || "",
        country: profile.country || "",
        city: profile.city || "",
        address: profile.address || "",
        bio: profile.bio || "",
        title: profile.title || "",
        facebook_username: profile.facebook_username || "",
        telegram_username: profile.telegram_username || "",
        whatsapp_username: profile.whatsapp_username || "",
        profile_image_url: profile.profile_image_url || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setSelectedFileName(file.name);
  };

  const handleImageClick = () => fileInputRef.current.click();

  // Submit all data (inputs + image) together
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(profileData).forEach(([key, value]) => {
      if (key !== "profile_image_url") formData.append(key, value);
    });

    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    showLoader();
    try {
      const response = await updateProfile(formData);
      addMessage(
        "success",
        response.message || "Profile updated successfully!"
      );
      await fetchProfile(); // refresh global profile context
    } catch (error) {
      addMessage("error", error.message);
    } finally {
      hideLoader();
    }
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <h2>My Account</h2>
        <p className="text-muted ">
          Manage and update your account details to keep your profile up to
          date.
        </p>
        <div className="submit-section">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Profile Image */}
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

              {/* Text Inputs */}
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
                  // readOnly
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

              {/* Social Accounts */}
              <div className="form-submit mt-4">
                <h4>Social Accounts</h4>
                <div className="row">
                  <div className="form-group col-md-6">
                    <label>Facebook</label>
                    <input
                      type="text"
                      className="form-control"
                      name="facebook_username"
                      placeholder="e.g. kasim.nurlgn"
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
                      placeholder="e.g. @kasim_nurlgn"
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
                      placeholder="e.g. +251968301664"
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

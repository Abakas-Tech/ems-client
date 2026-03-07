import { useState, useEffect } from "react";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";

import {
  createOrUpdateSocialMedia,
  getSocialMedia,
  deleteSocialMedia,
} from "../../../api/socialMedia";
import BackButton from "../../../../../shared/components/BackButton/BackButton";
import { useNavigate } from "react-router-dom";

const SocialMedia = () => {
  const navigate = useNavigate();
  const [socialData, setSocialData] = useState({
    facebook_username: "",
    instagram_username: "",
    telegram_username: "",
    tiktok_username: "",
    linkedin_username: "",
    youtube_channel: "",
    twitter_username: "",
    whatsapp_number: "",
    contact_number: "",
  });

  const [existingData, setExistingData] = useState(null);

  const { showLoader, hideLoader } = useloader();
  const { addMessage } = useResponse();
  const { openModal } = useDelete();

  const goBack = () => navigate(-1);
  const fetchSocialMedia = async () => {
    showLoader();
    try {
      const response = await getSocialMedia();

      if (response?.data) {
        setExistingData(response.data);

        setSocialData({
          facebook_username: response.data?.facebook_username || "",
          instagram_username: response.data?.instagram_username || "",
          telegram_username: response.data?.telegram_username || "",
          tiktok_username: response.data?.tiktok_username || "",
          linkedin_username: response.data?.linkedin_username || "",
          youtube_channel: response.data?.youtube_channel || "",
          twitter_username: response.data?.twitter_username || "",
          whatsapp_number: response.data?.whatsapp_number || "",
          contact_number: response.data?.contact_number || "",
        });
      } else {
        setExistingData(null);
      }
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  useEffect(() => {
    fetchSocialMedia();
    // eslint-disable-next-line
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSocialData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    const values = Object.values(socialData).map((v) => v.trim());
    const hasValue = values.some((v) => v !== "");

    if (!hasValue)
      return addMessage(false, "At least one social media field is required.");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    const payload = {};

    Object.keys(socialData).forEach((key) => {
      if (socialData[key]?.trim() !== "") {
        payload[key] = socialData[key].trim();
      }
    });

    showLoader();

    try {
      const response = await createOrUpdateSocialMedia(payload);

      addMessage(
        response?.success,
        response?.message ||
          (existingData
            ? "Social media updated successfully"
            : "Social media created successfully"),
      );

      await fetchSocialMedia();
    } catch (err) {
      addMessage(false, err.message);
    } finally {
      hideLoader();
    }
  };

  const handleDelete = async () => {
    openModal(async () => {
      showLoader();

      try {
        const response = await deleteSocialMedia();

        addMessage(response?.success, response?.message);

        setSocialData({
          facebook_username: "",
          instagram_username: "",
          telegram_username: "",
          tiktok_username: "",
          linkedin_username: "",
          youtube_channel: "",
          twitter_username: "",
          whatsapp_number: "",
          contact_number: "",
        });

        setExistingData(null);
      } catch (err) {
        addMessage(false, err.message);
      } finally {
        hideLoader();
      }
    });
  };

  return (
    <div className="dashboard-wraper">
      <div className="form-submit">
        <h2>Public Profile</h2>
        <p className="text-muted">Manage company public accounts.</p>
        <div className="position-absolute top-0 end-0 mt-2">
          <BackButton onClick={goBack} />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label>Facebook Username</label>
              <input
                type="text"
                className="form-control"
                name="facebook_username"
                placeholder="abakas.page"
                value={socialData.facebook_username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>Instagram Username</label>
              <input
                type="text"
                className="form-control"
                name="instagram_username"
                placeholder="abakas.official"
                value={socialData.instagram_username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>Telegram Username</label>
              <input
                type="text"
                className="form-control"
                name="telegram_username"
                placeholder="abakas_support"
                value={socialData.telegram_username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>TikTok Username</label>
              <input
                type="text"
                className="form-control"
                name="tiktok_username"
                placeholder="abakas.tiktok"
                value={socialData.tiktok_username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>LinkedIn Username</label>
              <input
                type="text"
                className="form-control"
                name="linkedin_username"
                placeholder="abakas-company"
                value={socialData.linkedin_username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>YouTube Channel</label>
              <input
                type="text"
                className="form-control"
                name="youtube_channel"
                placeholder="abakaschannel"
                value={socialData.youtube_channel}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>Twitter Username</label>
              <input
                type="text"
                className="form-control"
                name="twitter_username"
                placeholder="abakas_x"
                value={socialData.twitter_username}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>WhatsApp Number</label>
              <input
                type="text"
                className="form-control"
                name="whatsapp_number"
                placeholder="+251911111111"
                value={socialData.whatsapp_number}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-6">
              <label>Contact Number</label>
              <input
                type="text"
                className="form-control"
                name="contact_number"
                placeholder="+251900000000/+251911111111"
                value={socialData.contact_number}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mt-4 d-flex gap-3">
            <button type="submit" className="btn btn-main px-5">
              {existingData ? "Update Social Media" : "Create Social Media"}
            </button>

            {existingData && (
              <button
                type="button"
                className="btn btn-danger px-5"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SocialMedia;

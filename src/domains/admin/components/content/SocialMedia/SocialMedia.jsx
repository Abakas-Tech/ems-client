import { useState, useEffect } from "react";
import useloader from "../../../../../context/Loader/useLoader";
import useResponse from "../../../../../context/Response/useResponse";
import { useDelete } from "../../../../../context/Delete/useDelete";

import {
  createOrUpdateSocialMedia,
  getSocialMedia,
  deleteSocialMedia,
} from "../../../api/socialMedia.api";
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

  // Mapping of keys to friendly field names
  const friendlyNames = {
    facebook_username: "Facebook Username",
    instagram_username: "Instagram Username",
    telegram_username: "Telegram Username",
    tiktok_username: "TikTok Username",
    linkedin_username: "LinkedIn Username",
    youtube_channel: "YouTube Channel",
    twitter_username: "Twitter Username",
    whatsapp_number: "WhatsApp Number",
    contact_number: "Contact Number",
  };

  const validateFields = (data) => {
    const trimmedData = {};
    Object.keys(data).forEach((key) => {
      trimmedData[key] = data[key]?.trim() || "";
    });

    const hasValue = Object.values(trimmedData).some((v) => v !== "");
    if (!hasValue) {
      addMessage(false, "At least one social media field is required.");
      return false;
    }

    const usernamePatterns = {
      facebook: /^[a-zA-Z0-9._-]{2,100}$/,
      instagram: /^[a-zA-Z0-9._]{2,100}$/,
      telegram: /^[a-zA-Z0-9_]{2,100}$/,
      tiktok: /^[a-zA-Z0-9._]{2,100}$/,
      linkedin: /^[a-zA-Z0-9_-]{2,100}$/,
      youtube: /^[a-zA-Z0-9_-]{2,100}$/,
      twitter: /^[a-zA-Z0-9_]{2,100}$/,
    };

    const phonePattern = /^\+\d{9,14}$/;

    const validateContactNumber = (value) => {
      const numbers = value.split("/");
      if (numbers.length > 2) return false;
      return numbers.every((num) => phonePattern.test(num.trim()));
    };

    for (const [key, value] of Object.entries(trimmedData)) {
      if (!value) continue;

      const friendlyKey = friendlyNames[key] || key;

      if (key === "telegram_username") {
        const username = value.startsWith("@") ? value.slice(1) : value;
        if (!usernamePatterns.telegram.test(username)) {
          addMessage(false, `${friendlyKey} is invalid`);
          return false;
        }
      } else if (
        [
          "facebook_username",
          "instagram_username",
          "tiktok_username",
          "linkedin_username",
          "youtube_channel",
          "twitter_username",
        ].includes(key)
      ) {
        if (!usernamePatterns[key.split("_")[0]].test(value)) {
          addMessage(false, `${friendlyKey} is invalid`);
          return false;
        }
      } else if (key === "whatsapp_number") {
        if (!phonePattern.test(value)) {
          addMessage(false, `${friendlyKey} is invalid`);
          return false;
        }
      } else if (key === "contact_number") {
        if (!validateContactNumber(value)) {
          addMessage(false, `${friendlyKey} is invalid`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields(socialData)) return;

    const payload = {};
    Object.keys(socialData).forEach((key) => {
      if (socialData[key]?.trim() !== "") {
        let value = socialData[key].trim();
        if (key === "telegram_username" && value.startsWith("@"))
          value = value.slice(1);
        payload[key] = value;
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
        <div>
          <BackButton onClick={goBack} />
        </div>
        <h2>Social Media</h2>
        <p className="text-muted">Manage company social media accounts.</p>

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {[
              {
                label: "Facebook Username",
                name: "facebook_username",
                placeholder: "abakas.page",
              },
              {
                label: "Instagram Username",
                name: "instagram_username",
                placeholder: "abakas.official",
              },
              {
                label: "Telegram Username",
                name: "telegram_username",
                placeholder: "abakas_support",
              },
              {
                label: "TikTok Username",
                name: "tiktok_username",
                placeholder: "abakas.tiktok",
              },
              {
                label: "LinkedIn Username",
                name: "linkedin_username",
                placeholder: "abakas-company",
              },
              {
                label: "YouTube Channel",
                name: "youtube_channel",
                placeholder: "abakaschannel",
              },
              {
                label: "Twitter Username",
                name: "twitter_username",
                placeholder: "abakas_x",
              },
              {
                label: "WhatsApp Number",
                name: "whatsapp_number",
                placeholder: "+251911111111",
              },
              {
                label: "Contact Number",
                name: "contact_number",
                placeholder: "+251900000000/+251911111111",
              },
            ].map((field) => (
              <div className="col-md-6" key={field.name}>
                <label>{field.label}</label>
                <input
                  type="text"
                  className="form-control"
                  name={field.name}
                  placeholder={field.placeholder}
                  value={socialData[field.name]}
                  onChange={handleChange}
                />
              </div>
            ))}
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

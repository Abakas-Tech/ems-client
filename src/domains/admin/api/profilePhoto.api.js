import  axios  from "../../../utils/axios";

// UPLOAD OR UPDATE OWN PROFILE PHOTO
const uploadProfilePhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append("photo", file);

    const response = await axios.axiosInstance.post(
      "/users/me/profile-photo",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Upload profile photo error",
    );
  }
};

// DELETE OWN PROFILE PHOTO
const deleteProfilePhoto = async () => {
  try {
    const response = await axios.axiosInstance.delete("/users/me/profile-photo");

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Delete profile photo error",
    );
  }
};

export default {
  uploadProfilePhoto,
  deleteProfilePhoto,
};

import API from "./api";

/**
 * Upload image to Cloudinary via backend
 * @param {File} file
 * @returns {Promise<string>} image URL
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post("/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data.url;
};

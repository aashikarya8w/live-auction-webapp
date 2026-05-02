import API from "./api";

/**
 * 🟣 Place a bid
 */
export const placeBid = async (data) => {
  try {
    const response = await API.post("/bids", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to place bid";
  }
};

/**
 * 📜 Get all bids for a product
 */
export const getBidsByProduct = async (productId) => {
  try {
    const response = await API.get(`/bids/product/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch bids";
  }
};

/**
 * 👤 Get user bids (optional future feature)
 */
export const getUserBids = async (userId) => {
  try {
    const response = await API.get(`/bids/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch user bids";
  }
};
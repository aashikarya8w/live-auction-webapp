import API from "./api";

/**
 * 🛒 Create Order
 */
export const createOrder = async (userId, productId) => {
  try {
    const response = await API.post("/orders", {
      userId,
      productId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to create order";
  }
};

/**
 * 📦 Get orders of a user
 */
export const getUserOrders = async (userId) => {
  try {
    const response = await API.get(`/orders/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to fetch orders";
  }
};
import API from "./api";

/**
 * 💳 Create Payment Intent
 * @param {number} amount
 */
export const createPaymentIntent = async (amount) => {
  try {
    const response = await API.post("/payments/create-intent", {
      amount,
    });

    return response.data; // { clientSecret }
  } catch (error) {
    throw error.response?.data?.message || "Payment failed";
  }
};
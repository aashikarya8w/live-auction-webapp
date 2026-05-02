import API from "./api";

export const setAutoBid = async (userId, productId, maxAmount, increment = 100) => {
  const res = await API.post("/bids/auto", { userId, productId, maxAmount, increment });
  return res.data;
};

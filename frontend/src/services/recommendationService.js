import API from "./api";

export const getRecommendations = async (userId) => {
  const url = userId ? `/recommendations/user/${userId}` : `/recommendations/guest`;
  const res = await API.get(url);
  return res.data;
};

export const getSimilarProducts = async (productId) => {
  const res = await API.get(`/recommendations/similar/${productId}`);
  return res.data;
};

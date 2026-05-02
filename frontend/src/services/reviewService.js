import API from "./api";

export const addReview = async (productId, userId, rating, comment) => {
  const res = await API.post("/reviews", { productId, userId, rating, comment });
  return res.data;
};

export const getProductReviews = async (productId) => {
  const res = await API.get(`/reviews/product/${productId}`);
  return res.data;
};

export const getProductRating = async (productId) => {
  const res = await API.get(`/reviews/product/${productId}/rating`);
  return res.data;
};

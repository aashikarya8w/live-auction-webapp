import API from "./api";

export const getAuctionChat = async (productId) => {
  const res = await API.get(`/chat/auction/${productId}`);
  return res.data;
};

export const sendAuctionMessage = async (productId, userId, message) => {
  const res = await API.post(`/chat/auction/${productId}`, { userId, message });
  return res.data;
};

export const getDirectChat = async (userId1, userId2) => {
  const res = await API.get(`/chat/direct/${userId1}/${userId2}`);
  return res.data;
};

export const sendDirectMessage = async (userId1, userId2, senderId, message) => {
  const res = await API.post(`/chat/direct/${userId1}/${userId2}`, { senderId, message });
  return res.data;
};

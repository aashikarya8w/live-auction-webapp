import API from "./api";

export const getUserNotifications = async (userId) => {
  const res = await API.get(`/notifications/user/${userId}`);
  return res.data;
};

export const getUnreadCount = async (userId) => {
  const res = await API.get(`/notifications/user/${userId}/unread`);
  return res.data.count;
};

export const markAllRead = async (userId) => {
  await API.put(`/notifications/user/${userId}/read-all`);
};

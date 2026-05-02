// ===============================
// 🔧 HELPER FUNCTIONS
// ===============================

// 💰 Format price (₹)
export const formatPrice = (price) => {
  if (price === null || price === undefined) return "₹0";
  return `₹${Number(price).toLocaleString("en-IN")}`;
};

// 📅 Format date (readable)
export const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ⏳ Get time remaining (auction countdown)
export const getTimeRemaining = (endTime) => {
  if (!endTime) return "";

  const total = new Date(endTime) - new Date();

  if (total <= 0) {
    return "Auction Ended";
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};
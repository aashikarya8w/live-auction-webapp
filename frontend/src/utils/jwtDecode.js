// ===============================
// 🔐 JWT DECODE FUNCTION
// ===============================

export const decodeToken = (token) => {
  try {
    if (!token) return null;

    // JWT format: header.payload.signature
    const payload = token.split(".")[1];

    // Base64 decode
    const decoded = JSON.parse(atob(payload));

    return decoded;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};
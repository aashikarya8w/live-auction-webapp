import API from "./api";

/**
 * 🔐 Register User
 */
export const registerUser = async (data) => {
  try {
    const response = await API.post("/auth/register", data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Registration failed";
  }
};

/**
 * 🔐 Login User
 */
export const loginUser = async (data) => {
  try {
    const response = await API.post("/auth/login", data);

    // Expected: { token: "..." }
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed";
  }
};

/**
 * 🔓 Logout (frontend only)
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
};
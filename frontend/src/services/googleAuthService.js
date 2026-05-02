import API from "./api";

export const googleLogin = async (googleToken) => {
  const res = await API.post("/auth/google", { token: googleToken });
  return res.data;
};

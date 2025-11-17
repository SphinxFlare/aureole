// src/services/authService.ts


import api from "./api";

export const signup = async (email: string, phone: string, password: string) => {
  const res = await api.post(`/signup`, { email, phone, password });
  return res.data; // { msg, user_id }
};

// Login uses URL-encoded form as your backend expects
export const login = async (email: string, password: string) => {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const res = await api.post(`/login`, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return res.data; // { access_token, user_id? }
};

export const getMyProfile = async (token?: string) => {
  try {
    const res = await api.get(`/profile/me`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data;
  } catch (err: any) {
    console.error("Error fetching profile:", err);
    return { exists: false };
  }
};

// Revoke all tokens / logout everywhere (backend should support this route)
export const logoutAll = async (token?: string) => {
  try {
    await api.post(
      `/logout_all`,
      {},
      { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
    );
  } catch (err) {
    console.warn("logoutAll error", err);
  }
};

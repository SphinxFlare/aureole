// src/redux/slices/authSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email?: string;
  verified?: boolean;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const DEFAULT_AVATAR = "/images/default-avatar.png";

// Load from localStorage & normalize avatar
const savedAuth = localStorage.getItem("auth");
const parsed = savedAuth ? JSON.parse(savedAuth) : null;

const initialState: AuthState = {
  token: parsed?.token || null,
  user: parsed?.user
    ? {
        ...parsed.user,
        avatar: parsed.user.avatar || DEFAULT_AVATAR,
      }
    : null,
  isAuthenticated: !!parsed?.token && !!parsed?.user?.id,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ token: string; user: User }>) => {
      const token = action.payload.token || null;

      const user = {
        ...action.payload.user,
        avatar: action.payload.user.avatar || DEFAULT_AVATAR,
      };

      state.token = token;
      state.user = user;
      state.isAuthenticated = !!token && !!user?.id;

      localStorage.setItem(
        "auth",
        JSON.stringify({ token: state.token, user: state.user })
      );
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (!state.user) state.user = { id: action.payload.id || "" };

      state.user = {
        ...state.user,
        ...action.payload,
        avatar: action.payload.avatar || state.user.avatar || DEFAULT_AVATAR,
      };

      localStorage.setItem(
        "auth",
        JSON.stringify({ token: state.token, user: state.user })
      );
    },

    clearAuth: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("auth");
    },
  },
});

export const { setAuth, clearAuth, updateUser } = authSlice.actions;
export default authSlice.reducer;
// src/redux/slices/notificationSlice.ts


import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UINotification {
  id: string;
  type: "match" | "message" | "system" | "like" | "visit";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  meta?: any;
}

interface NotificationState {
  list: UINotification[];
  unread: number;
}

const initialState: NotificationState = {
  list: [],
  unread: 0,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notificationReceived: (state, action: PayloadAction<UINotification>) => {
      state.list.unshift(action.payload);
      state.unread += 1;
    },
    markAllRead: (state) => {
      state.list = state.list.map((n) => ({ ...n, read: true }));
      state.unread = 0;
    },
    markRead: (state, action: PayloadAction<string>) => {
      const item = state.list.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unread -= 1;
      }
    },
    clearNotifications: (state) => {
      state.list = [];
      state.unread = 0;
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
        const idx = state.list.findIndex((n) => n.id === action.payload);
        if (idx !== -1) {
          const wasUnread = !state.list[idx].read;
          state.list.splice(idx, 1);
          if (wasUnread) state.unread -= 1;
        }
      },
      
  },
});

export const {
  notificationReceived,
  markAllRead,
  markRead,
  clearNotifications,
  deleteNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
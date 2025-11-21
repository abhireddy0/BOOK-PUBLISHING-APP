// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    // 🔑 the key MUST be "user" because all components use state.user
    user: userReducer,
  },
});

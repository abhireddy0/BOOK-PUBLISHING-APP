// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Read from localStorage on app start
const storedAuth = JSON.parse(
  localStorage.getItem("storyverse_auth") || "null"
);

const initialState = storedAuth || {
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action) {
      state.user = action.payload.user || null;
      state.token = action.payload.token || null;

      // Persist to localStorage (single key)
      localStorage.setItem(
        "storyverse_auth",
        JSON.stringify({ user: state.user, token: state.token })
      );

      // Backwards-compat if you also use "token" key in axios interceptor
      if (state.token) localStorage.setItem("token", state.token);
    },
    clearUser(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("storyverse_auth");
      localStorage.removeItem("token");
    },
  },
});

export const { setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;

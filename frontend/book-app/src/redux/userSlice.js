// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const storedAuth = JSON.parse(
  localStorage.getItem("storyverse_auth") || "null"
);

const initialState = {
  user: storedAuth?.user || null,
  token: storedAuth?.token || null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;

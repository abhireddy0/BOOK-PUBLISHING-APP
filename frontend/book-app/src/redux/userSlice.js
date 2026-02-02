
import { createSlice } from "@reduxjs/toolkit";

// Initialize from localStorage to persist across page refreshes
const storedAuth = JSON.parse(localStorage.getItem("storyverse_auth") || "null");
const storedToken = localStorage.getItem("token");

const initial = {
  user: storedAuth?.user || null,
  token: storedAuth?.token || storedToken || null,
};

const userSlice = createSlice({
  name: "user",
  initialState: initial,
  reducers: {
    setUserData: (state, action) => {
   
      const p = action.payload || {};
      state.user = p.user ?? null;
      state.token = p.token ?? null;
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;

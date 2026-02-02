
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

      // Persist to localStorage
      if (state.token && state.user) {
        localStorage.setItem("token", state.token);
        localStorage.setItem(
          "storyverse_auth",
          JSON.stringify({ token: state.token, user: state.user })
        );
      } else {
        // Clear localStorage on logout
        localStorage.removeItem("token");
        localStorage.removeItem("storyverse_auth");
      }
    },
  },
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;

      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);
    },
    clearUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;

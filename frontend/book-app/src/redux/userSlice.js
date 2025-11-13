import { createSlice } from "@reduxjs/toolkit";

const stored = localStorage.getItem("bp_auth");
const initial = stored ? JSON.parse(stored) : { token: "", user: null };

const userSlice = createSlice({
  name: "auth",
  initialState: initial,
  reducers: {
    setUserData: (state, { payload }) => {
      state.token = payload.token;
      state.user  = payload.user;
      localStorage.setItem("bp_auth", JSON.stringify(state));
    },
    clearUser: (state) => {
      state.token = "";
      state.user = null;
      localStorage.removeItem("bp_auth");
    },
  },
});

export const { setUserData, clearUser } = userSlice.actions;
export default userSlice.reducer;

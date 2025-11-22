
import { createSlice } from "@reduxjs/toolkit";

const initial = {
  user: null,
  token: null,
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

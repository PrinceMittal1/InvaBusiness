import { createSlice } from "@reduxjs/toolkit";
export const userDataSlice = createSlice({
  name: "userData",
  initialState: {
    auth: false,
    user_id : ""
  },
  reducers: {
    setAuth: (state, action) => {
      state.auth = action.payload;
    },
    setUserId: (state, action) => {
      state.user_id = action.payload;
    },
  },
});


export const {  
  setAuth,
  setUserId
} = userDataSlice.actions;

export default userDataSlice.reducer;

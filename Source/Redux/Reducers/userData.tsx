import { createSlice } from "@reduxjs/toolkit";
export const userDataSlice = createSlice({
  name: "userData",
  initialState: {
    auth: false,
    user_id : "",
    userData : {}
  },
  reducers: {
    setAuth: (state, action) => {
      state.auth = action.payload;
    },
    setUserId: (state, action) => {
      state.user_id = action.payload;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
  },
});


export const {  
  setAuth,
  setUserId,
  setUserData
} = userDataSlice.actions;

export default userDataSlice.reducer;

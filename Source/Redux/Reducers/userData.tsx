import { createSlice } from "@reduxjs/toolkit";
export const userDataSlice = createSlice({
  name: "userData",
  initialState: {
    auth: false,
    user_id : "",
    productType : [],
    businessType : [],
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
    setProductType: (state, action) => {
      state.productType = action.payload;
    },
    setBusinessType: (state, action) => {
      state.businessType = action.payload;
    },
  },
});


export const {  
  setAuth,
  setUserId,
  setUserData,
  setProductType,
  setBusinessType
} = userDataSlice.actions;

export default userDataSlice.reducer;

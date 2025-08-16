import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface TempDataState {
  loader: boolean;
}

const initialState: TempDataState = {
  loader: false,
};

const tempDataSlice = createSlice({
  name: 'tempData',
  initialState,
  reducers: {
    setLoader: (state, action: PayloadAction<boolean>) => {
      state.loader = action.payload;
    }
  },
});

export const { setLoader } = tempDataSlice.actions;

export default tempDataSlice.reducer;

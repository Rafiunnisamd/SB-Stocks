import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null,
  loading: true,
  error: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDashboardSuccess: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchStart, fetchDashboardSuccess, fetchFailure } = portfolioSlice.actions;

export default portfolioSlice.reducer;

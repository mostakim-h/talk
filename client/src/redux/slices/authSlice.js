import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  }
});

export const {
  setCredentials,
  setAccessToken,
  clearAuth,
  setLoading,
  setUser
} = authSlice.actions;
export default authSlice.reducer;

import {createSlice, type PayloadAction} from "@reduxjs/toolkit";
import type {IUser} from "@/types/IUser.ts";

interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  loading: boolean;
}

const initialState: IAuthState = {
  user: null,
  accessToken: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{user: IUser, accessToken: string}>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<IUser | null>) => {
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
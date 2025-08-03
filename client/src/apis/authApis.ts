import api from "../axios/axiosInstance.ts";
import {store} from "../redux/store.js";
import {setAccessToken} from "../redux/slices/authSlice.js";
import type {AxiosError} from "axios";

export const refreshToken = async () => {
  try {
    const { data: {res: {accessToken}} } = await api.post('/auth/refresh-token');
    store.dispatch(setAccessToken(accessToken));
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error refreshing token:', err.message || 'An error occurred while refreshing the token.');
  }
};
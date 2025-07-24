import api from "./axiosInstance.js";
import {store} from "../redux/store.js";
import {setAccessToken} from "../redux/slices/authSlice.js";

export const refreshToken = async () => {
  const { data } = await api.post('/auth/refresh-token');

  const {message, success, res} = data;

  if (!success) {
    throw new Error(message);
  }

  store.dispatch(setAccessToken(res.accessToken));
};
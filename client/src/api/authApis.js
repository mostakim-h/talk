import api from "./axiosInstance.js";
import {store} from "../redux/store.js";
import {setAccessToken, setUser} from "../redux/slices/authSlice.js";

export const getUser = async () => {
  const { data } = await api.get('/auth/user');

  const {message, success, res} = data;

  if (!success) {
    throw new Error(message);
  }

  store.dispatch(setUser(res.user))
};

export const refreshToken = async () => {
  const { data } = await api.post('/auth/refresh-token');

  const {message, success, res} = data;

  if (!success) {
    throw new Error(message);
  }

  store.dispatch(setAccessToken(res.accessToken));
};
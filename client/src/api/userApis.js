import api from "./axiosInstance.js";
import {store} from "../redux/store.js";
import {setUser} from "../redux/slices/authSlice.js";

export const getUser = async () => {
  try {
    const { data } = await api.get('/auth/user');

    const { message, success, res } = data;

    if (!success) {
      throw new Error(message);
    }

    store.dispatch(setUser(res.user));

  } catch (error) {
    console.log('error to get user', error)
  }
};


export const getAllUsers = async () => {
  const {data} = await api.get('/user/all');

  const {message, success, res} = data;

  if (!success) {
    throw new Error(message);
  }

  return res.users
};
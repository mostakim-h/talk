import api from "../axios/axiosInstance.ts";
import {store} from "../redux/store.js";
import {setUser} from "../redux/slices/authSlice.js";
import type {AxiosError} from "axios";

export const getUser = async () => {
  try {
    const {data: {res: {user}}} = await api.get('/auth/user');

    store.dispatch(setUser(user));

  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching user:', err.message || 'An error occurred while fetching user data.');
  }
};


export const getAllUsers = async () => {
  try {
    const {data: {res: {users}}} = await api.get('/user/all');
    return users
  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching user:', err.message || 'An error occurred while fetching user data.');
  }
};
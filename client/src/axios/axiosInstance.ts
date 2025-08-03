import axios from 'axios';
import {store} from "../redux/store.js";
import {clearAuth} from "../redux/slices/authSlice.js";
import {refreshToken} from "@/apis/authApis.ts";

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true
})

axiosInstance.interceptors.request.use(
  (config) => {
    const {accessToken} = store.getState().auth;
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: any) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Axios interceptor
axiosInstance.interceptors.response.use(
  res => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          console.log('Token refreshed', token);
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const token = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        processQueue(null, token);
        return axiosInstance(originalRequest);
      } catch (error: any) {
        processQueue(error, null);

        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Unauthorized or Forbidden, redirecting to login');
          localStorage.removeItem('accessToken');
          store.dispatch(clearAuth());
          window.location.href = '/login';
        }

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default axiosInstance;
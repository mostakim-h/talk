import api from '../../../axios/axiosInstance.ts';
import {useDispatch} from "react-redux";
import {useMutation} from "@tanstack/react-query";
import {clearAuth, setCredentials} from "@/redux/slices/authSlice.ts";

export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({email, password} : {email: string, password: string | number}) => {

      const {data} = await api.post('/auth/login', {email, password});

      const {message, success, res} = data;

      if (!success) {
        throw new Error(message);
      }

      return res
    },
    onSuccess: (data) => {
      dispatch(setCredentials({user: data.user, accessToken: data.accessToken}));
    },
  });
};

export const useRegister = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async ({firstName, lastName, email, password, confirmPassword}: {firstName: string, lastName: string, email: string, password: string | number, confirmPassword: string | number}) => {

      const {data} = await api.post('/auth/register', {firstName, lastName, email, password, confirmPassword});

      const {message, success, res} = data;

      if (!success) {
        throw new Error(message);
      }

      return res
    },
    onSuccess: (data) => {
      dispatch(setCredentials({user: data.user, accessToken: data.accessToken}));
    },
  });
}

export const useLogOut = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {

      const { data } = await api.post('/auth/logout');

      const {message, success, res} = data;

      if (!success) {
        throw new Error(message);
      }

      return res
    },
    onSuccess: () => {
      dispatch(clearAuth());
    },
  });
};

export const useSendEmailToVerifyUserEmail = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/send-email/email-verification', { email });

      const {message, success} = data;

      if (!success) {
        throw new Error(message);
      }
    },
  });
}

export const useVerifyUserEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const { data } = await api.post(`/auth/verify-email?token=${token}`);

      const {message, success} = data;

      if (!success) {
        throw new Error(message);
      }
    },
  });
}

export const useSendEmailToResetPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post('/auth/send-email/password-reset', { email });

      const {message, success} = data;

      if (!success) {
        throw new Error(message);
      }
    },
  });
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, password } : {token: string, password: string | number}) => {
      const { data } = await api.post(`/auth/reset-password?token=${token}`, { newPassword: password });

      const {message, success} = data;

      if (!success) {
        throw new Error(message);
      }
    },
  });
};
import api from '../../../axios/axiosInstance.ts';
import {useMutation} from "@tanstack/react-query";
import {store} from "@/redux/store.ts";
import {setUser} from "@/redux/slices/authSlice.ts";

export const useUpdateUserProfile = () => {
  return useMutation({
    mutationFn: async ({userId, bodyData}: { userId: string, bodyData: object }) => {
      const {data: {res: {user}}} = await api.put(`/user/edit/${userId}`, bodyData);
      return user;
    },
    onSuccess: async (user) => {
      store.dispatch(setUser(user));
    }
  });
}
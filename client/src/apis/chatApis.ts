import api from "../axios/axiosInstance.ts";
import type {AxiosError} from "axios";

export const getChats = async (roomId: string, signal: any) => {
  try {
    const {data: {res: {chat}}} = await api.get(`/chat/${roomId}`, {signal});

    return chat || [];

  } catch (error) {
    const err = error as AxiosError;
    console.error('Error fetching user:', err.message || 'An error occurred while fetching user data.');
  }
}
import api from "./axiosInstance.js";


export const getChats = async (roomId, signal) => {
  try {
    const { data } = await api.get(`/chat/${roomId}`, { signal });

    const { message, success, res } = data;

    if (!success) {
      throw new Error(message);
    }

    console.log("Fetched chat data:", res.chat);

    return res.chat || [];

  } catch (error) {
    console.error('Error fetching chat:', error);
    throw error; // Re-throw the error for further handling
  }
}
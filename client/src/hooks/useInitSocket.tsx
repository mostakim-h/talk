import {useEffect} from "react";
import socket from "../config/socket.ts";
import {useAppSelector} from "@/redux/hooks.ts";

export const useInitSocket = () => {
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?._id) {
      socket.connect()
      socket.emit('join', user?._id);
    }

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);
}
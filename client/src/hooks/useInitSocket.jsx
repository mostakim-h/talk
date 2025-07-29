import {useSelector} from "react-redux";
import {useEffect} from "react";
import socket from "../config/socket.js";

export const useInitSocket = () => {
  const user = useSelector((state) => state.auth.user);

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
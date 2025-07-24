import {useSelector} from "react-redux";
import {useEffect} from "react";
import socket from "../config/socket.js";

export const useInitSocket = () => {
  const {user: {_id: userId}} = useSelector((state) => state.auth);

  useEffect(() => {
    if (userId) {
      socket.connect()
      socket.emit('join', userId);
    }

    return () => {
      socket.disconnect();
    };
  }, [userId]);
}
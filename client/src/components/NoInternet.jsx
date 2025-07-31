import {useEffect, useState} from "react";

export default function NoInternet() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const checkConnection = async () => {
    try {
      await fetch("https://clients3.google.com/generate_204", {
        method: "GET",
        mode: "no-cors",
      });
      setIsOnline(true);
    } catch (err) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkConnection();

    const goOnline = () => checkConnection();
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div>
      <p>No Internet Connection</p>
    </div>
  );
};

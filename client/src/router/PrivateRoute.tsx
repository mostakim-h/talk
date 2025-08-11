import {Navigate} from 'react-router-dom';
import {type JSX, useEffect} from "react";
import {setLoading, setUser} from "../redux/slices/authSlice.js";
import {useDispatch, useSelector} from "react-redux";
import {getUser} from "@/apis/userApis.ts";

export default function PrivateRoute({children}: {children: JSX.Element}) {
  const {user, accessToken, loading} = useSelector((state: any) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        try {
          dispatch(setLoading(true));
          await getUser();
          dispatch(setLoading(false));
        } catch {
          dispatch(setUser(null));
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setUser(null));
        dispatch(setLoading(false));
      }
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to={'/login'}/>
}
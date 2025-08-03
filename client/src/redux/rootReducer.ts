import {combineReducers} from "@reduxjs/toolkit";
import auth from "./slices/authSlice.js";

const rootReducer = combineReducers({
  auth
})

export default rootReducer;
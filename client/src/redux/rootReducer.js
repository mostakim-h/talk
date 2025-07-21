import {combineReducers} from "@reduxjs/toolkit";
import auth from "./slices/authSlice.js";

// const modules = import.meta.glob('./slices/*.js', { eager: true });
//
// const importedReducers = Object.values(modules).reduce((acc, mod) => {
//   const slice = mod.default;
//   if (!slice?.name || !slice?.reducer) return acc;
//   return { ...acc, [slice.name]: slice.reducer };
// }, {});

const rootReducer = combineReducers({
  // ...importedReducers
  auth
})

export default rootReducer;
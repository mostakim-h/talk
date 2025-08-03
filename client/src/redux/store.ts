import storage from 'redux-persist/lib/storage'
import rootReducer from "./rootReducer.js";
import {persistReducer, persistStore} from "redux-persist";
import {configureStore} from "@reduxjs/toolkit";

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'], // Specify which reducers to persist
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
// src/reducers/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import authReducer from "../reducer/authSlice/authSlice";

/** Avoid importing default redux-persist storage on the server (it touches localStorage and logs errors). */
const createNoopStorage = () => ({
  getItem(_key: string): Promise<string | null> {
    return Promise.resolve(null);
  },
  setItem(_key: string, _value: string): Promise<void> {
    return Promise.resolve();
  },
  removeItem(_key: string): Promise<void> {
    return Promise.resolve();
  },
});

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authStates"],
};

const appReducer = combineReducers({
  authStates: authReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET") {
    // Clear the persisted storage
    void storage.removeItem("persist:root");
    // Reset the state to undefined, effectively clearing all slices
    state = undefined;
  }
  return appReducer(state, action);
};

export default persistReducer(persistConfig, rootReducer);

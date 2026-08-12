import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import taskReducer from "./slices/task.slice";
import themeReducer from "./slices/theme.slice";
import syncReducer from "./slices/sync.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    theme: themeReducer,
    sync: syncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import taskReducer from "./slices/task.slice";
import themeReducer from "./slices/theme.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types from serialization checks
        // They come from Firebase and are not serializable
        ignoredActions: [
          "auth/setUser",
          "@@INIT",
        ],
        // Ignore these paths in the state tree
        ignoredPaths: [
          "auth.user", // Firebase User object is not serializable
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as authService from "../../services/auth.service";
import type { AppUser } from "../../services/auth.service";

export interface AuthState {
  user: AppUser | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: AuthState = { user: null, status: "idle", error: null };

export const loginThunk = createAsyncThunk<AppUser, { email: string; password: string }>(
  "auth/login",
  (credentials) => authService.login(credentials.email, credentials.password),
);

export const signupThunk = createAsyncThunk<AppUser, { email: string; password: string }>(
  "auth/signup",
  (credentials) => authService.signup(credentials.email, credentials.password),
);

export const logoutThunk = createAsyncThunk<void, void>("auth/logout", () => authService.logout());

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AppUser | null>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Login failed";
      })
      .addCase(signupThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Signup failed";
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;

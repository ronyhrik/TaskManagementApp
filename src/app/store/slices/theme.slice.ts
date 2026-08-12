import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ThemeMode } from "../../config/theme";
import { loadStoredThemeMode, saveThemeMode } from "../../datasources/theme.storage";

export interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: "light",
};

export const hydrateThemeThunk = createAsyncThunk<ThemeMode | null, void>("theme/hydrate", () => loadStoredThemeMode());

export const setThemeThunk = createAsyncThunk<ThemeMode, ThemeMode>("theme/set", async (mode) => {
  await saveThemeMode(mode);
  return mode;
});

export const toggleThemeThunk = createAsyncThunk<ThemeMode, void, { state: { theme: ThemeState } }>(
  "theme/toggle",
  async (_arg, { getState }) => {
    const nextMode: ThemeMode = getState().theme.mode === "light" ? "dark" : "light";
    await saveThemeMode(nextMode);
    return nextMode;
  },
);

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hydrateThemeThunk.fulfilled, (state, action) => {
        if (action.payload) state.mode = action.payload;
      })
      .addCase(setThemeThunk.fulfilled, (state, action) => {
        state.mode = action.payload;
      })
      .addCase(toggleThemeThunk.fulfilled, (state, action) => {
        state.mode = action.payload;
      });
  },
});

export const selectThemeMode = (state: { theme: ThemeState }) => state.theme.mode;
export default themeSlice.reducer;

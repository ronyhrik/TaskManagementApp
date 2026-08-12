import { createSlice } from "@reduxjs/toolkit";
import { syncTasksThunk } from "./task.slice";

export type SyncState = {
  isSyncing: boolean;
  lastSyncAt: number | null;
  error: string | null;
};

const initialState: SyncState = {
  isSyncing: false,
  lastSyncAt: null,
  error: null,
};

const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    resetSyncError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncTasksThunk.pending, (state) => {
        state.isSyncing = true;
        state.error = null;
      })
      .addCase(syncTasksThunk.fulfilled, (state) => {
        state.isSyncing = false;
        state.lastSyncAt = Date.now();
      })
      .addCase(syncTasksThunk.rejected, (state, action) => {
        state.isSyncing = false;
        state.error = action.error.message ?? "Sync failed";
      });
  },
});

export const { resetSyncError } = syncSlice.actions;
export const selectSyncState = (state: { sync: SyncState }) => state.sync;
export default syncSlice.reducer;

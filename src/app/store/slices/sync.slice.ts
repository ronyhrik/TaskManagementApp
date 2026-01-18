import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    syncStart: (state) => {
      state.isSyncing = true;
      state.error = null;
    },

    syncSuccess: (state) => {
      state.isSyncing = false;
      state.lastSyncAt = Date.now();
      state.error = null;
    },

    syncFailure: (state, action: PayloadAction<string>) => {
      state.isSyncing = false;
      state.error = action.payload;
    },

    resetSyncError: (state) => {
      state.error = null;
    },
  },
});

export const {
  syncStart,
  syncSuccess,
  syncFailure,
  resetSyncError,
} = syncSlice.actions;

export default syncSlice.reducer;

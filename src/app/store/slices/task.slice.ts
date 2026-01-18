import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: number;
  syncStatus: "pending" | "synced";
  reminderTime?: number; // timestamp in ms
};

const taskSlice = createSlice({
  name: "tasks",
  initialState: [] as Task[],
  reducers: {
    setTasks: (_, action: PayloadAction<Task[]>) => action.payload,
    addTask: (state, action: PayloadAction<Task>) => {
      state.unshift(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const i = state.findIndex(t => t.id === action.payload.id);
      if (i !== -1) state[i] = action.payload;
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      const index = state.findIndex(t => t.id === action.payload);
      if (index !== -1) state.splice(index, 1);
    },
  },
});

export const { setTasks, addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;

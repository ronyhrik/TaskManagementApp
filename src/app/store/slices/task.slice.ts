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
    setTasks: (_state: Task[], action: PayloadAction<Task[]>) => action.payload,
    addTask: (state: Task[], action: PayloadAction<Task>) => {
      state.unshift(action.payload);
    },
    updateTask: (state: Task[], action: PayloadAction<Task>) => {
      const i = state.findIndex((t: Task) => t.id === action.payload.id);
      if (i !== -1) state[i] = action.payload;
    },
    deleteTask: (state: Task[], action: PayloadAction<string>) => {
      const index = state.findIndex((t: Task) => t.id === action.payload);
      if (index !== -1) state.splice(index, 1);
    },
  },
});

export const { setTasks, addTask, updateTask, deleteTask } = taskSlice.actions;
export default taskSlice.reducer;

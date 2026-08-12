import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import * as taskService from "../../services/task.service";
import type { Task } from "../../types/task";

export type { Task };

export const loadTasksThunk = createAsyncThunk<Task[]>("tasks/load", () => taskService.loadTasks());

export const createTaskThunk = createAsyncThunk<Task, { title: string; reminderTime?: Date }>(
  "tasks/create",
  ({ title, reminderTime }) => taskService.createTask(title, reminderTime),
);

export const updateTaskThunk = createAsyncThunk<Task, { task: Task; reminderTime?: Date }>(
  "tasks/update",
  ({ task, reminderTime }) => taskService.updateTask(task, reminderTime),
);

export const toggleTaskThunk = createAsyncThunk<Task, Task>("tasks/toggle", (task) => taskService.toggleTask(task));

export const deleteTaskThunk = createAsyncThunk<string, string>("tasks/delete", async (taskId) => {
  await taskService.deleteTaskById(taskId);
  return taskId;
});

export const clearTasksThunk = createAsyncThunk<void, void>("tasks/clear", () => taskService.clearAllTasks());

export const syncTasksThunk = createAsyncThunk<Task[], string>("tasks/sync", (userId) => taskService.syncTasks(userId));

const applyTaskUpdate = (state: Task[], action: PayloadAction<Task>) => {
  const index = state.findIndex((task) => task.id === action.payload.id);
  if (index !== -1) state[index] = action.payload;
};

const taskSlice = createSlice({
  name: "tasks",
  initialState: [] as Task[],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadTasksThunk.fulfilled, (_state, action) => action.payload)
      .addCase(syncTasksThunk.fulfilled, (_state, action) => action.payload)
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.unshift(action.payload);
      })
      .addCase(updateTaskThunk.fulfilled, applyTaskUpdate)
      .addCase(toggleTaskThunk.fulfilled, applyTaskUpdate)
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        const index = state.findIndex((task) => task.id === action.payload);
        if (index !== -1) state.splice(index, 1);
      })
      .addCase(clearTasksThunk.fulfilled, () => []);
  },
});

export const selectTasks = (state: { tasks: Task[] }) => state.tasks;
export default taskSlice.reducer;

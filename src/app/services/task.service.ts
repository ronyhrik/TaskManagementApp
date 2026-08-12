import * as localDatasource from "../datasources/task.local.datasource";
import * as remoteDatasource from "../datasources/task.remote.datasource";
import { scheduleTaskNotification, cancelTaskNotification } from "./notification.service";
import type { Task } from "../types/task";

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const loadTasks = (): Promise<Task[]> => localDatasource.getAllTasks();

export const createTask = async (title: string, reminderTime?: Date): Promise<Task> => {
  const task: Task = {
    id: generateId(),
    title,
    completed: false,
    updatedAt: Date.now(),
    syncStatus: "pending",
    reminderTime: reminderTime?.getTime(),
  };

  await localDatasource.insertTask(task);

  if (task.reminderTime) {
    await scheduleTaskNotification(task.id, task.title, new Date(task.reminderTime));
  }

  return task;
};

export const updateTask = async (task: Task, reminderTime?: Date): Promise<Task> => {
  const updatedTask: Task = {
    ...task,
    updatedAt: Date.now(),
    syncStatus: "pending",
    reminderTime: reminderTime ? reminderTime.getTime() : task.reminderTime,
  };

  await localDatasource.updateTaskRow(updatedTask);
  await cancelTaskNotification(updatedTask.id);

  if (!updatedTask.completed && updatedTask.reminderTime) {
    await scheduleTaskNotification(updatedTask.id, updatedTask.title, new Date(updatedTask.reminderTime));
  }

  return updatedTask;
};

export const toggleTask = (task: Task): Promise<Task> =>
  updateTask({ ...task, completed: !task.completed }, task.reminderTime ? new Date(task.reminderTime) : undefined);

export const deleteTaskById = async (taskId: string): Promise<void> => {
  await localDatasource.deleteTaskRow(taskId);
  await cancelTaskNotification(taskId);
};

export const clearAllTasks = (): Promise<void> => localDatasource.clearAllTaskRows();

// Push pending local changes, then pull remote changes, resolving conflicts last-write-wins by `updatedAt`.
export const syncTasks = async (userId: string): Promise<Task[]> => {
  const localTasks = await localDatasource.getAllTasks();
  const pendingTasks = localTasks.filter((task) => task.syncStatus === "pending");

  for (const task of pendingTasks) {
    await remoteDatasource.pushTask(userId, task);
    await localDatasource.upsertTask({ ...task, syncStatus: "synced" });
  }

  const remoteTasks = await remoteDatasource.pullTasks(userId);
  const localMap = new Map(localTasks.map((task) => [task.id, task]));

  for (const remoteTask of remoteTasks) {
    const localTask = localMap.get(remoteTask.id);
    if (!localTask || remoteTask.updatedAt > localTask.updatedAt) {
      await localDatasource.upsertTask(remoteTask);
    }
  }

  return localDatasource.getAllTasks();
};

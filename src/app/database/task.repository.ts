import db from "./sqlite";
import { store } from "../store";
import { addTask, setTasks, updateTask, Task } from "../store/slices/task.slice";
import {
  scheduleTaskNotification,
  cancelTaskNotification,
} from "../services/notification.service";

/**
 * Generate simple unique ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Map DB row to Task
 */
const mapRowToTask = (row: any): Task => ({
  id: row.id,
  title: row.title,
  completed: !!row.completed,
  updatedAt: row.updatedAt,
  syncStatus: row.syncStatus,
  reminderTime: row.reminderTime ?? undefined,
});

/**
 * Load all tasks from SQLite into Redux
 */
export const loadTasksFromDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        "SELECT * FROM tasks ORDER BY updatedAt DESC",
        [],
        (_: any, result: any) => {
          const rows = result.rows.raw();
          const tasks = rows.map(mapRowToTask);
          store.dispatch(setTasks(tasks));
          resolve();
        },
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Add new task with optional reminder
 */
export const createTask = (title: string, reminderTime?: Date): Promise<void> => {
  const task: Task = {
    id: generateId(),
    title,
    completed: false,
    updatedAt: Date.now(),
    syncStatus: "pending",
    reminderTime: reminderTime?.getTime(),
  };

  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `
        INSERT INTO tasks (id, title, completed, updatedAt, syncStatus, reminderTime)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          task.id,
          task.title,
          0,
          task.updatedAt,
          task.syncStatus,
          task.reminderTime ?? null,
        ],
        () => {
          store.dispatch(addTask(task));

          // Schedule local notification if reminder exists
          if (task.reminderTime) {
            scheduleTaskNotification(
              task.id,
              task.title,
              new Date(task.reminderTime)
            );
          }

          resolve();
        },
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Update existing task
 */
export const updateExistingTask = (
  task: Task,
  reminderTime?: Date
): Promise<void> => {
  const updatedTask: Task = {
    ...task,
    updatedAt: Date.now(),
    syncStatus: "pending",
    reminderTime: reminderTime
      ? reminderTime.getTime()
      : task.reminderTime,
  };

  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `
        UPDATE tasks
        SET title = ?, completed = ?, updatedAt = ?, syncStatus = ?, reminderTime = ?
        WHERE id = ?
        `,
        [
          updatedTask.title,
          updatedTask.completed ? 1 : 0,
          updatedTask.updatedAt,
          updatedTask.syncStatus,
          updatedTask.reminderTime ?? null,
          updatedTask.id,
        ],
        () => {
          store.dispatch(updateTask(updatedTask));

          // Cancel old notification
          cancelTaskNotification(updatedTask.id);

          // Re-schedule if needed
          if (!updatedTask.completed && updatedTask.reminderTime) {
            scheduleTaskNotification(
              updatedTask.id,
              updatedTask.title,
              new Date(updatedTask.reminderTime)
            );
          }

          resolve();
        },
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

/**
 * Toggle task completed
 */
export const toggleTaskCompleted = (task: Task): Promise<void> => {
  return updateExistingTask(
    { ...task, completed: !task.completed },
    task.reminderTime ? new Date(task.reminderTime) : undefined
  );
};

/**
 * Delete task and cancel notification
 */
export const deleteTask = (taskId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM tasks WHERE id = ?",
        [taskId],
        () => {
          loadTasksFromDB();
          cancelTaskNotification(taskId);
          resolve();
        },
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

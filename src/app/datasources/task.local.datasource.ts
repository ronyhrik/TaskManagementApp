import type { SQLTransaction } from "react-native-sqlite-storage";
import db from "../database/sqlite";
import type { Task } from "../types/task";

const mapRowToTask = (row: any): Task => ({
  id: row.id,
  title: row.title,
  completed: !!row.completed,
  updatedAt: row.updatedAt,
  syncStatus: row.syncStatus,
  reminderTime: row.reminderTime ?? undefined,
});

export const getAllTasks = (): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        "SELECT * FROM tasks ORDER BY updatedAt DESC",
        [],
        (_tx, result) => resolve(result.rows.raw().map(mapRowToTask)),
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const insertTask = (task: Task): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        `INSERT INTO tasks (id, title, completed, updatedAt, syncStatus, reminderTime)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [task.id, task.title, task.completed ? 1 : 0, task.updatedAt, task.syncStatus, task.reminderTime ?? null],
        () => resolve(),
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const updateTaskRow = (task: Task): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        `UPDATE tasks SET title = ?, completed = ?, updatedAt = ?, syncStatus = ?, reminderTime = ?
         WHERE id = ?`,
        [task.title, task.completed ? 1 : 0, task.updatedAt, task.syncStatus, task.reminderTime ?? null, task.id],
        () => resolve(),
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const upsertTask = (task: Task): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        `INSERT OR REPLACE INTO tasks (id, title, completed, updatedAt, syncStatus, reminderTime)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [task.id, task.title, task.completed ? 1 : 0, task.updatedAt, task.syncStatus, task.reminderTime ?? null],
        () => resolve(),
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const deleteTaskRow = (taskId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        "DELETE FROM tasks WHERE id = ?",
        [taskId],
        () => resolve(),
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

export const clearAllTaskRows = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: SQLTransaction) => {
      tx.executeSql(
        "DELETE FROM tasks",
        [],
        () => resolve(),
        (_tx, error) => {
          reject(error);
          return false;
        },
      );
    });
  });
};

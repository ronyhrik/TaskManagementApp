import firestore from "@react-native-firebase/firestore";
import db from "./sqlite";
import { store } from "../store";
import {
  syncStart,
  syncSuccess,
  syncFailure,
} from "../store/slices/sync.slice";
import { setTasks, Task } from "../store/slices/task.slice";


//Get all local tasks
const getLocalTasks = (): Promise<Task[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        "SELECT * FROM tasks",
        [],
        (_: any, result: any) => {
          const rows = result.rows.raw();
          const tasks: Task[] = rows.map((r: any) => ({
            id: r.id,
            title: r.title,
            completed: !!r.completed,
            updatedAt: r.updatedAt,
            syncStatus: r.syncStatus,
            reminderTime: r.reminderTime ?? undefined,
          }));
          resolve(tasks);
        },
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};


//Insert or update task in SQLite
const upsertLocalTask = (task: Task): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `
        INSERT OR REPLACE INTO tasks
        (id, title, completed, updatedAt, syncStatus, reminderTime)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          task.id,
          task.title,
          task.completed ? 1 : 0,
          task.updatedAt,
          task.syncStatus,
          task.reminderTime ?? null,
        ],
        () => resolve(),
        (_: any, error: any) => {
          reject(error);
          return false;
        }
      );
    });
  });
};


  //MAIN SYNC FUNCTION

export const syncTasks = async (userId: string) => {
  const dispatch = store.dispatch;

  try {
    dispatch(syncStart());

    const localTasks = await getLocalTasks();
    const pendingTasks = localTasks.filter((t) => t.syncStatus === "pending");

    const userTasksRef = firestore()
      .collection("users")
      .doc(userId)
      .collection("tasks");


     //PUSH local pending tasks to Firestore

    for (const task of pendingTasks) {
      await userTasksRef.doc(task.id).set({
        title: task.title,
        completed: task.completed,
        updatedAt: task.updatedAt,
        reminderTime: task.reminderTime ?? null,
      });

      await upsertLocalTask({
        ...task,
        syncStatus: "synced",
      });
    }


     // PULL remote tasks

    const snapshot = await userTasksRef.get();

    const remoteTasks: Task[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        completed: data.completed,
        updatedAt: data.updatedAt,
        reminderTime: data.reminderTime ?? undefined,
        syncStatus: "synced",
      };
    });

      
    const localMap = new Map(localTasks.map((t) => [t.id, t]));

    for (const remoteTask of remoteTasks) {
      const localTask = localMap.get(remoteTask.id);

      if (!localTask) {
        // New remote insert locally
        await upsertLocalTask(remoteTask);
      } else {
        // Conflict resolution
        if (remoteTask.updatedAt > localTask.updatedAt) {
          await upsertLocalTask(remoteTask);
        }
      }
    }

   //Reload local DB Redux
    const finalLocalTasks = await getLocalTasks();
    dispatch(setTasks(finalLocalTasks));

    dispatch(syncSuccess());
  } catch (error: any) {
    console.error("Sync failed:", error);
    dispatch(syncFailure(error.message || "Sync failed"));
  }
};

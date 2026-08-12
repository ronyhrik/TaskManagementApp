import { collection, doc, getDocs, setDoc, type FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { getFirestoreDB } from "../config/firebase";
import type { Task } from "../types/task";

const tasksCollection = (userId: string) => collection(getFirestoreDB(), "users", userId, "tasks");

export const pushTask = async (userId: string, task: Task): Promise<void> => {
  await setDoc(doc(tasksCollection(userId), task.id), {
    title: task.title,
    completed: task.completed,
    updatedAt: task.updatedAt,
    reminderTime: task.reminderTime ?? null,
  });
};

export const pullTasks = async (userId: string): Promise<Task[]> => {
  const snapshot = await getDocs(tasksCollection(userId));

  return snapshot.docs.map((docSnapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      title: data.title,
      completed: data.completed,
      updatedAt: data.updatedAt,
      reminderTime: data.reminderTime ?? undefined,
      syncStatus: "synced" as const,
    };
  });
};

export const setUserFcmToken = async (userId: string, token: string): Promise<void> => {
  await setDoc(doc(getFirestoreDB(), "users", userId), { fcmToken: token }, { merge: true });
};

export type SyncStatus = "pending" | "synced";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: number;
  syncStatus: SyncStatus;
  reminderTime?: number;
};

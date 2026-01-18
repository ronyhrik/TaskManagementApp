import SQLite from "react-native-sqlite-storage";

const db = SQLite.openDatabase({ name: "tasks.db", location: "default" });

export const initDB = () => {
  db.transaction((tx: any) => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT,
        completed INTEGER,
        updatedAt INTEGER,
        syncStatus TEXT,
        reminderTime INTEGER
      );
    `);
  });
};

export default db;

declare module "react-native-sqlite-storage" {
  export interface SQLResultSet {
    rows: {
      length: number;
      item: (index: number) => any;
      raw: () => any[];
    };
    rowsAffected: number;
    insertId: number;
  }

  export interface SQLTransaction {
    executeSql(
      sql: string,
      args?: any[],
      success?: (tx: SQLTransaction, result: SQLResultSet) => void,
      error?: (tx: SQLTransaction, error: any) => boolean
    ): void;
  }

  export interface SQLDatabase {
    transaction(
      callback: (tx: SQLTransaction) => void,
      error?: (error: any) => void,
      success?: () => void
    ): void;
    close(success?: () => void, error?: (error: any) => void): void;
  }

  export interface OpenDatabaseOptions {
    name: string;
    location?: string;
    version?: string;
    displayName?: string;
    size?: number;
    iosDatabaseLocation?: string;
  }

  namespace SQLite {
    function openDatabase(
      options: OpenDatabaseOptions,
      success?: (db: SQLDatabase) => void,
      error?: (error: any) => void
    ): SQLDatabase;
  }

  export default SQLite;
}

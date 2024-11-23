import * as SQLite from "expo-sqlite";

export class DB {
  private static db: SQLite.SQLiteDatabase | null = null;

  static async init() {
    this.db = await SQLite.openDatabaseAsync("logs", {
      enableChangeListener: true,
    });
    await this.db!.execAsync(
      `CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY NOT NULL, 
          title TEXT, 
          path TEXT, 
          date INTEGER, 
          duration INTEGER, 
          meters TEXT, 
          markers TEXT, 
          transcript TEXT,
          isTranscribed INTEGER DEFAULT 0,
          trashed INTEGER DEFAULT 0
        );`
    );
  }

  static async query(sql: string, params: any[] = []) {
    if (this.db === null) {
      await this.init();
    }
    return await this.db!.runAsync(sql, params);
  }

  static async get(sql: string) {
    if (this.db === null) {
      await this.init();
    }
    return await this.db!.getAllAsync(sql);
  }
}

export interface LogSchema {
  id: number;
  title: string;
  path: string;
  date: number;
  duration: number;
  meters: string;
  markers: string;
  transcript: string;
  isTranscribed?: 0 | 1;
  trashed?: 0 | 1;
}

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "flipper.db");

let db: Database.Database | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'other',
      status TEXT NOT NULL DEFAULT 'planned',
      summary TEXT,
      target_brand TEXT,
      target_model TEXT,
      frequency TEXT,
      protocol TEXT,
      code_type TEXT,
      flipper_protocol TEXT,
      outcome_notes TEXT,
      safety_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activity_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      position INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_artifacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'file',
      path_or_url TEXT,
      notes TEXT,
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    );
  `);
}

export function getDb() {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

export function touchActivity(activityId: number) {
  getDb()
    .prepare(`UPDATE activities SET updated_at = datetime('now') WHERE id = ?`)
    .run(activityId);
}

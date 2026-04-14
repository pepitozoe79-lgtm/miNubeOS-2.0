import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export let db: any;

export async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'system.db'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS system_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      level TEXT CHECK(level IN ('INFO', 'WARN', 'ERROR')),
      source TEXT,
      message TEXT
    );

    CREATE TABLE IF NOT EXISTS libraries (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      mount_point TEXT UNIQUE,
      uuid TEXT,
      fs_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS remote_apps (
      id TEXT PRIMARY KEY,
      store TEXT,
      original_id TEXT,
      name TEXT,
      docker_image TEXT,
      required_volumes TEXT,
      is_local INTEGER DEFAULT 0,
      raw_compose TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  console.log('📦 Base de datos inicializada');
  return db;
}

import * as SQLite from 'expo-sqlite';

// BD local on-device. Sem nuvem, sem contas — privacidade primeiro.
let db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('steady.db');
  await migrate(db);
  return db;
}

async function migrate(d: SQLite.SQLiteDatabase) {
  await d.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS injections (
      id TEXT PRIMARY KEY NOT NULL,
      date INTEGER NOT NULL,
      dose_mg REAL NOT NULL,
      site TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS weights (
      id TEXT PRIMARY KEY NOT NULL,
      date INTEGER NOT NULL,
      weight_kg REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS side_effects (
      id TEXT PRIMARY KEY NOT NULL,
      date INTEGER NOT NULL,
      type TEXT NOT NULL,
      severity INTEGER NOT NULL,
      note TEXT
    );

    CREATE TABLE IF NOT EXISTS water (
      id TEXT PRIMARY KEY NOT NULL,
      date INTEGER NOT NULL,
      amount_ml INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      height_cm REAL,
      weight_goal_kg REAL,
      medication TEXT,
      units TEXT DEFAULT 'kg'
    );
  `);
}

// ---- Injeções ----
export interface InjectionRow {
  id: string;
  date: number;
  dose_mg: number;
  site: string | null;
  notes: string | null;
}

export async function addInjection(row: InjectionRow) {
  const d = await getDb();
  await d.runAsync(
    'INSERT INTO injections (id, date, dose_mg, site, notes) VALUES (?, ?, ?, ?, ?)',
    [row.id, row.date, row.dose_mg, row.site, row.notes]
  );
}

export async function getInjections(): Promise<InjectionRow[]> {
  const d = await getDb();
  return d.getAllAsync<InjectionRow>('SELECT * FROM injections ORDER BY date ASC');
}

export async function deleteInjection(id: string) {
  const d = await getDb();
  await d.runAsync('DELETE FROM injections WHERE id = ?', [id]);
}

// ---- Peso ----
export interface WeightRow { id: string; date: number; weight_kg: number; }

export async function addWeight(row: WeightRow) {
  const d = await getDb();
  await d.runAsync(
    'INSERT INTO weights (id, date, weight_kg) VALUES (?, ?, ?)',
    [row.id, row.date, row.weight_kg]
  );
}

export async function getWeights(): Promise<WeightRow[]> {
  const d = await getDb();
  return d.getAllAsync<WeightRow>('SELECT * FROM weights ORDER BY date ASC');
}

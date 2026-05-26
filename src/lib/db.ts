import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'briefforge.sqlite');
const SCHEMA_VERSION = 1;

interface SqliteRunResult {
  changes: number;
  lastInsertRowid: number | bigint;
}

interface SqliteStatement {
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
  run(...params: unknown[]): SqliteRunResult;
}

interface SqliteDatabase {
  exec(sql: string): void;
  prepare(sql: string): SqliteStatement;
}

interface SqliteModule {
  DatabaseSync: new (path: string) => SqliteDatabase;
}

const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as SqliteModule;

let sqlite: SqliteDatabase | null = null;

export class ProjectDatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ProjectDatabaseError';
  }
}

export interface ProjectRow {
  id: number;
  client_name: string;
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
  briefing: string;
  ai_model: string;
  created_at: string;
  updated_at: string;
}

export interface AgentSkill {
  name: string;
  description: string;
  when_to_use: string;
  instructions: string[];
  quality_checks: string[];
}

export interface AgentSkillsByStage {
  briefing: AgentSkill;
  brand: AgentSkill;
  moodboard: AgentSkill;
  prompts: AgentSkill;
  deliverables: AgentSkill;
}

export interface BriefingData {
  client: {
    name: string;
    segment: string;
    location: string;
    short_description: string;
    brand_story: string;
    main_problem: string;
    business_goal: string;
  };
  audience: {
    primary_audience: string;
    pain_points: string[];
    desires: string[];
  };
  brand: {
    personality: string[];
    tone_of_voice: string;
    positioning: string;
    tagline: string;
  };
  visual_identity: {
    logo_direction: string;
    color_palette: Array<{
      name: string;
      hex: string;
      usage: string;
    }>;
    typography: {
      heading: string;
      body: string;
      accent: string;
    };
  };
  moodboard: {
    keywords: string[];
    visual_references: string[];
    photography_style: string;
    layout_style: string;
    texture_and_materials: string[];
  };
  deliverables: string[];
  portfolio_project_ideas: string[];
  prompts: {
    landing_page_prompt: string;
    logo_prompt: string;
    moodboard_image_prompt: string;
    social_media_prompt: string;
    lovable_or_cursor_prompt: string;
    master_execution_prompt: string;
  };
  agent_skills: AgentSkillsByStage;
}

export function isProjectDatabaseError(error: unknown): error is ProjectDatabaseError {
  return error instanceof ProjectDatabaseError;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function migrate(db: SqliteDatabase): void {
  const versionRow = db.prepare('PRAGMA user_version').get() as { user_version: number };
  const currentVersion = versionRow.user_version;

  if (currentVersion > SCHEMA_VERSION) {
    throw new ProjectDatabaseError('Project database schema is newer than this application');
  }

  if (currentVersion === SCHEMA_VERSION) {
    return;
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        business_type TEXT NOT NULL,
        visual_style TEXT NOT NULL,
        project_goal TEXT NOT NULL,
        language TEXT NOT NULL,
        complexity TEXT NOT NULL,
        briefing TEXT NOT NULL CHECK (json_valid(briefing)),
        ai_model TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_projects_created_at
        ON projects(created_at DESC);

      PRAGMA user_version = ${SCHEMA_VERSION};
    `);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function getDb(): SqliteDatabase {
  if (sqlite) {
    return sqlite;
  }

  ensureDataDir();

  try {
    sqlite = new DatabaseSync(DB_PATH);
    sqlite.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
    `);
    migrate(sqlite);
    return sqlite;
  } catch (error) {
    sqlite = null;
    throw new ProjectDatabaseError('Failed to initialize SQLite database', { cause: error });
  }
}

function runDb<T>(operation: (db: SqliteDatabase) => T): T {
  try {
    return operation(getDb());
  } catch (error) {
    if (error instanceof ProjectDatabaseError) {
      throw error;
    }

    throw new ProjectDatabaseError('Project database operation failed', { cause: error });
  }
}

export function getAllProjects(): ProjectRow[] {
  return runDb((db) =>
    db
      .prepare('SELECT * FROM projects ORDER BY datetime(created_at) DESC, id DESC')
      .all() as ProjectRow[]
  );
}

export function getProjectPreviews(): Array<{
  id: number;
  client_name: string;
  business_type: string;
  visual_style: string;
  project_goal: string;
  ai_model: string;
  created_at: string;
}> {
  return runDb((db) =>
    db
      .prepare(`
        SELECT id, client_name, business_type, visual_style, project_goal, ai_model, created_at
        FROM projects
        ORDER BY datetime(created_at) DESC, id DESC
      `)
      .all() as Array<{
        id: number;
        client_name: string;
        business_type: string;
        visual_style: string;
        project_goal: string;
        ai_model: string;
        created_at: string;
      }>
  );
}

export function getProjectById(id: number): ProjectRow | undefined {
  return runDb((db) =>
    db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined
  );
}

export function createProject(data: {
  client_name: string;
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
  briefing: string;
  ai_model: string;
}): ProjectRow {
  return runDb((db) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const now = new Date().toISOString();
      const result = db
        .prepare(`
          INSERT INTO projects (
            client_name,
            business_type,
            visual_style,
            project_goal,
            language,
            complexity,
            briefing,
            ai_model,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          data.client_name,
          data.business_type,
          data.visual_style,
          data.project_goal,
          data.language,
          data.complexity,
          data.briefing,
          data.ai_model,
          now,
          now
        );

      const id = Number(result.lastInsertRowid);
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as
        | ProjectRow
        | undefined;

      if (!project) {
        throw new ProjectDatabaseError('Created project could not be loaded');
      }

      db.exec('COMMIT');
      return project;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  });
}

export function deleteProject(id: number): boolean {
  return runDb((db) => {
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
    return result.changes > 0;
  });
}

import fs from 'fs';
import { randomBytes } from 'crypto';
import { createRequire } from 'module';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'briefforge.sqlite');
const SCHEMA_VERSION = 2;

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
  parent_id: number | null;
  version: number;
  client_name: string;
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
  briefing: string;
  ai_model: string;
  share_id: string | null;
  is_public: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectPreview {
  id: number;
  parent_id: number | null;
  version: number;
  client_name: string;
  business_type: string;
  visual_style: string;
  project_goal: string;
  ai_model: string;
  is_public: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectPreviewFilters {
  q?: string;
  business_type?: string;
  visual_style?: string;
  project_goal?: string;
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
    logo_concept_board?: {
      concept_name: string;
      logo_type: string;
      composition: string;
      symbol_meaning: string[];
      required_variations: string[];
      board_sections: string[];
      production_notes: string[];
    };
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
    logo_concept_board_prompt?: string;
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

function getProjectColumns(db: SqliteDatabase): Set<string> {
  const rows = db.prepare('PRAGMA table_info(projects)').all() as Array<{ name: string }>;
  return new Set(rows.map((row) => row.name));
}

function ensureProjectColumns(db: SqliteDatabase): void {
  const columns = getProjectColumns(db);

  if (!columns.has('parent_id')) {
    db.exec('ALTER TABLE projects ADD COLUMN parent_id INTEGER REFERENCES projects(id) ON DELETE SET NULL');
  }

  if (!columns.has('version')) {
    db.exec('ALTER TABLE projects ADD COLUMN version INTEGER NOT NULL DEFAULT 1');
  }

  if (!columns.has('share_id')) {
    db.exec('ALTER TABLE projects ADD COLUMN share_id TEXT');
  }

  if (!columns.has('is_public')) {
    db.exec('ALTER TABLE projects ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1))');
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
        parent_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
        version INTEGER NOT NULL DEFAULT 1,
        client_name TEXT NOT NULL,
        business_type TEXT NOT NULL,
        visual_style TEXT NOT NULL,
        project_goal TEXT NOT NULL,
        language TEXT NOT NULL,
        complexity TEXT NOT NULL,
        briefing TEXT NOT NULL CHECK (json_valid(briefing)),
        ai_model TEXT NOT NULL,
        share_id TEXT,
        is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0, 1)),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    ensureProjectColumns(db);

    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_projects_created_at
        ON projects(created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_projects_parent_id
        ON projects(parent_id);

      CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_share_id
        ON projects(share_id)
        WHERE share_id IS NOT NULL;

      CREATE INDEX IF NOT EXISTS idx_projects_filters
        ON projects(business_type, visual_style, project_goal);

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

export function getProjectPreviews(filters: ProjectPreviewFilters = {}): ProjectPreview[] {
  return runDb((db) => {
    const where: string[] = [];
    const params: unknown[] = [];

    if (filters.q?.trim()) {
      where.push('(client_name LIKE ? OR business_type LIKE ? OR visual_style LIKE ? OR project_goal LIKE ?)');
      const q = `%${filters.q.trim()}%`;
      params.push(q, q, q, q);
    }

    if (filters.business_type) {
      where.push('business_type = ?');
      params.push(filters.business_type);
    }

    if (filters.visual_style) {
      where.push('visual_style = ?');
      params.push(filters.visual_style);
    }

    if (filters.project_goal) {
      where.push('project_goal = ?');
      params.push(filters.project_goal);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    return db
      .prepare(`
        SELECT
          id,
          parent_id,
          version,
          client_name,
          business_type,
          visual_style,
          project_goal,
          ai_model,
          is_public,
          created_at,
          updated_at
        FROM projects
        ${whereSql}
        ORDER BY datetime(created_at) DESC, id DESC
      `)
      .all(...params) as ProjectPreview[];
  });
}

export function getProjectById(id: number): ProjectRow | undefined {
  return runDb((db) =>
    db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined
  );
}

export function createProject(data: {
  parent_id?: number | null;
  version?: number;
  client_name: string;
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
  briefing: string;
  ai_model: string;
  share_id?: string | null;
  is_public?: boolean;
}): ProjectRow {
  return runDb((db) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const now = new Date().toISOString();
      const result = db
        .prepare(`
          INSERT INTO projects (
            parent_id,
            version,
            client_name,
            business_type,
            visual_style,
            project_goal,
            language,
            complexity,
            briefing,
            ai_model,
            share_id,
            is_public,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `)
        .run(
          data.parent_id ?? null,
          data.version ?? 1,
          data.client_name,
          data.business_type,
          data.visual_style,
          data.project_goal,
          data.language,
          data.complexity,
          data.briefing,
          data.ai_model,
          data.share_id ?? null,
          data.is_public ? 1 : 0,
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

export function duplicateProject(id: number): ProjectRow | undefined {
  return runDb((db) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const source = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as
        | ProjectRow
        | undefined;

      if (!source) {
        db.exec('ROLLBACK');
        return undefined;
      }

      const rootId = source.parent_id ?? source.id;
      const versionRow = db
        .prepare('SELECT COALESCE(MAX(version), 0) + 1 AS next_version FROM projects WHERE id = ? OR parent_id = ?')
        .get(rootId, rootId) as { next_version: number };
      const now = new Date().toISOString();
      const result = db
        .prepare(`
          INSERT INTO projects (
            parent_id,
            version,
            client_name,
            business_type,
            visual_style,
            project_goal,
            language,
            complexity,
            briefing,
            ai_model,
            share_id,
            is_public,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?)
        `)
        .run(
          rootId,
          versionRow.next_version,
          source.client_name,
          source.business_type,
          source.visual_style,
          source.project_goal,
          source.language,
          source.complexity,
          source.briefing,
          source.ai_model,
          now,
          now
        );

      const duplicated = db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(result.lastInsertRowid)) as
        | ProjectRow
        | undefined;

      if (!duplicated) {
        throw new ProjectDatabaseError('Duplicated project could not be loaded');
      }

      db.exec('COMMIT');
      return duplicated;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  });
}

export function updateProjectBriefing(id: number, briefing: string, ai_model: string): ProjectRow | undefined {
  return runDb((db) => {
    const now = new Date().toISOString();
    const result = db
      .prepare('UPDATE projects SET briefing = ?, ai_model = ?, updated_at = ? WHERE id = ?')
      .run(briefing, ai_model, now, id);

    if (result.changes === 0) {
      return undefined;
    }

    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;
  });
}

export function setProjectPublic(id: number, isPublic: boolean): ProjectRow | undefined {
  return runDb((db) => {
    db.exec('BEGIN IMMEDIATE');
    try {
      const current = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;

      if (!current) {
        db.exec('ROLLBACK');
        return undefined;
      }

      const shareId = isPublic ? current.share_id ?? randomBytes(12).toString('hex') : current.share_id;
      const now = new Date().toISOString();

      db
        .prepare('UPDATE projects SET share_id = ?, is_public = ?, updated_at = ? WHERE id = ?')
        .run(shareId, isPublic ? 1 : 0, now, id);

      const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow | undefined;

      db.exec('COMMIT');
      return updated;
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  });
}

export function getProjectByShareId(shareId: string): ProjectRow | undefined {
  return runDb((db) =>
    db.prepare('SELECT * FROM projects WHERE share_id = ? AND is_public = 1').get(shareId) as
      | ProjectRow
      | undefined
  );
}

export function getProjectVersions(id: number): ProjectPreview[] {
  return runDb((db) => {
    const source = db.prepare('SELECT id, parent_id FROM projects WHERE id = ?').get(id) as
      | { id: number; parent_id: number | null }
      | undefined;

    if (!source) {
      return [];
    }

    const rootId = source.parent_id ?? source.id;

    return db
      .prepare(`
        SELECT
          id,
          parent_id,
          version,
          client_name,
          business_type,
          visual_style,
          project_goal,
          ai_model,
          is_public,
          created_at,
          updated_at
        FROM projects
        WHERE id = ? OR parent_id = ?
        ORDER BY version ASC, id ASC
      `)
      .all(rootId, rootId) as ProjectPreview[];
  });
}

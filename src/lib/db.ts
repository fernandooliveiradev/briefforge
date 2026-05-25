import fs from 'fs';
import path from 'path';
import { encrypt, decrypt } from './crypto-utils';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

export interface ProjectRow {
  id: number;
  client_name: string;
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
  briefing: string; // stored as JSON text
  created_at: string;
  updated_at: string;
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
  };
}

interface DbData {
  nextId: number;
  projects: ProjectRow[];
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDb(): DbData {
  ensureDataDir();
  try {
    const encrypted = fs.readFileSync(DB_PATH, 'utf-8');
    const raw = decrypt(encrypted);
    return JSON.parse(raw);
  } catch {
    return { nextId: 1, projects: [] };
  }
}

function writeDb(data: DbData): void {
  ensureDataDir();
  const raw = JSON.stringify(data, null, 2);
  const encrypted = encrypt(raw);
  fs.writeFileSync(DB_PATH, encrypted, 'utf-8');
}

export function getAllProjects(): ProjectRow[] {
  const db = readDb();
  return db.projects.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getProjectPreviews(): Array<{
  id: number;
  client_name: string;
  business_type: string;
  visual_style: string;
  created_at: string;
}> {
  const db = readDb();
  return db.projects
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(({ id, client_name, business_type, visual_style, created_at }) => ({
      id,
      client_name,
      business_type,
      visual_style,
      created_at,
    }));
}

export function getProjectById(id: number): ProjectRow | undefined {
  const db = readDb();
  return db.projects.find((p) => p.id === id);
}

export function createProject(data: {
  client_name: string;
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
  briefing: string;
}): ProjectRow {
  const db = readDb();
  const now = new Date().toISOString();
  const project: ProjectRow = {
    id: db.nextId,
    ...data,
    created_at: now,
    updated_at: now,
  };
  db.nextId++;
  db.projects.push(project);
  writeDb(db);
  return project;
}
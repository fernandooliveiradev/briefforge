import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'briefforge.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);

    // Enable WAL mode for better concurrent access (though single user, good practice)
    db.pragma('journal_mode = WAL');

    // Create tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        business_type TEXT NOT NULL,
        visual_style TEXT NOT NULL,
        project_goal TEXT NOT NULL,
        language TEXT NOT NULL,
        complexity TEXT NOT NULL,
        briefing JSON NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  return db;
}

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
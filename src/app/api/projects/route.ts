import { NextRequest, NextResponse } from 'next/server';
import { getDb, ProjectRow } from '@/lib/db';
import { generateBriefing } from '@/lib/generate-briefing';

export async function GET() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as ProjectRow[];
  const projects = rows.map(row => ({
    ...row,
    briefing: JSON.parse(row.briefing),
  }));
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { business_type, visual_style, project_goal, language, complexity } = body;

  if (!business_type || !visual_style || !project_goal || !language || !complexity) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const briefingData = generateBriefing({
    business_type,
    visual_style,
    project_goal,
    language,
    complexity,
  });

  const db = getDb();
  const stmt = db.prepare(
    `INSERT INTO projects (client_name, business_type, visual_style, project_goal, language, complexity, briefing)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const result = stmt.run(
    briefingData.client.name,
    business_type,
    visual_style,
    project_goal,
    language,
    complexity,
    JSON.stringify(briefingData)
  );

  const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid) as ProjectRow;
  return NextResponse.json({
    ...newProject,
    briefing: JSON.parse(newProject.briefing),
  }, { status: 201 });
}
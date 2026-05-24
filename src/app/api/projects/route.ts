import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject, ProjectRow } from '@/lib/db';
import { generateBriefing } from '@/lib/generate-briefing';

export async function GET() {
  const projects = getAllProjects().map((row) => ({
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

  const newProject = createProject({
    client_name: briefingData.client.name,
    business_type,
    visual_style,
    project_goal,
    language,
    complexity,
    briefing: JSON.stringify(briefingData),
  });

  return NextResponse.json(
    {
      ...newProject,
      briefing: JSON.parse(newProject.briefing),
    },
    { status: 201 }
  );
}
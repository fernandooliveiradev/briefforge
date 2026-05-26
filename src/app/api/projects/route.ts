import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProjects,
  createProject,
  isProjectDatabaseError,
  type BriefingData,
} from '@/lib/db';
import { generateBriefingAI, getActiveAiModelLabel, hasAiKey } from '@/lib/generate-briefing-ai';
import { projectRequestSchema } from '@/lib/project-options';
import { requireApiAccess } from '@/lib/server-access';

export async function GET() {
  const unauthorized = await requireApiAccess();
  if (unauthorized) return unauthorized;

  try {
    const projects = getAllProjects().map((row) => ({
      ...row,
      briefing: JSON.parse(row.briefing),
    }));
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar os projetos.' },
      { status: isProjectDatabaseError(error) ? 503 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireApiAccess();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const parsedBody = projectRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
  }

  const { business_type, visual_style, project_goal, language, complexity } = parsedBody.data;
  let briefingData: BriefingData;

  if (!hasAiKey()) {
    return NextResponse.json(
      { error: 'Geração indisponível no momento. O briefing não foi criado.' },
      { status: 503 }
    );
  }

  try {
    briefingData = await generateBriefingAI({
      business_type,
      visual_style,
      project_goal,
      language,
      complexity,
    });
  } catch (error: unknown) {
    console.error('Erro na geração por IA:', error);

    return NextResponse.json(
      {
        error: 'A geração falhou. O briefing não foi criado.',
      },
      { status: 502 }
    );
  }

  let newProject: Awaited<ReturnType<typeof createProject>>;
  try {
    newProject = await createProject({
      client_name: briefingData.client.name,
      business_type,
      visual_style,
      project_goal,
      language,
      complexity,
      briefing: JSON.stringify(briefingData),
      ai_model: getActiveAiModelLabel(),
    });
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    return NextResponse.json(
      { error: 'Não foi possível salvar o briefing gerado.' },
      { status: isProjectDatabaseError(error) ? 503 : 500 }
    );
  }

  return NextResponse.json(
    {
      ...newProject,
      briefing: JSON.parse(newProject.briefing),
      powered_by_ai: true,
      ai_model: getActiveAiModelLabel(),
    },
    { status: 201 }
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { invalidRequestResponse, apiError } from '@/lib/api-response';
import {
  getAllProjects,
  createProject,
  isProjectDatabaseError,
  type BriefingData,
} from '@/lib/db';
import {
  generateBriefingAI,
  getActiveAiModelLabel,
  getAiGenerationPublicMessage,
  hasAiKey,
} from '@/lib/generate-briefing-ai';
import { projectRequestSchema } from '@/lib/project-options';
import { requireApiAccess } from '@/lib/server-access';
import {
  limitAiGeneration,
  limitProjectRead,
  rateLimitResponse,
  withRateLimitHeaders,
} from '@/lib/rate-limit';

const MAX_PROJECT_PAYLOAD_BYTES = 16 * 1024;

function isPayloadTooLarge(request: NextRequest): boolean {
  const contentLength = Number(request.headers.get('content-length') || 0);
  return Number.isFinite(contentLength) && contentLength > MAX_PROJECT_PAYLOAD_BYTES;
}

export async function GET(request: NextRequest) {
  const unauthorized = await requireApiAccess();
  if (unauthorized) return unauthorized;

  const limit = limitProjectRead(request);
  if (!limit.ok) return rateLimitResponse(limit);

  try {
    const projects = getAllProjects().map((row) => ({
      ...row,
      briefing: JSON.parse(row.briefing),
    }));
    return withRateLimitHeaders(NextResponse.json(projects), limit);
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    return apiError(
      'Não foi possível carregar os projetos.',
      isProjectDatabaseError(error) ? 503 : 500,
      'project_load_failed'
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireApiAccess();
  if (unauthorized) return unauthorized;

  const limit = limitAiGeneration(request);
  if (!limit.ok) return rateLimitResponse(limit);

  if (isPayloadTooLarge(request)) {
    return apiError('Payload muito grande.', 413, 'payload_too_large');
  }

  const body = await request.json().catch(() => null);
  const parsedBody = projectRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return invalidRequestResponse();
  }

  const { business_type, visual_style, project_goal, language, complexity, ai_provider } = parsedBody.data;
  let briefingData: BriefingData;
  const aiModel = getActiveAiModelLabel(ai_provider);

  if (!hasAiKey(ai_provider)) {
    return apiError(
      'Geração indisponível no momento. O briefing não foi criado.',
      503,
      'missing_ai_provider_key'
    );
  }

  try {
    briefingData = await generateBriefingAI({
      business_type,
      visual_style,
      project_goal,
      language,
      complexity,
      provider: ai_provider,
    });
  } catch (error: unknown) {
    console.error('Erro na geração por IA:', error);

    return apiError(getAiGenerationPublicMessage(error), 502, 'ai_generation_failed');
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
      ai_model: aiModel,
    });
  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    return apiError(
      'Não foi possível salvar o briefing gerado.',
      isProjectDatabaseError(error) ? 503 : 500,
      'project_save_failed'
    );
  }

  return withRateLimitHeaders(NextResponse.json(
    {
      ...newProject,
      briefing: JSON.parse(newProject.briefing),
      powered_by_ai: true,
      ai_model: aiModel,
    },
    { status: 201 }
  ), limit);
}

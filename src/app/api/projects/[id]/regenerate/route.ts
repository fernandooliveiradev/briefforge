import { NextResponse } from 'next/server';
import { apiError, invalidRequestResponse, notFoundResponse } from '@/lib/api-response';
import {
  getProjectById,
  isProjectDatabaseError,
  updateProjectBriefing,
  type BriefingData,
} from '@/lib/db';
import {
  generateBriefingAI,
  getActiveAiModelLabel,
  getAiGenerationPublicMessage,
  hasAiKey,
  type AiProvider,
  type RegenerationStage,
} from '@/lib/generate-briefing-ai';
import { parseProjectId } from '@/lib/project-id';
import { requireApiAccess } from '@/lib/server-access';
import { limitAiGeneration, rateLimitResponse, withRateLimitHeaders } from '@/lib/rate-limit';
import { readJsonBody } from '@/lib/request-body';

const MAX_REGENERATE_PAYLOAD_BYTES = 1024;

const stages = new Set<RegenerationStage>([
  'briefing',
  'brand',
  'moodboard',
  'prompts',
  'deliverables',
]);

function providerFromAiModel(aiModel: string): AiProvider {
  if (aiModel.startsWith('deepseek:')) return 'deepseek';
  return 'openai';
}

function mergeStage(current: BriefingData, regenerated: BriefingData, stage: RegenerationStage): BriefingData {
  if (stage === 'briefing') {
    return {
      ...current,
      client: regenerated.client,
      audience: regenerated.audience,
      agent_skills: {
        ...current.agent_skills,
        briefing: regenerated.agent_skills.briefing,
      },
    };
  }

  if (stage === 'brand') {
    return {
      ...current,
      brand: regenerated.brand,
      visual_identity: regenerated.visual_identity,
      agent_skills: {
        ...current.agent_skills,
        brand: regenerated.agent_skills.brand,
      },
    };
  }

  if (stage === 'moodboard') {
    return {
      ...current,
      moodboard: regenerated.moodboard,
      agent_skills: {
        ...current.agent_skills,
        moodboard: regenerated.agent_skills.moodboard,
      },
    };
  }

  if (stage === 'prompts') {
    return {
      ...current,
      prompts: regenerated.prompts,
      agent_skills: {
        ...current.agent_skills,
        prompts: regenerated.agent_skills.prompts,
      },
    };
  }

  return {
    ...current,
    deliverables: regenerated.deliverables,
    portfolio_project_ideas: regenerated.portfolio_project_ideas,
    agent_skills: {
      ...current.agent_skills,
      deliverables: regenerated.agent_skills.deliverables,
    },
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireApiAccess();
  if (unauthorized) return unauthorized;

  const limit = limitAiGeneration(request);
  if (!limit.ok) return rateLimitResponse(limit);

  const { id } = await params;
  const projectId = parseProjectId(id);

  if (!projectId) {
    return invalidRequestResponse('Project id invalid');
  }

  const bodyResult = await readJsonBody(request, MAX_REGENERATE_PAYLOAD_BYTES);
  if (!bodyResult.ok) return bodyResult.response;

  const body = bodyResult.data as { stage?: unknown } | null;
  const stage = body?.stage as RegenerationStage | undefined;

  if (!stage || !stages.has(stage)) {
    return invalidRequestResponse('Etapa inválida.');
  }

  try {
    const row = getProjectById(projectId);

    if (!row) {
      return notFoundResponse('Project not found');
    }

    const provider = providerFromAiModel(row.ai_model);

    if (!hasAiKey(provider)) {
      return apiError(
        'Geração indisponível no momento. A etapa não foi alterada.',
        503,
        'missing_ai_provider_key'
      );
    }

    const current = JSON.parse(row.briefing) as BriefingData;
    const regenerated = await generateBriefingAI({
      business_type: row.business_type,
      visual_style: row.visual_style,
      project_goal: row.project_goal,
      language: row.language,
      complexity: row.complexity,
      focusStage: stage,
      provider,
      currentBriefing: stage === 'prompts' ? current : undefined,
    });
    const merged = mergeStage(current, regenerated, stage);
    const updated = updateProjectBriefing(projectId, JSON.stringify(merged), getActiveAiModelLabel(provider));

    if (!updated) {
      return notFoundResponse('Project not found');
    }

    return withRateLimitHeaders(NextResponse.json({
      ...updated,
      briefing: JSON.parse(updated.briefing),
    }), limit);
  } catch (error) {
    console.error('Erro ao regenerar etapa:', error);
    return apiError(
      getAiGenerationPublicMessage(error),
      isProjectDatabaseError(error) ? 503 : 502,
      isProjectDatabaseError(error) ? 'project_database_failed' : 'ai_generation_failed'
    );
  }
}

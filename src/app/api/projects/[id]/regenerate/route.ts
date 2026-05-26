import { NextResponse } from 'next/server';
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

  const { id } = await params;
  const projectId = parseProjectId(id);

  if (!projectId) {
    return NextResponse.json({ error: 'Project id invalid' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const stage = body?.stage as RegenerationStage | undefined;

  if (!stage || !stages.has(stage)) {
    return NextResponse.json({ error: 'Etapa inválida.' }, { status: 400 });
  }

  try {
    const row = getProjectById(projectId);

    if (!row) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const provider = providerFromAiModel(row.ai_model);

    if (!hasAiKey(provider)) {
      return NextResponse.json(
        { error: 'Geração indisponível no momento. A etapa não foi alterada.' },
        { status: 503 }
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
    });
    const merged = mergeStage(current, regenerated, stage);
    const updated = updateProjectBriefing(projectId, JSON.stringify(merged), getActiveAiModelLabel(provider));

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...updated,
      briefing: JSON.parse(updated.briefing),
    });
  } catch (error) {
    console.error('Erro ao regenerar etapa:', error);
    return NextResponse.json(
      { error: getAiGenerationPublicMessage(error) },
      { status: isProjectDatabaseError(error) ? 503 : 502 }
    );
  }
}

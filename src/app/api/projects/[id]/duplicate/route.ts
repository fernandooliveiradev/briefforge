import { NextResponse } from 'next/server';
import { apiError, invalidRequestResponse, notFoundResponse } from '@/lib/api-response';
import { duplicateProject, isProjectDatabaseError } from '@/lib/db';
import { parseProjectId } from '@/lib/project-id';
import { requireApiAccess } from '@/lib/server-access';
import { limitProjectMutation, rateLimitResponse, withRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireApiAccess();
  if (unauthorized) return unauthorized;

  const limit = limitProjectMutation(request);
  if (!limit.ok) return rateLimitResponse(limit);

  const { id } = await params;
  const projectId = parseProjectId(id);

  if (!projectId) {
    return invalidRequestResponse('Project id invalid');
  }

  try {
    const duplicated = duplicateProject(projectId);

    if (!duplicated) {
      return notFoundResponse('Project not found');
    }

    return withRateLimitHeaders(NextResponse.json({
      ...duplicated,
      briefing: JSON.parse(duplicated.briefing),
    }, { status: 201 }), limit);
  } catch (error) {
    console.error('Erro ao duplicar projeto:', error);
    return apiError(
      'Não foi possível duplicar o briefing.',
      isProjectDatabaseError(error) ? 503 : 500,
      'project_duplicate_failed'
    );
  }
}

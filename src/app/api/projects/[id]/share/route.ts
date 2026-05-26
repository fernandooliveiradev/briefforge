import { NextResponse } from 'next/server';
import { apiError, invalidRequestResponse, notFoundResponse } from '@/lib/api-response';
import { isProjectDatabaseError, setProjectPublic } from '@/lib/db';
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

  const body = await request.json().catch(() => null);
  const isPublic = typeof body?.is_public === 'boolean' ? body.is_public : true;

  try {
    const updated = setProjectPublic(projectId, isPublic);

    if (!updated) {
      return notFoundResponse('Project not found');
    }

    return withRateLimitHeaders(NextResponse.json({
      id: updated.id,
      share_id: updated.share_id,
      is_public: updated.is_public === 1,
    }), limit);
  } catch (error) {
    console.error('Erro ao atualizar compartilhamento:', error);
    return apiError(
      'Não foi possível atualizar o link público.',
      isProjectDatabaseError(error) ? 503 : 500,
      'share_update_failed'
    );
  }
}

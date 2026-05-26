import { NextRequest, NextResponse } from 'next/server';
import { apiError, invalidRequestResponse, notFoundResponse } from '@/lib/api-response';
import { deleteProject, getProjectById, isProjectDatabaseError } from '@/lib/db';
import { parseProjectId } from '@/lib/project-id';
import { requireApiAccess } from '@/lib/server-access';
import {
  limitProjectMutation,
  limitProjectRead,
  rateLimitResponse,
  withRateLimitHeaders,
} from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireApiAccess();
  if (unauthorized) return unauthorized;

  const limit = limitProjectRead(request);
  if (!limit.ok) return rateLimitResponse(limit);

  const { id } = await params;
  const projectId = parseProjectId(id);

  if (!projectId) {
    return invalidRequestResponse('Project id invalid');
  }

  try {
    const row = getProjectById(projectId);

    if (!row) {
      return notFoundResponse('Project not found');
    }

    return withRateLimitHeaders(NextResponse.json({
      ...row,
      briefing: JSON.parse(row.briefing),
    }), limit);
  } catch (error) {
    console.error('Erro ao carregar projeto:', error);
    return apiError(
      'Não foi possível carregar o projeto.',
      isProjectDatabaseError(error) ? 503 : 500,
      'project_load_failed'
    );
  }
}

export async function DELETE(
  request: NextRequest,
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
    const deleted = await deleteProject(projectId);

    if (!deleted) {
      return notFoundResponse('Project not found');
    }

    return withRateLimitHeaders(NextResponse.json({ ok: true }), limit);
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return apiError(
      'Não foi possível deletar o projeto.',
      isProjectDatabaseError(error) ? 503 : 500,
      'project_delete_failed'
    );
  }
}

import { NextResponse } from 'next/server';
import { apiError, invalidRequestResponse, notFoundResponse } from '@/lib/api-response';
import { briefingToMarkdown, slugifyFileName } from '@/lib/briefing-export';
import { getProjectById, isProjectDatabaseError, type BriefingData } from '@/lib/db';
import { parseProjectId } from '@/lib/project-id';
import { requireApiAccess } from '@/lib/server-access';
import { limitProjectRead, rateLimitResponse, withRateLimitHeaders } from '@/lib/rate-limit';

export async function GET(
  request: Request,
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

    const briefing = JSON.parse(row.briefing) as BriefingData;
    const markdown = briefingToMarkdown(briefing, {
      clientName: row.client_name,
      businessType: row.business_type,
      version: row.version,
      aiModel: row.ai_model,
    });
    const fileName = `${slugifyFileName(row.client_name)}-v${row.version}.md`;

    return withRateLimitHeaders(new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    }), limit);
  } catch (error) {
    console.error('Erro ao exportar markdown:', error);
    return apiError(
      'Não foi possível exportar o briefing.',
      isProjectDatabaseError(error) ? 503 : 500,
      'project_export_failed'
    );
  }
}

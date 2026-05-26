import { NextResponse } from 'next/server';
import { briefingToMarkdown, slugifyFileName } from '@/lib/briefing-export';
import { getProjectById, isProjectDatabaseError, type BriefingData } from '@/lib/db';
import { parseProjectId } from '@/lib/project-id';
import { requireApiAccess } from '@/lib/server-access';

export async function GET(
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

  try {
    const row = getProjectById(projectId);

    if (!row) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const briefing = JSON.parse(row.briefing) as BriefingData;
    const markdown = briefingToMarkdown(briefing, {
      clientName: row.client_name,
      businessType: row.business_type,
      version: row.version,
      aiModel: row.ai_model,
    });
    const fileName = `${slugifyFileName(row.client_name)}-v${row.version}.md`;

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Erro ao exportar markdown:', error);
    return NextResponse.json(
      { error: 'Não foi possível exportar o briefing.' },
      { status: isProjectDatabaseError(error) ? 503 : 500 }
    );
  }
}

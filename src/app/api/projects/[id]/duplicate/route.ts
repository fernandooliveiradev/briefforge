import { NextResponse } from 'next/server';
import { duplicateProject, isProjectDatabaseError } from '@/lib/db';
import { parseProjectId } from '@/lib/project-id';
import { requireApiAccess } from '@/lib/server-access';

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

  try {
    const duplicated = duplicateProject(projectId);

    if (!duplicated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...duplicated,
      briefing: JSON.parse(duplicated.briefing),
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao duplicar projeto:', error);
    return NextResponse.json(
      { error: 'Não foi possível duplicar o briefing.' },
      { status: isProjectDatabaseError(error) ? 503 : 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { deleteProject, getProjectById, isProjectDatabaseError } from '@/lib/db';
import { parseProjectId } from '@/lib/project-id';
import { requireApiAccess } from '@/lib/server-access';

export async function GET(
  request: NextRequest,
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

    return NextResponse.json({
      ...row,
      briefing: JSON.parse(row.briefing),
    });
  } catch (error) {
    console.error('Erro ao carregar projeto:', error);
    return NextResponse.json(
      { error: 'Não foi possível carregar o projeto.' },
      { status: isProjectDatabaseError(error) ? 503 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
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
    const deleted = await deleteProject(projectId);

    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return NextResponse.json(
      { error: 'Não foi possível deletar o projeto.' },
      { status: isProjectDatabaseError(error) ? 503 : 500 }
    );
  }
}

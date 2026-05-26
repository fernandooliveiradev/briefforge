import { NextResponse } from 'next/server';
import { isProjectDatabaseError, setProjectPublic } from '@/lib/db';
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

  const body = await request.json().catch(() => null);
  const isPublic = typeof body?.is_public === 'boolean' ? body.is_public : true;

  try {
    const updated = setProjectPublic(projectId, isPublic);

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: updated.id,
      share_id: updated.share_id,
      is_public: updated.is_public === 1,
    });
  } catch (error) {
    console.error('Erro ao atualizar compartilhamento:', error);
    return NextResponse.json(
      { error: 'Não foi possível atualizar o link público.' },
      { status: isProjectDatabaseError(error) ? 503 : 500 }
    );
  }
}

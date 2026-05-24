import { NextRequest, NextResponse } from 'next/server';
import { getDb, ProjectRow } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(parseInt(id)) as ProjectRow | undefined;
  if (!row) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }
  return NextResponse.json({
    ...row,
    briefing: JSON.parse(row.briefing),
  });
}
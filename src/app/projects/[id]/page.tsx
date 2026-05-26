import { getProjectById, getProjectVersions, isProjectDatabaseError } from "@/lib/db";
import BriefingViewer from "@/components/briefing-viewer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DeleteProjectButton from "@/components/delete-project-button";
import { parseProjectId } from "@/lib/project-id";
import { ProjectDataError } from "@/components/project-data-error";
import { ProjectActions } from "@/components/project-actions";
import { requirePageAccess } from "@/lib/server-access";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requirePageAccess(`/projects/${id}`);

  const projectId = parseProjectId(id);

  if (!projectId) {
    notFound();
  }

  let row: ReturnType<typeof getProjectById>;
  let versions: ReturnType<typeof getProjectVersions> = [];

  try {
    row = getProjectById(projectId);
    versions = getProjectVersions(projectId);
  } catch (error) {
    if (isProjectDatabaseError(error)) {
      return <ProjectDataError />;
    }

    throw error;
  }

  if (!row) {
    notFound();
  }

  const briefing = JSON.parse(row.briefing);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="rounded-lg">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <ProjectActions
            projectId={row.id}
            shareId={row.share_id}
            isPublic={row.is_public === 1}
          />
          <DeleteProjectButton
            projectId={row.id}
            projectName={row.client_name}
            redirectTo="/dashboard"
            variant="button"
          />
        </div>
      </div>
      {versions.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-3">
          <span className="text-sm font-medium text-neutral-700">Versões:</span>
          {versions.map((version) => (
            <Link key={version.id} href={`/projects/${version.id}`}>
              <Button
                variant={version.id === row.id ? "default" : "outline"}
                size="sm"
                className="rounded-xl"
              >
                v{version.version}
              </Button>
            </Link>
          ))}
        </div>
      )}
      <BriefingViewer
        briefing={briefing}
        client_name={row.client_name}
        business_type={row.business_type}
        projectId={row.id}
      />
    </div>
  );
}

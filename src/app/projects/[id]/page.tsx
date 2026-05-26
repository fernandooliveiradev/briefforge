import { getProjectById, isProjectDatabaseError } from "@/lib/db";
import BriefingViewer from "@/components/briefing-viewer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import DeleteProjectButton from "@/components/delete-project-button";
import { parseProjectId } from "@/lib/project-id";
import { ProjectDataError } from "@/components/project-data-error";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = parseProjectId(id);

  if (!projectId) {
    notFound();
  }

  let row: ReturnType<typeof getProjectById>;

  try {
    row = getProjectById(projectId);
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
      <div className="flex items-center justify-between gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="rounded-lg">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <DeleteProjectButton
          projectId={row.id}
          projectName={row.client_name}
          redirectTo="/dashboard"
          variant="button"
        />
      </div>
      <BriefingViewer
        briefing={briefing}
        client_name={row.client_name}
        business_type={row.business_type}
      />
    </div>
  );
}

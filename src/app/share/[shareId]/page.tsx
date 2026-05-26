import { notFound } from "next/navigation";
import BriefingViewer from "@/components/briefing-viewer";
import { getProjectByShareId, isProjectDatabaseError, type BriefingData } from "@/lib/db";
import { ProjectDataError } from "@/components/project-data-error";

export const dynamic = "force-dynamic";

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  if (!/^[a-f0-9]{24}$/i.test(shareId)) {
    notFound();
  }

  try {
    const row = getProjectByShareId(shareId);

    if (!row) {
      notFound();
    }

    const briefing = JSON.parse(row.briefing) as BriefingData;

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4">
          <p className="text-sm font-medium text-neutral-700">Briefing compartilhado</p>
          <p className="text-sm text-neutral-500">
            Visualização pública em modo leitura.
          </p>
        </div>
        <BriefingViewer
          briefing={briefing}
          client_name={row.client_name}
          business_type={row.business_type}
          readOnly
        />
      </div>
    );
  } catch (error) {
    if (isProjectDatabaseError(error)) {
      return <ProjectDataError />;
    }

    throw error;
  }
}

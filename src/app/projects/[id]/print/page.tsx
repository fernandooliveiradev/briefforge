import { notFound } from "next/navigation";
import { briefingToMarkdown } from "@/lib/briefing-export";
import { getProjectById, isProjectDatabaseError, type BriefingData } from "@/lib/db";
import { parseProjectId } from "@/lib/project-id";
import { ProjectDataError } from "@/components/project-data-error";
import { PrintButton } from "@/components/print-button";
import { requirePageAccess } from "@/lib/server-access";

export const dynamic = "force-dynamic";

export default async function PrintProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requirePageAccess(`/projects/${id}/print`);

  const projectId = parseProjectId(id);

  if (!projectId) {
    notFound();
  }

  try {
    const row = getProjectById(projectId);

    if (!row) {
      notFound();
    }

    const briefing = JSON.parse(row.briefing) as BriefingData;
    const markdown = briefingToMarkdown(briefing, {
      clientName: row.client_name,
      businessType: row.business_type,
      version: row.version,
      aiModel: row.ai_model,
    });

    return (
      <article className="mx-auto max-w-4xl space-y-6 bg-white p-6 print:max-w-none print:p-0">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <div>
            <h1 className="font-serif text-3xl font-bold">{row.client_name}</h1>
            <p className="text-sm text-neutral-500">Layout preparado para salvar como PDF pelo navegador.</p>
          </div>
          <PrintButton />
        </div>
        <div className="whitespace-pre-wrap rounded-2xl border border-neutral-200 bg-white p-6 font-sans text-sm leading-7 text-neutral-900 print:border-0 print:p-0">
          {markdown}
        </div>
      </article>
    );
  } catch (error) {
    if (isProjectDatabaseError(error)) {
      return <ProjectDataError />;
    }

    throw error;
  }
}

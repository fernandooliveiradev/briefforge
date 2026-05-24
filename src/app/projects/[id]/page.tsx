import { getProjectById, ProjectRow } from "@/lib/db";
import BriefingViewer from "@/components/briefing-viewer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const row = getProjectById(parseInt(id));

  if (!row) {
    notFound();
  }

  const briefing = JSON.parse(row.briefing);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="rounded-lg">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
      </div>
      <BriefingViewer
        briefing={briefing}
        client_name={row.client_name}
        business_type={row.business_type}
      />
    </div>
  );
}
import { getProjectPreviews, isProjectDatabaseError } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLine, Calendar, Palette, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import DeleteProjectButton from "@/components/delete-project-button";
import { AppButton } from "@/components/app-button";
import { ProjectDataError } from "@/components/project-data-error";

export const dynamic = 'force-dynamic';

function formatDate(isoString: string): string {
  return format(parseISO(isoString), "dd/MM/yyyy", { locale: ptBR });
}

function BusinessIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    restaurante: '🍽️',
    clinica: '🏥',
    saas: '💻',
    loja_virtual: '🛍️',
    marca_pessoal: '👤',
    advocacia: '⚖️',
    imobiliaria: '🏠',
    academia: '🏋️',
    estudio_criativo: '🎨'
  };
  return <span className="text-2xl">{icons[type] || '✨'}</span>;
}

export default async function DashboardPage() {
  let rows: ReturnType<typeof getProjectPreviews>;

  try {
    rows = getProjectPreviews();
  } catch (error) {
    if (isProjectDatabaseError(error)) {
      return <ProjectDataError />;
    }

    throw error;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Seus briefings
          </h1>
          <p className="text-neutral-600 mt-1 max-w-xl">
            Gerencie seus clientes fictícios e use os briefings para criar projetos incríveis de portfólio.
          </p>
        </div>
        {rows.length > 0 && (
          <AppButton asChild>
            <Link href="/projects/new">
              <PenLine className="h-4 w-4 mr-2" />
              Novo briefing
            </Link>
          </AppButton>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PenLine className="h-12 w-12 text-neutral-400 mb-4" />
          <h2 className="text-2xl font-serif font-semibold mb-2">Nenhum briefing ainda</h2>
          <p className="text-neutral-600 max-w-md mb-6">
            Gere seu primeiro cliente fictício e comece a construir seu portfólio.
          </p>
          <AppButton asChild>
            <Link href="/projects/new">
              Criar briefing
            </Link>
          </AppButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((project) => (
            <Card key={project.id} className="group border border-neutral-200 bg-white hover:shadow-lg hover:border-neutral-300 transition-all rounded-2xl overflow-hidden h-full">
              <div className="flex items-start">
                <Link href={`/projects/${project.id}`} className="block min-w-0 flex-1">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-5 px-5">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                        <BusinessIcon type={project.business_type} />
                      </div>
                      <div>
                        <CardTitle className="font-serif text-lg font-bold leading-tight">
                          {project.client_name}
                        </CardTitle>
                        <p className="text-xs text-neutral-500 capitalize">
                          {project.business_type.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                        <Palette className="h-3 w-3" />
                        {project.visual_style}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-700">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.created_at)}
                      </span>
                    </div>
                  </CardContent>
                </Link>
                <div className="pt-4 pr-4">
                  <DeleteProjectButton projectId={project.id} projectName={project.client_name} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

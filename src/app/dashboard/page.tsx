import { getProjectPreviews } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PenLine, Calendar, Palette, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

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
  const rows = getProjectPreviews();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Seus briefings
          </h1>
          <p className="text-[hsl(30,10%,40%)] mt-1 max-w-xl">
            Gerencie seus clientes fictícios e use os briefings para criar projetos incríveis de portfólio.
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-[hsl(30,45%,45%)] hover:bg-[hsl(30,45%,50%)] text-white rounded-xl px-5 py-2.5 h-auto text-sm font-medium">
            <PenLine className="h-4 w-4 mr-2" />
            Criar cliente fake
          </Button>
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <PenLine className="h-12 w-12 text-[hsl(30,20%,70%)] mb-4" />
          <h2 className="text-2xl font-serif font-semibold mb-2">Nenhum briefing ainda</h2>
          <p className="text-[hsl(30,10%,40%)] max-w-md mb-6">
            Gere seu primeiro cliente fictício e comece a construir seu portfólio.
          </p>
          <Link href="/projects/new">
            <Button className="bg-[hsl(30,45%,45%)] hover:bg-[hsl(30,45%,50%)] text-white rounded-xl px-6 py-3 h-auto text-base font-medium">
              Criar primeiro briefing
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="group border border-[hsl(38,25%,88%)] bg-white hover:shadow-lg hover:border-[hsl(30,30%,75%)] transition-all rounded-2xl overflow-hidden cursor-pointer h-full">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-5 px-5">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-xl bg-[hsl(38,30%,92%)] flex items-center justify-center">
                      <BusinessIcon type={project.business_type} />
                    </div>
                    <div>
                      <CardTitle className="font-serif text-lg font-bold leading-tight">
                        {project.client_name}
                      </CardTitle>
                      <p className="text-xs text-[hsl(30,10%,50%)] capitalize">
                        {project.business_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[hsl(30,15%,60%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardHeader>
                <CardContent className="px-5 pb-5 pt-1">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(38,30%,93%)] px-2.5 py-1 text-xs font-medium text-[hsl(30,15%,40%)]">
                      <Palette className="h-3 w-3" />
                      {project.visual_style}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(38,30%,93%)] px-2.5 py-1 text-xs font-medium text-[hsl(30,15%,40%)]">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
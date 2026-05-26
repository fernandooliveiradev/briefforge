import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { AppButton } from '@/components/app-button';

export function ProjectDataError() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="mb-4 h-12 w-12 text-neutral-500" />
      <h1 className="mb-2 font-serif text-2xl font-semibold">Não foi possível carregar os briefings</h1>
      <p className="mb-6 text-neutral-600">
        O armazenamento local está temporariamente indisponível. Tente atualizar a página;
        se continuar acontecendo, verifique a configuração do ambiente.
      </p>
      <AppButton asChild>
        <Link href="/projects/new">Criar novo briefing</Link>
      </AppButton>
    </div>
  );
}

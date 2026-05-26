"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/app-button";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink, Files, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ProjectActionsProps {
  projectId: number;
  shareId: string | null;
  isPublic: boolean;
}

export function ProjectActions({ projectId, shareId, isPublic }: ProjectActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [publicState, setPublicState] = useState(isPublic);
  const [shareState, setShareState] = useState(shareId);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const publicUrl = shareState && origin ? `${origin}/share/${shareState}` : null;

  const duplicate = () => {
    startTransition(async () => {
      const response = await fetch(`/api/projects/${projectId}/duplicate`, { method: "POST" });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(body?.error || "Não foi possível duplicar.");
        return;
      }

      toast.success(`Versão ${body.version} criada.`);
      router.push(`/projects/${body.id}`);
      router.refresh();
    });
  };

  const toggleShare = () => {
    startTransition(async () => {
      const nextState = !publicState;
      const response = await fetch(`/api/projects/${projectId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: nextState }),
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(body?.error || "Não foi possível atualizar o link.");
        return;
      }

      setPublicState(body.is_public);
      setShareState(body.share_id);
      toast.success(body.is_public ? "Link público ativado." : "Link público desativado.");
      router.refresh();
    });
  };

  const copyPublicUrl = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    toast.success("Link público copiado.");
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm" className="rounded-xl bg-white">
        <a href={`/api/projects/${projectId}/export/markdown`}>
          <Download className="h-4 w-4" />
          Markdown
        </a>
      </Button>
      <Button asChild variant="outline" size="sm" className="rounded-xl bg-white">
        <Link href={`/projects/${projectId}/print`} target="_blank">
          <ExternalLink className="h-4 w-4" />
          PDF
        </Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-xl bg-white"
        onClick={duplicate}
        disabled={pending}
      >
        <Files className="h-4 w-4" />
        Duplicar
      </Button>
      <AppButton type="button" size="sm" onClick={toggleShare} disabled={pending}>
        <Share2 className="h-4 w-4" />
        {publicState ? "Desativar link" : "Compartilhar"}
      </AppButton>
      {publicState && publicUrl && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="rounded-xl"
          onClick={copyPublicUrl}
        >
          <Copy className="h-4 w-4" />
          Copiar link
        </Button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/components/app-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  businessTypeOptions,
  complexityOptions,
  languageOptions,
  projectGoalOptions,
  visualStyleOptions,
} from "@/lib/project-options";

export function NewProjectForm() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [form, setForm] = useState({
    business_type: "",
    visual_style: "",
    project_goal: "",
    language: "portugues",
    complexity: "completo",
  });

  const isFormValid = form.business_type && form.visual_style && form.project_goal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        throw new Error(errorBody?.error || "Falha ao gerar briefing");
      }

      const project = await res.json();
      toast.success("Briefing criado com sucesso.");
      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao gerar. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Novo briefing
        </h1>
        <p className="text-neutral-600 mt-1">
          Preencha os parâmetros e o BriefForge vai gerar um briefing completo com identidade, moodboard, prompts e skills por etapa.
        </p>
      </div>

      <Card className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif text-xl font-semibold">Parâmetros do briefing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="business_type">Tipo de negócio</Label>
                <Select
                  value={form.business_type}
                  onValueChange={(v) => setForm({ ...form, business_type: v })}
                >
                  <SelectTrigger id="business_type" className="rounded-xl">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypeOptions.map((bt) => (
                      <SelectItem key={bt.value} value={bt.value}>
                        {bt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHint>Define o segmento e guia nome, público, dores e contexto do cliente.</FieldHint>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visual_style">Estilo visual</Label>
                <Select
                  value={form.visual_style}
                  onValueChange={(v) => setForm({ ...form, visual_style: v })}
                >
                  <SelectTrigger id="visual_style" className="rounded-xl">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {visualStyleOptions.map((vs) => (
                      <SelectItem key={vs.value} value={vs.value}>
                        {vs.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHint>Direciona paleta, tipografia, moodboard, tom visual e estilo dos prompts.</FieldHint>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_goal">Objetivo do projeto</Label>
                <Select
                  value={form.project_goal}
                  onValueChange={(v) => setForm({ ...form, project_goal: v })}
                >
                  <SelectTrigger id="project_goal" className="rounded-xl">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projectGoalOptions.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHint>Indica o principal resultado esperado: site, identidade, social, app ou deck.</FieldHint>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select
                  value={form.language}
                  onValueChange={(v) => setForm({ ...form, language: v })}
                >
                  <SelectTrigger id="language" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((languageOption) => (
                      <SelectItem key={languageOption.value} value={languageOption.value}>
                        {languageOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHint>Escolhe o idioma de todo o briefing, prompts e skills gerados.</FieldHint>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="complexity">Complexidade</Label>
                <Select
                  value={form.complexity}
                  onValueChange={(v) => setForm({ ...form, complexity: v })}
                >
                  <SelectTrigger id="complexity" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {complexityOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHint>Controla a profundidade: simples é direto; completo traz mais análise, textos e critérios.</FieldHint>
              </div>
            </div>

            <div className="flex justify-end">
              <AppButton
                type="submit"
                disabled={!isFormValid || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando briefing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar briefing
                  </>
                )}
              </AppButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs leading-relaxed text-neutral-500">{children}</p>;
}

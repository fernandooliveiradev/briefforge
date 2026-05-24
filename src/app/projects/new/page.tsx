"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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

const businessTypes = [
  { value: "restaurante", label: "Restaurante" },
  { value: "clinica", label: "Clínica" },
  { value: "saas", label: "SaaS" },
  { value: "loja_virtual", label: "Loja virtual" },
  { value: "marca_pessoal", label: "Marca pessoal" },
  { value: "advocacia", label: "Advocacia" },
  { value: "imobiliaria", label: "Imobiliária" },
  { value: "academia", label: "Academia" },
  { value: "estudio_criativo", label: "Estúdio criativo" },
];

const visualStyles = [
  { value: "minimalista", label: "Minimalista" },
  { value: "premium", label: "Premium" },
  { value: "futurista", label: "Futurista" },
  { value: "divertido", label: "Divertido" },
  { value: "editorial", label: "Editorial" },
  { value: "luxo", label: "Luxo" },
  { value: "tech", label: "Tech" },
  { value: "organico", label: "Orgânico" },
];

const projectGoals = [
  { value: "landing_page", label: "Landing page" },
  { value: "identidade_visual", label: "Identidade visual" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "app", label: "App" },
  { value: "social_media", label: "Social media" },
  { value: "apresentacao_comercial", label: "Apresentação comercial" },
];

const complexities = [
  { value: "simples", label: "Simples" },
  { value: "intermediario", label: "Intermediário" },
  { value: "completo", label: "Completo" },
];

export default function NewProjectPage() {
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

      if (!res.ok) throw new Error("Falha ao gerar briefing");

      const project = await res.json();
      toast.success("Briefing criado com sucesso!");
      router.push(`/projects/${project.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Criar cliente fake
        </h1>
        <p className="text-[hsl(30,10%,40%)] mt-1">
          Preencha os parâmetros e o BriefForge vai gerar um briefing completo com identidade, moodboard e prompts.
        </p>
      </div>

      <Card className="rounded-2xl border border-[hsl(38,25%,88%)] bg-white shadow-sm">
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
                    {businessTypes.map((bt) => (
                      <SelectItem key={bt.value} value={bt.value}>
                        {bt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {visualStyles.map((vs) => (
                      <SelectItem key={vs.value} value={vs.value}>
                        {vs.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {projectGoals.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="portugues">Português</SelectItem>
                    <SelectItem value="ingles">Inglês</SelectItem>
                  </SelectContent>
                </Select>
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
                    {complexities.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isGenerating}
              className="w-full bg-[hsl(30,45%,45%)] hover:bg-[hsl(30,45%,50%)] text-white rounded-xl py-6 h-auto text-base font-medium disabled:opacity-50"
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
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-[hsl(30,10%,50%)]">
        O briefing será gerado com base nos parâmetros e ficará salvo no seu dashboard.
      </div>
    </div>
  );
}
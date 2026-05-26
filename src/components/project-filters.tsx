"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppButton } from "@/components/app-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  businessTypeOptions,
  projectGoalOptions,
  visualStyleOptions,
} from "@/lib/project-options";
import { Search, X } from "lucide-react";

const allValue = "todos";

export function ProjectFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  const [businessType, setBusinessType] = useState(params.get("business_type") || allValue);
  const [visualStyle, setVisualStyle] = useState(params.get("visual_style") || allValue);
  const [projectGoal, setProjectGoal] = useState(params.get("project_goal") || allValue);

  const applyFilters = (event: FormEvent) => {
    event.preventDefault();
    const next = new URLSearchParams();

    if (q.trim()) next.set("q", q.trim());
    if (businessType !== allValue) next.set("business_type", businessType);
    if (visualStyle !== allValue) next.set("visual_style", visualStyle);
    if (projectGoal !== allValue) next.set("project_goal", projectGoal);

    router.push(`/dashboard${next.toString() ? `?${next.toString()}` : ""}`);
  };

  const clearFilters = () => {
    setQ("");
    setBusinessType(allValue);
    setVisualStyle(allValue);
    setProjectGoal(allValue);
    router.push("/dashboard");
  };

  return (
    <form onSubmit={applyFilters} className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.3fr_1fr_1fr_1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Buscar por nome, segmento ou objetivo"
            className="rounded-xl pl-9"
          />
        </div>
        <Select value={businessType} onValueChange={setBusinessType}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>Todos os tipos</SelectItem>
            {businessTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={visualStyle} onValueChange={setVisualStyle}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Estilo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>Todos os estilos</SelectItem>
            {visualStyleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={projectGoal} onValueChange={setProjectGoal}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Objetivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={allValue}>Todos os objetivos</SelectItem>
            {projectGoalOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AppButton type="submit">Filtrar</AppButton>
        <Button type="button" variant="ghost" className="rounded-xl" onClick={clearFilters}>
          <X className="h-4 w-4" />
          Limpar
        </Button>
      </div>
    </form>
  );
}

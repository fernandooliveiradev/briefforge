"use client";

import { useState } from "react";
import { BriefingData } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, PaintBucket, Type, Camera, Layers, Lightbulb, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface BriefingViewerProps {
  briefing: BriefingData;
  client_name: string;
  business_type: string;
}

const CopyButton = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label || "Prompt"} copiado!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 w-8 p-0 rounded-lg text-[hsl(30,15%,50%)] hover:bg-[hsl(38,30%,92%)]"
    >
      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
};

export default function BriefingViewer({ briefing, client_name, business_type }: BriefingViewerProps) {
  const [activeTab, setActiveTab] = useState("briefing");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">{client_name}</h1>
          <p className="text-[hsl(30,10%,50%)] capitalize">{business_type.replace(/_/g, ' ')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full bg-[hsl(38,30%,92%)] text-[hsl(30,15%,35%)]">
            {briefing.brand.personality[0]}
          </Badge>
          <Badge variant="secondary" className="rounded-full bg-[hsl(38,30%,92%)] text-[hsl(30,15%,35%)]">
            {briefing.visual_identity.typography.heading}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-auto p-1 bg-[hsl(38,25%,92%)] rounded-xl gap-1 mb-6">
          <TabsTrigger
            value="briefing"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(30,25%,15%)] text-[hsl(30,10%,50%)]"
          >
            📋 Briefing
          </TabsTrigger>
          <TabsTrigger
            value="marca"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(30,25%,15%)] text-[hsl(30,10%,50%)]"
          >
            ✨ Marca
          </TabsTrigger>
          <TabsTrigger
            value="moodboard"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(30,25%,15%)] text-[hsl(30,10%,50%)]"
          >
            🎨 Moodboard
          </TabsTrigger>
          <TabsTrigger
            value="prompts"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(30,25%,15%)] text-[hsl(30,10%,50%)]"
          >
            💬 Prompts
          </TabsTrigger>
          <TabsTrigger
            value="entregaveis"
            className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(30,25%,15%)] text-[hsl(30,10%,50%)]"
          >
            📦 Entregáveis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="briefing" className="mt-0">
          <Card className="rounded-2xl border border-[hsl(38,25%,88%)] bg-white shadow-sm">
            <CardContent className="p-6 space-y-6">
              <Section title="Cliente" icon={<Layers className="h-5 w-5" />}>
                <InfoRow label="Nome" value={briefing.client.name} />
                <InfoRow label="Segmento" value={briefing.client.segment} />
                <InfoRow label="Localização" value={briefing.client.location} />
                <InfoRow label="Descrição curta" value={briefing.client.short_description} />
                <InfoRow label="História da marca" value={briefing.client.brand_story} />
                <InfoRow label="Problema" value={briefing.client.main_problem} />
                <InfoRow label="Objetivo de negócio" value={briefing.client.business_goal} />
              </Section>
              <Section title="Público-alvo" icon={<Lightbulb className="h-5 w-5" />}>
                <InfoRow label="Público principal" value={briefing.audience.primary_audience} />
                <div>
                  <h4 className="text-sm font-medium text-[hsl(30,10%,50%)] mb-1">Dores</h4>
                  <ul className="list-disc list-inside text-sm text-[hsl(30,15%,30%)] space-y-1">
                    {briefing.audience.pain_points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[hsl(30,10%,50%)] mb-1">Desejos</h4>
                  <ul className="list-disc list-inside text-sm text-[hsl(30,15%,30%)] space-y-1">
                    {briefing.audience.desires.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marca" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="rounded-2xl border border-[hsl(38,25%,88%)] bg-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                <Section title="Personalidade e tom" icon={<Sparkles className="h-5 w-5" />}>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {briefing.brand.personality.map((p, i) => (
                      <Badge key={i} variant="outline" className="rounded-full bg-[hsl(38,30%,92%)] border-none">
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <InfoRow label="Tom de voz" value={briefing.brand.tone_of_voice} />
                  <InfoRow label="Posicionamento" value={briefing.brand.positioning} />
                  <InfoRow label="Tagline" value={briefing.brand.tagline} />
                </Section>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-[hsl(38,25%,88%)] bg-white shadow-sm">
              <CardContent className="p-6 space-y-4">
                <Section title="Identidade visual" icon={<PaintBucket className="h-5 w-5" />}>
                  <InfoRow label="Direção do logo" value={briefing.visual_identity.logo_direction} />

                  <div>
                    <h4 className="text-sm font-medium text-[hsl(30,10%,50%)] mb-2">Paleta de cores</h4>
                    <div className="space-y-2">
                      {briefing.visual_identity.color_palette.map((color, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-lg border shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div>
                            <p className="text-sm font-medium">{color.name}</p>
                            <p className="text-xs text-[hsl(30,10%,50%)]">
                              {color.hex} — {color.usage}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-[hsl(30,10%,50%)] mb-2">Tipografia</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-[hsl(30,15%,50%)]" />
                        <span className="text-sm font-medium font-serif">
                          {briefing.visual_identity.typography.heading}
                        </span>
                        <span className="text-xs text-[hsl(30,10%,50%)]">— Títulos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-[hsl(30,15%,50%)]" />
                        <span className="text-sm font-medium font-sans">
                          {briefing.visual_identity.typography.body}
                        </span>
                        <span className="text-xs text-[hsl(30,10%,50%)]">— Corpo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Type className="h-4 w-4 text-[hsl(30,15%,50%)]" />
                        <span className="text-sm font-medium font-sans">
                          {briefing.visual_identity.typography.accent}
                        </span>
                        <span className="text-xs text-[hsl(30,10%,50%)]">— Apoio</span>
                      </div>
                    </div>
                  </div>
                </Section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moodboard" className="mt-0">
          <Card className="rounded-2xl border border-[hsl(38,25%,88%)] bg-white shadow-sm">
            <CardContent className="p-6 space-y-6">
              <Section title="Moodboard criativo" icon={<Camera className="h-5 w-5" />}>
                <div>
                  <h4 className="text-sm font-medium text-[hsl(30,10%,50%)] mb-1">Palavras-chave</h4>
                  <div className="flex flex-wrap gap-2">
                    {briefing.moodboard.keywords.map((kw, i) => (
                      <Badge key={i} className="rounded-full bg-[hsl(38,30%,93%)] text-[hsl(30,20%,30%)] font-normal">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[hsl(30,10%,50%)] mb-1">Referências visuais</h4>
                  <ul className="list-disc list-inside text-sm text-[hsl(30,15%,30%)] space-y-1">
                    {briefing.moodboard.visual_references.map((ref, i) => (
                      <li key={i}>{ref}</li>
                    ))}
                  </ul>
                </div>
                <InfoRow label="Estilo fotográfico" value={briefing.moodboard.photography_style} />
                <InfoRow label="Estilo de layout" value={briefing.moodboard.layout_style} />
                <div>
                  <h4 className="text-sm font-medium text-[hsl(30,10%,50%)] mb-1">Texturas e materiais</h4>
                  <div className="flex flex-wrap gap-2">
                    {briefing.moodboard.texture_and_materials.map((tex, i) => (
                      <Badge key={i} variant="outline" className="rounded-full bg-[hsl(38,30%,93%)] border-none">
                        {tex}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="mt-0">
          <Card className="rounded-2xl border border-[hsl(38,25%,88%)] bg-white shadow-sm">
            <CardContent className="p-6 space-y-6">
              <Section title="Prompts para execução" icon={<Sparkles className="h-5 w-5" />}>
                {[
                  { label: "Landing Page", prompt: briefing.prompts.landing_page_prompt },
                  { label: "Logo", prompt: briefing.prompts.logo_prompt },
                  { label: "Imagem do Moodboard", prompt: briefing.prompts.moodboard_image_prompt },
                  { label: "Social Media", prompt: briefing.prompts.social_media_prompt },
                  { label: "Lovable / Cursor", prompt: briefing.prompts.lovable_or_cursor_prompt },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-[hsl(30,10%,50%)]">{item.label}</h4>
                      <CopyButton text={item.prompt} label={item.label} />
                    </div>
                    <p className="text-sm bg-[hsl(38,30%,94%)] p-3 rounded-xl whitespace-pre-wrap leading-relaxed">
                      {item.prompt}
                    </p>
                  </div>
                ))}
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entregaveis" className="mt-0">
          <Card className="rounded-2xl border border-[hsl(38,25%,88%)] bg-white shadow-sm">
            <CardContent className="p-6 space-y-6">
              <Section title="Entregáveis sugeridos">
                <ul className="space-y-2">
                  {briefing.deliverables.map((d, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{d}</span>
                    </li>
                  ))}
                </ul>
              </Section>
              <Section title="Ideias para projeto de portfólio" icon={<Lightbulb className="h-5 w-5" />}>
                <ul className="space-y-2">
                  {briefing.portfolio_project_ideas.map((idea, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500">💡</span>
                      <span className="text-sm">{idea}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-[hsl(30,10%,50%)]">{label}</h4>
      <p className="text-sm text-[hsl(30,15%,30%)] mt-0.5">{value}</p>
    </div>
  );
}

function Section({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-[hsl(30,20%,45%)]">{icon}</span>}
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
import { z } from 'zod';

export const businessTypeOptions = [
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'saas', label: 'SaaS' },
  { value: 'loja_virtual', label: 'Loja virtual' },
  { value: 'marca_pessoal', label: 'Marca pessoal' },
  { value: 'advocacia', label: 'Advocacia' },
  { value: 'imobiliaria', label: 'Imobiliária' },
  { value: 'academia', label: 'Academia' },
  { value: 'estudio_criativo', label: 'Estúdio criativo' },
] as const;

export const visualStyleOptions = [
  { value: 'minimalista', label: 'Minimalista' },
  { value: 'premium', label: 'Premium' },
  { value: 'futurista', label: 'Futurista' },
  { value: 'divertido', label: 'Divertido' },
  { value: 'editorial', label: 'Editorial' },
  { value: 'luxo', label: 'Luxo' },
  { value: 'tech', label: 'Tech' },
  { value: 'organico', label: 'Orgânico' },
] as const;

export const projectGoalOptions = [
  { value: 'landing_page', label: 'Landing page' },
  { value: 'identidade_visual', label: 'Identidade visual' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'app', label: 'App' },
  { value: 'social_media', label: 'Social media' },
  { value: 'apresentacao_comercial', label: 'Apresentação comercial' },
] as const;

export const languageOptions = [
  { value: 'portugues', label: 'Português' },
  { value: 'ingles', label: 'Inglês' },
] as const;

export const complexityOptions = [
  { value: 'simples', label: 'Simples' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'completo', label: 'Completo' },
] as const;

const optionValues = <T extends ReadonlyArray<{ value: string }>>(options: T) =>
  options.map((option) => option.value) as [T[number]['value'], ...T[number]['value'][]];

export const projectRequestSchema = z.object({
  business_type: z.enum(optionValues(businessTypeOptions)),
  visual_style: z.enum(optionValues(visualStyleOptions)),
  project_goal: z.enum(optionValues(projectGoalOptions)),
  language: z.enum(optionValues(languageOptions)),
  complexity: z.enum(optionValues(complexityOptions)),
});

export type ProjectRequestInput = z.infer<typeof projectRequestSchema>;

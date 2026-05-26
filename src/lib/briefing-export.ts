import type { AgentSkill, BriefingData } from './db';

function list(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function skillBlock(title: string, skill: AgentSkill): string {
  return `### ${title}

**Nome:** ${skill.name}

**Descrição:** ${skill.description}

**Quando usar:** ${skill.when_to_use}

**Instruções**
${list(skill.instructions)}

**Checks de qualidade**
${list(skill.quality_checks)}`;
}

export function briefingToMarkdown(briefing: BriefingData, metadata: {
  clientName: string;
  businessType: string;
  version?: number;
  aiModel?: string;
}): string {
  return `# ${metadata.clientName}

${metadata.version ? `Versão: ${metadata.version}\n` : ''}Segmento: ${metadata.businessType}
Modelo: ${metadata.aiModel || 'não informado'}

## Briefing

**Nome:** ${briefing.client.name}

**Segmento:** ${briefing.client.segment}

**Localização:** ${briefing.client.location}

**Descrição curta:** ${briefing.client.short_description}

**História da marca:** ${briefing.client.brand_story}

**Problema principal:** ${briefing.client.main_problem}

**Objetivo de negócio:** ${briefing.client.business_goal}

### Público

**Público principal:** ${briefing.audience.primary_audience}

**Dores**
${list(briefing.audience.pain_points)}

**Desejos**
${list(briefing.audience.desires)}

## Marca

**Personalidade**
${list(briefing.brand.personality)}

**Tom de voz:** ${briefing.brand.tone_of_voice}

**Posicionamento:** ${briefing.brand.positioning}

**Tagline:** ${briefing.brand.tagline}

### Identidade visual

**Direção do logo:** ${briefing.visual_identity.logo_direction}

${briefing.visual_identity.logo_concept_board ? `**Concepção da logo**

- Nome do conceito: ${briefing.visual_identity.logo_concept_board.concept_name}
- Tipo: ${briefing.visual_identity.logo_concept_board.logo_type}
- Composição: ${briefing.visual_identity.logo_concept_board.composition}

**Simbologia**
${list(briefing.visual_identity.logo_concept_board.symbol_meaning)}

**Variações obrigatórias**
${list(briefing.visual_identity.logo_concept_board.required_variations)}

**Seções da prancha**
${list(briefing.visual_identity.logo_concept_board.board_sections)}

**Notas de produção**
${list(briefing.visual_identity.logo_concept_board.production_notes)}
` : ''}

**Paleta de cores**
${briefing.visual_identity.color_palette
  .map((color) => `- ${color.name} (${color.hex}): ${color.usage}`)
  .join('\n')}

**Tipografia**
- Títulos: ${briefing.visual_identity.typography.heading}
- Corpo: ${briefing.visual_identity.typography.body}
- Apoio: ${briefing.visual_identity.typography.accent}

## Moodboard

**Palavras-chave**
${list(briefing.moodboard.keywords)}

**Referências visuais**
${list(briefing.moodboard.visual_references)}

**Estilo fotográfico:** ${briefing.moodboard.photography_style}

**Layout:** ${briefing.moodboard.layout_style}

**Texturas e materiais**
${list(briefing.moodboard.texture_and_materials)}

## Prompts

### Prompt mestre de execução

${briefing.prompts.master_execution_prompt}

### Landing page

${briefing.prompts.landing_page_prompt}

### Logo

${briefing.prompts.logo_prompt}

${briefing.prompts.logo_concept_board_prompt ? `### Prancha de identidade visual

${briefing.prompts.logo_concept_board_prompt}
` : ''}

### Imagem do moodboard

${briefing.prompts.moodboard_image_prompt}

### Social media

${briefing.prompts.social_media_prompt}

### Lovable / Cursor

${briefing.prompts.lovable_or_cursor_prompt}

## Pacote de entregáveis

Materiais esperados para execução, exportação ou apresentação em portfólio.

${list(briefing.deliverables)}

## Ideias de portfólio

${list(briefing.portfolio_project_ideas)}

## Skills do agente

${skillBlock('Briefing', briefing.agent_skills.briefing)}

${skillBlock('Marca', briefing.agent_skills.brand)}

${skillBlock('Moodboard', briefing.agent_skills.moodboard)}

${skillBlock('Prompts', briefing.agent_skills.prompts)}

${skillBlock('Entregáveis', briefing.agent_skills.deliverables)}
`;
}

export function slugifyFileName(value: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return slug || 'briefing';
}

import type { BriefingData } from './db';

export type AiProvider = 'openai' | 'deepseek';
export type RegenerationStage = 'briefing' | 'brand' | 'moodboard' | 'prompts' | 'deliverables';

export const OPENAI_BRIEFING_MODEL = 'gpt-4o';
export const DEEPSEEK_BRIEFING_MODEL = 'deepseek-v4-pro';

interface AiProviderConfig {
  provider: AiProvider;
  displayName: string;
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
  responseFormat: unknown;
}

function cleanBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getActiveAiProvider(): AiProvider {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

  if (provider !== 'openai' && provider !== 'deepseek') {
    throw new Error('AI_PROVIDER must be either "openai" or "deepseek"');
  }

  return provider;
}

export function getActiveAiConfig(): AiProviderConfig {
  const provider = getActiveAiProvider();

  if (provider === 'deepseek') {
    return {
      provider,
      displayName: 'DeepSeek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: cleanBaseUrl(process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'),
      model: process.env.DEEPSEEK_MODEL || DEEPSEEK_BRIEFING_MODEL,
      responseFormat: { type: 'json_object' },
    };
  }

  return {
    provider,
    displayName: 'OpenAI',
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: cleanBaseUrl(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'),
    model: process.env.OPENAI_MODEL || OPENAI_BRIEFING_MODEL,
    responseFormat: BRIEFING_RESPONSE_FORMAT,
  };
}

export function getActiveAiModelLabel(): string {
  const config = getActiveAiConfig();
  return `${config.provider}:${config.model}`;
}

export function hasAiKey(): boolean {
  try {
    return !!getActiveAiConfig().apiKey;
  } catch {
    return false;
  }
}

const COMPLEXITY_INSTRUCTIONS: Record<string, string> = {
  simples:
    'Keep the briefing concise. Short descriptions, 2-3 pain points and desires, compact brand story.',
  intermediario:
    'Moderately detailed. 3-4 items in arrays, balanced descriptions with some nuance.',
  completo:
    'Maximum detail and creativity. 5-6 items in arrays, elaborate stories, deep audience analysis, rich descriptions.',
};

const SUPPORTED_LANGUAGES: Record<string, string> = {
  portugues: 'Portuguese (Brazilian)',
  ingles: 'English',
};

const SYSTEM_PROMPT = `You are a creative brand strategist. Generate a complete fictional brand briefing in valid JSON.

CRITICAL — every field below MUST exist and be non-empty:
- client: { name, segment, location, short_description, brand_story, main_problem, business_goal } — all strings
- audience: { primary_audience (string), pain_points (string[]), desires (string[]) }
- brand: { personality (string[]), tone_of_voice (string), positioning (string), tagline (string) }
- visual_identity: { logo_direction (string), logo_concept_board, color_palette (array of exactly 5 {name, hex, usage}), typography: {heading, body, accent} }
  logo_concept_board MUST be an object:
  { concept_name, logo_type, composition, symbol_meaning, required_variations, board_sections, production_notes }
  - concept_name: title for the logo conception, e.g. "Prancha de identidade visual premium"
  - logo_type: exact logo category, e.g. monogram, emblem, wordmark, brand board, heraldic badge, pictorial mark
  - composition: how the mark, typography, colors and supporting graphics should be arranged
  - symbol_meaning: string[] explaining each symbol or visual metaphor
  - required_variations: string[] including logo principal, emblema/símbolo, monograma, versão secundária and one-color usage when relevant
  - board_sections: string[] of sections that must appear in the generated visual document
  - production_notes: string[] with concrete generation notes for another image/design AI
- moodboard: { keywords (string[]), visual_references (string[]), photography_style (string), layout_style (string), texture_and_materials (string[]) }
- deliverables: string[] with concrete production-ready outputs. When brand/logo work is relevant, include logo concept board, logo principal, emblem/symbol, monogram, secondary version, color palette, typography sheet, usage notes, export file formats and acceptance criteria.
- portfolio_project_ideas: string[]
- prompts: { landing_page_prompt, logo_prompt, logo_concept_board_prompt, moodboard_image_prompt, social_media_prompt, lovable_or_cursor_prompt, master_execution_prompt } — all strings
- agent_skills: one skill per stage:
  {
    briefing, brand, moodboard, prompts, deliverables
  }
  Each skill MUST be an object with:
  { name, description, when_to_use, instructions, quality_checks }
  - name: lowercase kebab-case, max 64 characters
  - description: when the agent should use this skill
  - when_to_use: short human explanation
  - instructions: string[] with 5-8 concrete steps
  - quality_checks: string[] with 4-6 checks

Return ONLY the JSON object. No markdown, no explanations.
The master_execution_prompt MUST be long and actionable. It must consolidate details from EVERY tab/stage:
- Briefing: client, segment, location, story, problem, business goal, audience, pains, desires
- Brand: personality, tone, positioning, tagline, logo direction, logo concept board, colors, typography
- Moodboard: keywords, visual references, photography, layout, textures/materials
- Prompts: specific instructions for landing page, logo, moodboard image, social media and Lovable/Cursor
- Deliverables: exact deliverables, brand board assets, logo variations, file formats, acceptance criteria and production notes
The master_execution_prompt should tell an implementation/design agent what to build, what to avoid, and how to verify the output.
The logo_prompt and logo_concept_board_prompt MUST be strong enough to paste into an image/design AI and get a complete logo presentation document, not only an isolated icon. Ask for a "prancha de identidade visual / brand board / logo concept board" with:
- logo principal
- emblem or symbol
- monogram when useful
- secondary version
- color palette with names and hex codes
- typography samples
- symbol rationale
- spacing/alignment notes
- premium presentation layout on an off-white or neutral background when the style fits
Deliverables MUST be practical and specific. Avoid generic items like "logo" or "social media". Prefer outputs such as:
- Prancha de identidade visual / brand board in PNG and PDF
- Logo principal in SVG, PNG transparent and PDF
- Emblem/symbol version in SVG and PNG
- Monogram or initials version when relevant
- Secondary horizontal/vertical logo lockups
- One-color and negative versions
- Color palette sheet with names, hex and usage
- Typography sheet with font names and hierarchy
- Mini usage guide with spacing, minimum size and misuse examples
- Prompt pack for regenerating the logo board and moodboard
For typography, use Google Fonts. VARY widely per visual style:
- Minimalist: Inter, DM Sans, Space Grotesk, Geist, Satoshi
- Premium: Cormorant Garamond, Lora, EB Garamond, Fraunces, Libre Baskerville
- Futuristic: Orbitron, Exo 2, Sora, Rajdhani, Audiowide
- Playful: Fredoka, Baloo 2, Nunito, Quicksand, Lilita One
- Editorial: Crimson Text, Merriweather, Domine, Libre Baskerville, Playfair Display
- Luxury: Cormorant, Cinzel, Bodoni Moda, Italiana, Prata
- Tech: JetBrains Mono, IBM Plex Sans, Space Mono, Fira Code, Geist Mono
- Organic: Amatic SC, Caveat, Kalam, Gaegu, Shadows Into Light
NEVER default to Playfair Display unless the style is Editorial or Luxury. Match font personality to visual style.
Color palette must be cohesive — choose hex codes that work together for the given visual style.
Make the brand feel like a real business, not generic placeholders.
Write ALL text in the requested language.`;

const REGENERATION_STAGE_INSTRUCTIONS: Record<RegenerationStage, string> = {
  briefing:
    'Prioritize the Briefing tab: client, segment, location, story, main problem, business goal and audience. Keep all other tabs coherent with the regenerated briefing.',
  brand:
    'Prioritize the Marca tab: personality, tone, positioning, tagline, logo direction, color palette and typography. Keep all other tabs coherent with the regenerated brand.',
  moodboard:
    'Prioritize the Moodboard tab: keywords, visual references, photography, layout, textures and materials. Keep all other tabs coherent with the regenerated moodboard.',
  prompts:
    'Prioritize the Prompts tab: make every execution prompt longer, concrete, contextual and ready for another agent. Keep all other tabs coherent with the regenerated prompts.',
  deliverables:
    'Prioritize the Entregáveis tab: production-ready deliverables, logo concept board assets, logo variations, export formats, portfolio ideas, acceptance criteria and production notes. Keep all other tabs coherent with the regenerated deliverables.',
};

const stringField = { type: 'string', minLength: 1 } as const;
const stringArrayField = {
  type: 'array',
  minItems: 1,
  items: stringField,
} as const;
const logoConceptBoardSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'concept_name',
    'logo_type',
    'composition',
    'symbol_meaning',
    'required_variations',
    'board_sections',
    'production_notes',
  ],
  properties: {
    concept_name: stringField,
    logo_type: stringField,
    composition: stringField,
    symbol_meaning: stringArrayField,
    required_variations: stringArrayField,
    board_sections: stringArrayField,
    production_notes: stringArrayField,
  },
} as const;
const agentSkillSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'description', 'when_to_use', 'instructions', 'quality_checks'],
  properties: {
    name: stringField,
    description: stringField,
    when_to_use: stringField,
    instructions: stringArrayField,
    quality_checks: stringArrayField,
  },
} as const;

const BRIEFING_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'briefing_data',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: [
        'client',
        'audience',
        'brand',
        'visual_identity',
        'moodboard',
        'deliverables',
        'portfolio_project_ideas',
        'prompts',
        'agent_skills',
      ],
      properties: {
        client: {
          type: 'object',
          additionalProperties: false,
          required: ['name', 'segment', 'location', 'short_description', 'brand_story', 'main_problem', 'business_goal'],
          properties: {
            name: stringField,
            segment: stringField,
            location: stringField,
            short_description: stringField,
            brand_story: stringField,
            main_problem: stringField,
            business_goal: stringField,
          },
        },
        audience: {
          type: 'object',
          additionalProperties: false,
          required: ['primary_audience', 'pain_points', 'desires'],
          properties: {
            primary_audience: stringField,
            pain_points: stringArrayField,
            desires: stringArrayField,
          },
        },
        brand: {
          type: 'object',
          additionalProperties: false,
          required: ['personality', 'tone_of_voice', 'positioning', 'tagline'],
          properties: {
            personality: stringArrayField,
            tone_of_voice: stringField,
            positioning: stringField,
            tagline: stringField,
          },
        },
        visual_identity: {
          type: 'object',
          additionalProperties: false,
          required: ['logo_direction', 'logo_concept_board', 'color_palette', 'typography'],
          properties: {
            logo_direction: stringField,
            logo_concept_board: logoConceptBoardSchema,
            color_palette: {
              type: 'array',
              minItems: 5,
              maxItems: 5,
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['name', 'hex', 'usage'],
                properties: {
                  name: stringField,
                  hex: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
                  usage: stringField,
                },
              },
            },
            typography: {
              type: 'object',
              additionalProperties: false,
              required: ['heading', 'body', 'accent'],
              properties: {
                heading: stringField,
                body: stringField,
                accent: stringField,
              },
            },
          },
        },
        moodboard: {
          type: 'object',
          additionalProperties: false,
          required: ['keywords', 'visual_references', 'photography_style', 'layout_style', 'texture_and_materials'],
          properties: {
            keywords: stringArrayField,
            visual_references: stringArrayField,
            photography_style: stringField,
            layout_style: stringField,
            texture_and_materials: stringArrayField,
          },
        },
        deliverables: stringArrayField,
        portfolio_project_ideas: stringArrayField,
        prompts: {
          type: 'object',
          additionalProperties: false,
          required: [
            'landing_page_prompt',
            'logo_prompt',
            'logo_concept_board_prompt',
            'moodboard_image_prompt',
            'social_media_prompt',
            'lovable_or_cursor_prompt',
            'master_execution_prompt',
          ],
          properties: {
            landing_page_prompt: stringField,
            logo_prompt: stringField,
            logo_concept_board_prompt: stringField,
            moodboard_image_prompt: stringField,
            social_media_prompt: stringField,
            lovable_or_cursor_prompt: stringField,
            master_execution_prompt: stringField,
          },
        },
        agent_skills: {
          type: 'object',
          additionalProperties: false,
          required: ['briefing', 'brand', 'moodboard', 'prompts', 'deliverables'],
          properties: {
            briefing: agentSkillSchema,
            brand: agentSkillSchema,
            moodboard: agentSkillSchema,
            prompts: agentSkillSchema,
            deliverables: agentSkillSchema,
          },
        },
      },
    },
  },
} as const;

function validateString(val: any, path: string): string {
  if (typeof val !== 'string' || val.trim().length === 0) {
    throw new Error(`AI response missing or invalid field: ${path}`);
  }
  return val.trim();
}

function validateStringArray(val: any, path: string): string[] {
  if (!Array.isArray(val) || val.length === 0) {
    throw new Error(`AI response missing or empty array: ${path}`);
  }
  const filtered = val.filter((v) => typeof v === 'string' && v.trim().length > 0);
  if (filtered.length === 0) {
    throw new Error(`AI response array has no valid strings: ${path}`);
  }
  return filtered;
}

function validateColorPalette(val: any, path: string): Array<{ name: string; hex: string; usage: string }> {
  if (!Array.isArray(val) || val.length === 0) {
    throw new Error(`AI response missing color palette: ${path}`);
  }
  const valid = val.filter(
    (c: any) =>
      typeof c?.name === 'string' && c.name.trim().length > 0 &&
      typeof c?.hex === 'string' && /^#[0-9A-Fa-f]{6}$/.test(c.hex) &&
      typeof c?.usage === 'string' && c.usage.trim().length > 0
  );
  if (valid.length === 0) {
    throw new Error(`AI response color palette has no valid entries: ${path}`);
  }
  return valid.slice(0, 10);
}

function validateLogoConceptBoard(val: any, path: string): NonNullable<BriefingData['visual_identity']['logo_concept_board']> {
  return {
    concept_name: validateString(val?.concept_name, `${path}.concept_name`),
    logo_type: validateString(val?.logo_type, `${path}.logo_type`),
    composition: validateString(val?.composition, `${path}.composition`),
    symbol_meaning: validateStringArray(val?.symbol_meaning, `${path}.symbol_meaning`),
    required_variations: validateStringArray(val?.required_variations, `${path}.required_variations`),
    board_sections: validateStringArray(val?.board_sections, `${path}.board_sections`),
    production_notes: validateStringArray(val?.production_notes, `${path}.production_notes`),
  };
}

function normalizeSkillName(val: any, path: string): string {
  const rawName = validateString(val, path);
  const normalized = rawName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  if (!normalized) {
    throw new Error(`AI response invalid skill name: ${path}`);
  }

  return normalized;
}

function validateAgentSkill(val: any, path: string) {
  return {
    name: normalizeSkillName(val?.name, `${path}.name`),
    description: validateString(val?.description, `${path}.description`),
    when_to_use: validateString(val?.when_to_use, `${path}.when_to_use`),
    instructions: validateStringArray(val?.instructions, `${path}.instructions`),
    quality_checks: validateStringArray(val?.quality_checks, `${path}.quality_checks`),
  };
}

function validateBriefing(raw: any): BriefingData {
  return {
    client: {
      name: validateString(raw?.client?.name, 'client.name'),
      segment: validateString(raw?.client?.segment, 'client.segment'),
      location: validateString(raw?.client?.location, 'client.location'),
      short_description: validateString(raw?.client?.short_description, 'client.short_description'),
      brand_story: validateString(raw?.client?.brand_story, 'client.brand_story'),
      main_problem: validateString(raw?.client?.main_problem, 'client.main_problem'),
      business_goal: validateString(raw?.client?.business_goal, 'client.business_goal'),
    },
    audience: {
      primary_audience: validateString(raw?.audience?.primary_audience, 'audience.primary_audience'),
      pain_points: validateStringArray(raw?.audience?.pain_points, 'audience.pain_points'),
      desires: validateStringArray(raw?.audience?.desires, 'audience.desires'),
    },
    brand: {
      personality: validateStringArray(raw?.brand?.personality, 'brand.personality'),
      tone_of_voice: validateString(raw?.brand?.tone_of_voice, 'brand.tone_of_voice'),
      positioning: validateString(raw?.brand?.positioning, 'brand.positioning'),
      tagline: validateString(raw?.brand?.tagline, 'brand.tagline'),
    },
    visual_identity: {
      logo_direction: validateString(raw?.visual_identity?.logo_direction, 'visual_identity.logo_direction'),
      logo_concept_board: validateLogoConceptBoard(
        raw?.visual_identity?.logo_concept_board,
        'visual_identity.logo_concept_board'
      ),
      color_palette: validateColorPalette(raw?.visual_identity?.color_palette, 'visual_identity.color_palette'),
      typography: {
        heading: validateString(raw?.visual_identity?.typography?.heading, 'visual_identity.typography.heading'),
        body: validateString(raw?.visual_identity?.typography?.body, 'visual_identity.typography.body'),
        accent: validateString(raw?.visual_identity?.typography?.accent, 'visual_identity.typography.accent'),
      },
    },
    moodboard: {
      keywords: validateStringArray(raw?.moodboard?.keywords, 'moodboard.keywords'),
      visual_references: validateStringArray(raw?.moodboard?.visual_references, 'moodboard.visual_references'),
      photography_style: validateString(raw?.moodboard?.photography_style, 'moodboard.photography_style'),
      layout_style: validateString(raw?.moodboard?.layout_style, 'moodboard.layout_style'),
      texture_and_materials: validateStringArray(raw?.moodboard?.texture_and_materials, 'moodboard.texture_and_materials'),
    },
    deliverables: validateStringArray(raw?.deliverables, 'deliverables'),
    portfolio_project_ideas: validateStringArray(raw?.portfolio_project_ideas, 'portfolio_project_ideas'),
    prompts: {
      landing_page_prompt: validateString(raw?.prompts?.landing_page_prompt, 'prompts.landing_page_prompt'),
      logo_prompt: validateString(raw?.prompts?.logo_prompt, 'prompts.logo_prompt'),
      logo_concept_board_prompt: validateString(
        raw?.prompts?.logo_concept_board_prompt,
        'prompts.logo_concept_board_prompt'
      ),
      moodboard_image_prompt: validateString(raw?.prompts?.moodboard_image_prompt, 'prompts.moodboard_image_prompt'),
      social_media_prompt: validateString(raw?.prompts?.social_media_prompt, 'prompts.social_media_prompt'),
      lovable_or_cursor_prompt: validateString(raw?.prompts?.lovable_or_cursor_prompt, 'prompts.lovable_or_cursor_prompt'),
      master_execution_prompt: validateString(raw?.prompts?.master_execution_prompt, 'prompts.master_execution_prompt'),
    },
    agent_skills: {
      briefing: validateAgentSkill(raw?.agent_skills?.briefing, 'agent_skills.briefing'),
      brand: validateAgentSkill(raw?.agent_skills?.brand, 'agent_skills.brand'),
      moodboard: validateAgentSkill(raw?.agent_skills?.moodboard, 'agent_skills.moodboard'),
      prompts: validateAgentSkill(raw?.agent_skills?.prompts, 'agent_skills.prompts'),
      deliverables: validateAgentSkill(raw?.agent_skills?.deliverables, 'agent_skills.deliverables'),
    },
  };
}

export async function generateBriefingAI(params: {
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
  focusStage?: RegenerationStage;
}): Promise<BriefingData> {
  const { business_type, visual_style, project_goal, language, complexity, focusStage } = params;

  const langName = SUPPORTED_LANGUAGES[language] || 'Portuguese (Brazilian)';
  const complexityInstruction = COMPLEXITY_INSTRUCTIONS[complexity] || COMPLEXITY_INSTRUCTIONS.completo;
  const focusInstruction = focusStage
    ? `\nRegeneration focus: ${REGENERATION_STAGE_INSTRUCTIONS[focusStage]}`
    : '';

  const userMessage = `Create a brand briefing with these parameters:
- Business type: ${business_type}
- Visual style: ${visual_style}
- Project goal: ${project_goal}
- Language: ${langName}
- Complexity: ${complexity}

${complexityInstruction}
${focusInstruction}

Make prompts production-ready, with enough context for another AI agent to execute without reading the UI tabs manually.
Make deliverables concrete enough for a designer/developer to know exactly what files, formats and visual boards must be produced.
Use the Agent Skills convention from agentskills.io: skill names in lowercase kebab-case, specific descriptions, concise activation criteria, concrete step-by-step instructions, and quality checks.
Write all textual content in ${langName}. Be creative and specific.`;

  const config = getActiveAiConfig();

  if (!config.apiKey) {
    throw new Error(`${config.displayName} API key is not configured`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60_000);

  try {
    const body: Record<string, unknown> = {
      model: config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.9,
      max_tokens: 6000,
      response_format: config.responseFormat,
    };

    if (config.provider === 'deepseek') {
      body.thinking = { type: 'disabled' };
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${config.displayName} API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const finishReason: string | undefined = data.choices?.[0]?.finish_reason;

    if (finishReason === 'length') {
      throw new Error(`${config.displayName} response reached the token limit before finishing`);
    }

    const content: string | undefined = data.choices?.[0]?.message?.content;

    if (!content || content.trim().length === 0) {
      throw new Error(`${config.displayName} returned empty content`);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error(`${config.displayName} returned invalid JSON`);
    }

    return validateBriefing(parsed);
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`${getActiveAiConfig().displayName} request timed out (60s)`);
    }

    throw error;
  }
}

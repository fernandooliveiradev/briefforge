import { BriefingData } from './db';

export function hasAiKey(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

const SYSTEM_PROMPT = `You are a creative brand strategist. Generate a complete fictional brand briefing in JSON format exactly matching the given TypeScript interface.

Return ONLY a valid JSON object, no additional text, no markdown formatting.

The interface to match:
interface BriefingData {
  client: {
    name: string;
    segment: string;
    location: string;
    short_description: string;
    brand_story: string;
    main_problem: string;
    business_goal: string;
  };
  audience: {
    primary_audience: string;
    pain_points: string[];
    desires: string[];
  };
  brand: {
    personality: string[];
    tone_of_voice: string;
    positioning: string;
    tagline: string;
  };
  visual_identity: {
    logo_direction: string;
    color_palette: Array<{ name: string; hex: string; usage: string }>;
    typography: { heading: string; body: string; accent: string };
  };
  moodboard: {
    keywords: string[];
    visual_references: string[];
    photography_style: string;
    layout_style: string;
    texture_and_materials: string[];
  };
  deliverables: string[];
  portfolio_project_ideas: string[];
  prompts: {
    landing_page_prompt: string;
    logo_prompt: string;
    moodboard_image_prompt: string;
    social_media_prompt: string;
    lovable_or_cursor_prompt: string;
  };
}

Generate realistic, detailed content. Use the user's input for business type, visual style, goal, complexity, and language. Write all text in the requested language (Portuguese or English). The client name should sound like a real brand in that segment. For the color palette, provide 5 colors with hex codes and usage descriptions. Suggest actual font names used in design (e.g., Playfair Display, Inter, Montserrat). The moodboard keywords, references, textures should match the visual style. Generate specific, actionable prompts for each category.`;

export async function generateBriefingAI(params: {
  business_type: string;
  visual_style: string;
  project_goal: string;
  language: string;
  complexity: string;
}): Promise<BriefingData> {
  const { business_type, visual_style, project_goal, language, complexity } = params;

  const langName = language === 'ingles' ? 'English' : 'Portuguese (Brazilian)';

  const userMessage = `Create a brand briefing with these parameters:
- Business type: ${business_type}
- Visual style: ${visual_style}
- Project goal: ${project_goal}
- Language: ${langName}
- Complexity: ${complexity}

Write all textual content in ${langName}. Make it thorough and realistic.`;

  const apiKey = process.env.OPENAI_API_KEY!;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI response missing content');
  }

  let parsed: BriefingData;
  try {
    parsed = JSON.parse(content);
  } catch (parseError) {
    throw new Error('Failed to parse OpenAI JSON response');
  }

  // Validação mínima
  if (!parsed.client?.name || !parsed.visual_identity?.color_palette?.length) {
    throw new Error('Incomplete briefing data from AI');
  }

  return parsed;
}
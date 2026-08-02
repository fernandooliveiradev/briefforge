import { describe, it, expect } from "vitest";
import {
  extractJsonObject,
  validateBriefing,
  getAiGenerationPublicMessage,
  AiGenerationError,
} from "@/lib/generate-briefing-ai";

const validPayload: Record<string, unknown> = {
  client: {
    name: "Acme Studio",
    segment: "design",
    location: "Recife, PE, Brazil",
    short_description: "Creative studio",
    brand_story: "Founded in 2019",
    main_problem: "Low awareness",
    business_goal: "Grow portfolio",
  },
  audience: {
    primary_audience: "Startups",
    pain_points: ["Boring brands"],
    desires: ["Memorable identity"],
  },
  brand: {
    personality: ["bold", "playful"],
    tone_of_voice: "friendly",
    positioning: "premium",
    tagline: "Make it yours",
  },
  visual_identity: {
    logo_direction: "modern wordmark",
    logo_concept_board: {
      concept_name: "Prancha premium",
      logo_type: "wordmark",
      composition: "centered",
      symbol_meaning: ["growth"],
      required_variations: ["principal", "secundária"],
      board_sections: ["logo", "paleta"],
      production_notes: ["use PDF"],
    },
    color_palette: [
      { name: "Vermelho", hex: "#FF0000", usage: "destaque" },
      { name: "Azul", hex: "#0000FF", usage: "principal" },
      { name: "Verde", hex: "#00FF00", usage: "apoio" },
      { name: "Preto", hex: "#000000", usage: "texto" },
      { name: "Branco", hex: "#FFFFFF", usage: "fundo" },
    ],
    typography: { heading: "Inter", body: "DM Sans", accent: "Space Grotesk" },
  },
  moodboard: {
    keywords: ["clean"],
    visual_references: ["geometry"],
    photography_style: "minimal",
    layout_style: "grid",
    texture_and_materials: ["paper"],
  },
  deliverables: ["logo SVG"],
  portfolio_project_ideas: ["case study"],
  prompts: {
    landing_page_prompt: "landing",
    logo_prompt: "logo",
    logo_concept_board_prompt: "board",
    moodboard_image_prompt: "mood",
    social_media_prompt: "social",
    lovable_or_cursor_prompt: "impl",
    master_execution_prompt: "master",
  },
  agent_skills: {
    briefing: { name: "briefing-strategist", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["b"] },
    brand: { name: "brand-director", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["b"] },
    moodboard: { name: "moodboard-curator", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["b"] },
    prompts: { name: "prompt-lead", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["b"] },
    deliverables: { name: "deliverables-planner", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["b"] },
  },
};

describe("extractJsonObject", () => {
  it("parses a plain JSON object", () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it("extracts JSON wrapped in a markdown code fence", () => {
    const content = "```json\n{\"a\":1}\n```";
    expect(extractJsonObject(content)).toEqual({ a: 1 });
  });

  it("extracts a balanced object from surrounding prose", () => {
    const content = "Here is your result: {\"a\":1} hope it helps";
    expect(extractJsonObject(content)).toEqual({ a: 1 });
  });

  it("handles nested braces inside strings", () => {
    const content = '{"text":"a {nested} brace"}';
    expect(extractJsonObject(content)).toEqual({ text: "a {nested} brace" });
  });

  it("throws when no JSON object is present", () => {
    expect(() => extractJsonObject("no object here")).toThrow("No JSON object found");
  });

  it("throws on incomplete JSON", () => {
    expect(() => extractJsonObject('{"a":')).toThrow();
  });
});

describe("validateBriefing", () => {
  it("returns a complete BriefingData for a valid payload", () => {
    const result = validateBriefing(validPayload, "portugues");
    expect(result.client.name).toBe("Acme Studio");
    expect(result.audience.pain_points).toEqual(["Boring brands"]);
    expect(result.visual_identity.color_palette).toHaveLength(5);
    expect(result.prompts.master_execution_prompt).not.toBe("");
  });

  it("normalizes skill names to lowercase kebab-case", () => {
    const result = validateBriefing(validPayload, "portugues");
    expect(result.agent_skills.briefing.name).toBe("briefing-strategist");
  });

  it("fills missing fields from the fallback briefing (partial regeneration)", () => {
    const fallback = validateBriefing(validPayload, "portugues");
    const partial = {
      moodboard: {
        keywords: ["novo"],
        visual_references: ["ref"],
        photography_style: "editorial",
        layout_style: "asymmetric",
        texture_and_materials: ["metal"],
      },
    };

    const result = validateBriefing(partial, "portugues", fallback);

    expect(result.moodboard.keywords).toEqual(["novo"]);
    expect(result.client.name).toBe("Acme Studio");
    expect(result.brand.tone_of_voice).toBe("friendly");
    expect(result.visual_identity.color_palette).toHaveLength(5);
  });

  it("filters out invalid hex entries from the color palette", () => {
    const bad = structuredClone(validPayload);
    (bad.visual_identity as Record<string, unknown>).color_palette = [
      { name: "Invalido", hex: "#GGGGGG", usage: "x" },
      { name: "Azul", hex: "#0000FF", usage: "p" },
      { name: "Verde", hex: "#00FF00", usage: "a" },
      { name: "Preto", hex: "#000000", usage: "t" },
      { name: "Branco", hex: "#FFFFFF", usage: "f" },
    ];
    const result = validateBriefing(bad, "portugues");
    const hexes = result.visual_identity.color_palette.map((c) => c.hex);
    expect(hexes).not.toContain("#GGGGGG");
    expect(hexes).toContain("#0000FF");
  });

  it("throws when required string fields are empty", () => {
    const bad = structuredClone(validPayload);
    (bad.client as Record<string, unknown>).name = "";
    expect(() => validateBriefing(bad, "portugues")).toThrow(/client.name/);
  });

  it("conditions the fallback implementation prompt on the project goal", () => {
    const withoutPrompts = structuredClone(validPayload);
    delete withoutPrompts.prompts;

    const app = validateBriefing(withoutPrompts, "portugues", undefined, "app");
    const landing = validateBriefing(withoutPrompts, "portugues", undefined, "landing_page");

    expect(app.prompts.lovable_or_cursor_prompt).toMatch(/aplicativo mobile/);
    expect(landing.prompts.lovable_or_cursor_prompt).toMatch(/landing page/);
    expect(app.prompts.lovable_or_cursor_prompt).not.toBe(landing.prompts.lovable_or_cursor_prompt);
  });
});

describe("getAiGenerationPublicMessage", () => {
  it("returns the public message of an AiGenerationError", () => {
    const error = new AiGenerationError("internal", "Falha na geração", "timeout");
    expect(getAiGenerationPublicMessage(error)).toBe("Falha na geração");
  });

  it("returns a generic message for unknown errors", () => {
    expect(getAiGenerationPublicMessage(new Error("boom"))).toContain("não pôde ser concluída");
  });
});

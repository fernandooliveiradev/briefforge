import { describe, it, expect } from "vitest";
import { projectRequestSchema, businessTypeOptions, aiProviderOptions } from "@/lib/project-options";

describe("projectRequestSchema", () => {
  it("accepts a valid request", () => {
    const result = projectRequestSchema.safeParse({
      business_type: "saas",
      visual_style: "minimalista",
      project_goal: "landing_page",
      language: "portugues",
      complexity: "completo",
      ai_provider: "deepseek",
    });
    expect(result.success).toBe(true);
  });

  it("defaults ai_provider to openai", () => {
    const result = projectRequestSchema.safeParse({
      business_type: "saas",
      visual_style: "minimalista",
      project_goal: "landing_page",
      language: "portugues",
      complexity: "simples",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ai_provider).toBe("openai");
    }
  });

  it("rejects an unknown business_type", () => {
    const result = projectRequestSchema.safeParse({
      business_type: "nave_espacial",
      visual_style: "minimalista",
      project_goal: "landing_page",
      language: "portugues",
      complexity: "simples",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown provider", () => {
    const result = projectRequestSchema.safeParse({
      business_type: "saas",
      visual_style: "minimalista",
      project_goal: "landing_page",
      language: "portugues",
      complexity: "simples",
      ai_provider: "claude",
    });
    expect(result.success).toBe(false);
  });

  it("exposes the provider option values", () => {
    const values = aiProviderOptions.map((o) => o.value);
    expect(values).toEqual(["openai", "deepseek", "openrouter"]);
  });

  it("exposes at least one business type option", () => {
    expect(businessTypeOptions.length).toBeGreaterThan(0);
  });
});

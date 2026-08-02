import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createProject,
  deleteProject,
  duplicateProject,
  getAllProjects,
  getProjectById,
  getProjectPreviews,
  getProjectVersions,
  getProjectByShareId,
  setProjectPublic,
  updateProjectBriefing,
  resetDatabaseForTests,
  setDatabasePathForTests,
  isProjectDatabaseError,
} from "@/lib/db";

const briefingJson = JSON.stringify({
  client: { name: "Acme", segment: "saas", location: "Recife" },
  audience: { primary_audience: "Startups", pain_points: ["x"], desires: ["y"] },
  brand: { personality: ["bold"], tone_of_voice: "friendly", positioning: "premium", tagline: "Go" },
  visual_identity: {
    logo_direction: "wordmark",
    logo_concept_board: {
      concept_name: "Board",
      logo_type: "wordmark",
      composition: "center",
      symbol_meaning: ["growth"],
      required_variations: ["principal"],
      board_sections: ["logo"],
      production_notes: ["pdf"],
    },
    color_palette: [{ name: "Vermelho", hex: "#FF0000", usage: "destaque" }],
    typography: { heading: "Inter", body: "DM Sans", accent: "Space Grotesk" },
  },
  moodboard: { keywords: ["clean"], visual_references: ["geo"], photography_style: "min", layout_style: "grid", texture_and_materials: ["paper"] },
  deliverables: ["logo.svg"],
  portfolio_project_ideas: ["case"],
  prompts: {
    landing_page_prompt: "lp",
    logo_prompt: "logo",
    logo_concept_board_prompt: "board",
    moodboard_image_prompt: "mood",
    social_media_prompt: "social",
    lovable_or_cursor_prompt: "impl",
    master_execution_prompt: "master",
  },
  agent_skills: {
    briefing: { name: "b", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["c"] },
    brand: { name: "b", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["c"] },
    moodboard: { name: "b", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["c"] },
    prompts: { name: "b", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["c"] },
    deliverables: { name: "b", description: "d", when_to_use: "w", instructions: ["a"], quality_checks: ["c"] },
  },
});

const baseProject = {
  client_name: "Acme",
  business_type: "saas",
  visual_style: "minimalista",
  project_goal: "landing_page",
  language: "portugues",
  complexity: "completo",
  briefing: briefingJson,
  ai_model: "deepseek:deepseek-v4-pro",
};

let tmpDir: string;

beforeAll(() => {
  tmpDir = mkdtempSync(path.join(tmpdir(), "briefforge-test-"));
});

afterEach(() => {
  resetDatabaseForTests();
});

afterAll(() => {
  resetDatabaseForTests();
  rmSync(tmpDir, { recursive: true, force: true });
});

describe("db", () => {
  it("creates and reads back a project", () => {
    setDatabasePathForTests(path.join(tmpDir, "one.sqlite"));
    const created = createProject(baseProject);

    expect(created.id).toBeGreaterThan(0);
    expect(created.client_name).toBe("Acme");
    expect(created.version).toBe(1);
    expect(created.is_public).toBe(0);

    const loaded = getProjectById(created.id);
    expect(loaded?.client_name).toBe("Acme");
  });

  it("lists all projects", () => {
    setDatabasePathForTests(path.join(tmpDir, "list.sqlite"));
    createProject(baseProject);
    createProject({ ...baseProject, client_name: "Beta" });

    const all = getAllProjects();
    expect(all).toHaveLength(2);
  });

  it("returns previews and filters by query", () => {
    setDatabasePathForTests(path.join(tmpDir, "preview.sqlite"));
    createProject({ ...baseProject, client_name: "Cafeteria Sol", business_type: "restaurante" });

    const previews = getProjectPreviews({ q: "cafeteria" });
    expect(previews).toHaveLength(1);
    expect(previews[0].client_name).toBe("Cafeteria Sol");

    const none = getProjectPreviews({ business_type: "saas" });
    expect(none).toHaveLength(0);
  });

  it("deletes a project", () => {
    setDatabasePathForTests(path.join(tmpDir, "delete.sqlite"));
    const created = createProject(baseProject);

    expect(deleteProject(created.id)).toBe(true);
    expect(deleteProject(created.id)).toBe(false);
    expect(getProjectById(created.id)).toBeUndefined();
  });

  it("duplicates a project and bumps the version", () => {
    setDatabasePathForTests(path.join(tmpDir, "dupe.sqlite"));
    const original = createProject(baseProject);

    const duplicate = duplicateProject(original.id);
    expect(duplicate).toBeDefined();
    expect(duplicate?.version).toBe(2);
    expect(duplicate?.parent_id).toBe(original.id);

    const versions = getProjectVersions(original.id);
    expect(versions).toHaveLength(2);
  });

  it("returns undefined when duplicating a missing project", () => {
    setDatabasePathForTests(path.join(tmpDir, "dupe-missing.sqlite"));
    expect(duplicateProject(999999)).toBeUndefined();
  });

  it("updates a briefing", () => {
    setDatabasePathForTests(path.join(tmpDir, "update.sqlite"));
    const created = createProject(baseProject);
    const newBriefing = JSON.stringify({ ...JSON.parse(briefingJson), client: { ...JSON.parse(briefingJson).client, name: "Nova" } });

    const updated = updateProjectBriefing(created.id, newBriefing, "openai:gpt-4o");
    expect(updated?.client_name).toBe("Acme");
    expect(updated?.ai_model).toBe("openai:gpt-4o");

    expect(updateProjectBriefing(999999, newBriefing, "openai:gpt-4o")).toBeUndefined();
  });

  it("sets public sharing and generates a share id", () => {
    setDatabasePathForTests(path.join(tmpDir, "share.sqlite"));
    const created = createProject(baseProject);

    const shared = setProjectPublic(created.id, true);
    expect(shared?.is_public).toBe(1);
    expect(shared?.share_id).toMatch(/^[a-f0-9]{24}$/);

    const byShare = getProjectByShareId(shared?.share_id as string);
    expect(byShare?.id).toBe(created.id);

    const unshared = setProjectPublic(created.id, false);
    expect(unshared?.is_public).toBe(0);
    expect(getProjectByShareId(shared?.share_id as string)).toBeUndefined();
  });

  it("returns undefined when sharing a missing project", () => {
    setDatabasePathForTests(path.join(tmpDir, "share-missing.sqlite"));
    expect(setProjectPublic(999999, true)).toBeUndefined();
  });

  it("returns empty versions for a missing project", () => {
    setDatabasePathForTests(path.join(tmpDir, "versions-missing.sqlite"));
    expect(getProjectVersions(999999)).toEqual([]);
  });

  it("identifies ProjectDatabaseError instances", () => {
    const error = new Error("boom");
    expect(isProjectDatabaseError(error)).toBe(false);
  });
});

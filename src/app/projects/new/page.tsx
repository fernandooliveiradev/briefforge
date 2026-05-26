import { requirePageAccess } from "@/lib/server-access";
import { getActiveAiProvider, type AiProvider } from "@/lib/generate-briefing-ai";
import { NewProjectForm } from "./new-project-form";

export const dynamic = "force-dynamic";

function getDefaultAiProvider(): AiProvider {
  try {
    return getActiveAiProvider();
  } catch {
    return "openai";
  }
}

export default async function NewProjectPage() {
  await requirePageAccess("/projects/new");

  return <NewProjectForm defaultAiProvider={getDefaultAiProvider()} />;
}

import { requirePageAccess } from "@/lib/server-access";
import { NewProjectForm } from "./new-project-form";

export default async function NewProjectPage() {
  await requirePageAccess("/projects/new");

  return <NewProjectForm />;
}

import { ProjectWizard } from "../components/project-wizard";

export default async function StartPage({ searchParams }: { searchParams: Promise<{ service?: string; idea?: string }> }) {
  const params = await searchParams;
  return <ProjectWizard initialServiceId={params.service ?? null} initialIdea={params.idea ?? ""} />;
}

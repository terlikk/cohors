import { notFound } from "next/navigation";
import { AgentOptions } from "@/components/AgentOptions";
import { getAgent } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AgentOptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  return <AgentOptions agent={agent} />;
}

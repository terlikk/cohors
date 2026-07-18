import { notFound } from "next/navigation";
import { AgentChat } from "@/components/AgentChat";
import { getAgent, listMessages } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AgentChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  return (
    <div className="flex flex-col md:min-h-0 md:flex-1">
      <AgentChat
        agentId={agent.id}
        agentName={agent.name}
        messages={listMessages(id)}
        isManager={agent.role === "manager"}
      />
    </div>
  );
}

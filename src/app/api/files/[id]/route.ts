import fs from "node:fs";
import path from "node:path";
import type { NextRequest } from "next/server";
import { resolveAgentFile } from "@/lib/files";
import { getAgent } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!getAgent(id)) return new Response("Not found", { status: 404 });

  const rel = req.nextUrl.searchParams.get("path") ?? "";
  const file = resolveAgentFile(id, rel);
  if (!file) return new Response("Not found", { status: 404 });

  const data = fs.readFileSync(file);
  const name = path.basename(file);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(name)}"`,
    },
  });
}

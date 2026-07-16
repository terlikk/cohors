import { NextResponse } from "next/server";
import { tick } from "@/lib/executor";

export const dynamic = "force-dynamic";

/** Manual/cron trigger for the executor (used by Vercel Cron in hosted mode). */
export async function GET() {
  const result = await tick();
  return NextResponse.json(result);
}

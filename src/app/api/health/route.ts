import { NextResponse } from "next/server";
import { db, schema } from "@/db";

/** Liveness + a quick census of the hive. Confirms the database is reachable. */
export async function GET() {
  const workers = db.select().from(schema.workers).all();
  return NextResponse.json({
    ok: true,
    hive: {
      workers: workers.length,
      hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY),
    },
  });
}

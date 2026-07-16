/**
 * Next.js instrumentation hook: boots the agent heartbeat when the app runs
 * self-hosted (the primary mode). On Vercel there is no long-lived process,
 * so /api/heartbeat is triggered by Vercel Cron instead.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.VERCEL) {
    const { startHeartbeat } = await import("@/lib/executor");
    startHeartbeat();
  }
}

import fs from "node:fs";
import path from "node:path";

/** Files live in each agent's own workspace, kept apart per agent. */
export interface AgentFile {
  name: string;
  rel: string;
  size: number;
  mtimeMs: number;
}

function workspaceRoot(agentId: string): string {
  return path.join(process.cwd(), "data", "workspace", agentId);
}

/** Lists files an agent produced in its workspace, newest first. */
export function listAgentFiles(agentId: string, max = 200): AgentFile[] {
  const root = workspaceRoot(agentId);
  if (!fs.existsSync(root)) return [];
  const out: AgentFile[] = [];

  const walk = (dir: string, depth: number) => {
    if (out.length >= max || depth > 4) return;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (e.name.startsWith(".") || e.name === "node_modules") continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, depth + 1);
      else if (e.isFile()) {
        try {
          const st = fs.statSync(full);
          out.push({
            name: e.name,
            rel: path.relative(root, full),
            size: st.size,
            mtimeMs: st.mtimeMs,
          });
        } catch {
          /* skip unreadable */
        }
      }
      if (out.length >= max) return;
    }
  };

  walk(root, 0);
  return out.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

/** Resolves a requested path safely inside the agent's workspace, or null. */
export function resolveAgentFile(agentId: string, rel: string): string | null {
  const root = path.resolve(workspaceRoot(agentId));
  const resolved = path.resolve(root, rel);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  try {
    if (!fs.statSync(resolved).isFile()) return null;
  } catch {
    return null;
  }
  return resolved;
}

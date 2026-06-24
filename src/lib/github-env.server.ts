import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** Read a single key from the project `.env` file (dev fallback when process.env is unset). */
function readDotEnv(key: string): string | undefined {
  try {
    const path = join(process.cwd(), ".env");
    if (!existsSync(path)) return undefined;
    const content = readFileSync(path, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const k = trimmed.slice(0, eq).trim();
      if (k !== key) continue;
      let v = trimmed.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return v;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

/** GitHub PAT for server-side API calls. Never expose to the client. */
export function getGithubToken(): string | undefined {
  const fromProcess = process.env.GITHUB_TOKEN?.trim();
  if (fromProcess) return fromProcess;

  const fromFile = readDotEnv("GITHUB_TOKEN")?.trim();
  if (fromFile) {
    process.env.GITHUB_TOKEN = fromFile;
    return fromFile;
  }

  return undefined;
}

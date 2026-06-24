import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Simple in-memory cache (per Worker instance). TTL based.
type CacheEntry<T> = { value: T; expires: number };
const cache = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await loader();
  cache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

const HEADERS: Record<string, string> = {
  "Accept": "application/vnd.github+json",
  "User-Agent": "lovable-portfolio",
};
if (process.env.GITHUB_TOKEN) HEADERS["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;

const ghHeaders = () => {
  const h: Record<string, string> = { ...HEADERS };
  if (process.env.GITHUB_TOKEN) h["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
};

class GitHubError extends Error {
  status: number;
  constructor(status: number, url: string) {
    super(`GitHub ${status}: ${url}`);
    this.status = status;
  }
}
async function gh<T>(url: string): Promise<T> {
  const r = await fetch(url, { headers: ghHeaders() });
  if (!r.ok) throw new GitHubError(r.status, url);
  return r.json() as Promise<T>;
}

export type GHProfile = {
  login: string; name: string | null; avatar_url: string; bio: string | null;
  followers: number; following: number; public_repos: number; html_url: string;
  location: string | null; blog: string | null; company: string | null;
};
export type GHRepo = {
  id: number; name: string; full_name: string; html_url: string;
  description: string | null; stargazers_count: number; forks_count: number;
  language: string | null; topics: string[]; updated_at: string; fork: boolean; archived: boolean;
  homepage: string | null;
};
export type ContribDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type ContribData = {
  total: number;
  weeks: ContribDay[][]; // 53 weeks x 7 days
  longestStreak: number;
  currentStreak: number;
  bestDay: { date: string; count: number };
};

export const getGithubProfile = createServerFn({ method: "GET" })
  .validator(z.object({ user: z.string().min(1) }))
  .handler(async ({ data }) => {
    return cached(`profile:${data.user}`, 10 * 60_000, async () => {
      try {
        const p = await gh<GHProfile>(`https://api.github.com/users/${encodeURIComponent(data.user)}`);
        return {
          login: p.login, name: p.name, avatar_url: p.avatar_url, bio: p.bio,
          followers: p.followers, following: p.following, public_repos: p.public_repos,
          html_url: p.html_url, location: p.location, blog: p.blog, company: p.company,
          _error: null as string | null,
        };
      } catch (e) {
        const status = e instanceof GitHubError ? e.status : 0;
        return {
          login: data.user, name: data.user, avatar_url: `https://github.com/${data.user}.png`,
          bio: null, followers: 0, following: 0, public_repos: 0,
          html_url: `https://github.com/${data.user}`,
          location: null, blog: null, company: null,
          _error: status === 403 ? "GitHub rate limit reached. Add a GITHUB_TOKEN secret to fix." : `GitHub error ${status || "unknown"}`,
        };
      }
    });
  });

export const getGithubRepos = createServerFn({ method: "GET" })
  .validator(z.object({ user: z.string().min(1) }))
  .handler(async ({ data }) => {
    return cached(`repos:${data.user}`, 10 * 60_000, async () => {
      try {
        const repos = await gh<GHRepo[]>(
          `https://api.github.com/users/${encodeURIComponent(data.user)}/repos?per_page=100&sort=updated`
        );
        return repos
          .filter((r) => !r.fork && !r.archived)
          .map((r) => ({
            id: r.id, name: r.name, full_name: r.full_name, html_url: r.html_url,
            description: r.description, stargazers_count: r.stargazers_count,
            forks_count: r.forks_count, language: r.language, topics: r.topics ?? [],
            updated_at: r.updated_at, fork: r.fork, archived: r.archived,
            homepage: r.homepage,
          }))
          .sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.updated_at) - +new Date(a.updated_at));
      } catch (e) {
        console.error("getGithubRepos failed:", e);
        return [] as GHRepo[];
      }
    });
  });

export const getGithubLanguages = createServerFn({ method: "GET" })
  .validator(z.object({ user: z.string().min(1) }))
  .handler(async ({ data }) => {
    return cached(`langs:${data.user}`, 15 * 60_000, async () => {
      try {
        const repos = await gh<GHRepo[]>(
          `https://api.github.com/users/${encodeURIComponent(data.user)}/repos?per_page=100`
        );
        const active = repos.filter((r) => !r.fork && !r.archived);
        const chunk = active.slice(0, 25);
        const all = await Promise.all(
          chunk.map((r) =>
            gh<Record<string, number>>(`https://api.github.com/repos/${r.full_name}/languages`).catch(() => ({}))
          )
        );
        const totals: Record<string, number> = {};
        for (const langs of all) {
          for (const [k, v] of Object.entries(langs)) totals[k] = (totals[k] ?? 0) + v;
        }
        const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
        return Object.entries(totals)
          .map(([name, bytes]) => ({ name, bytes, pct: (bytes / sum) * 100 }))
          .sort((a, b) => b.bytes - a.bytes)
          .slice(0, 10);
      } catch (e) {
        console.error("getGithubLanguages failed:", e);
        return [] as { name: string; bytes: number; pct: number }[];
      }
    });
  });

export const getGithubContributions = createServerFn({ method: "GET" })
  .validator(z.object({ user: z.string().min(1) }))
  .handler(async ({ data }) => {
    return cached(`contrib:${data.user}`, 30 * 60_000, async () => {
      const empty: ContribData = { total: 0, weeks: [], longestStreak: 0, currentStreak: 0, bestDay: { date: "", count: 0 } };
      try {
        const r = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(data.user)}?y=last`
        );
        if (!r.ok) return empty;
        const json = (await r.json()) as {
          total: Record<string, number>;
          contributions: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[];
        };
        const days = json.contributions;
        const weeks: ContribDay[][] = [];
        let current: ContribDay[] = [];
        for (const d of days) {
          const dow = new Date(d.date).getUTCDay();
          if (dow === 0 && current.length) { weeks.push(current); current = []; }
          current.push(d);
        }
        if (current.length) weeks.push(current);
        let longest = 0, cur = 0, running = 0;
        for (const d of days) {
          if (d.count > 0) { running++; longest = Math.max(longest, running); } else running = 0;
        }
        for (let i = days.length - 1; i >= 0; i--) {
          if (days[i].count > 0) cur++; else break;
        }
        const bestDay = days.reduce((a, b) => (b.count > a.count ? b : a), { date: "", count: 0 });
        const total = days.reduce((a, b) => a + b.count, 0);
        return { total, weeks, longestStreak: longest, currentStreak: cur, bestDay: { date: bestDay.date, count: bestDay.count } } as ContribData;
      } catch (e) {
        console.error("getGithubContributions failed:", e);
        return empty;
      }
    });
  });

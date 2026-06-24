import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getGithubToken } from "./github-env.server";

type CacheEntry<T> = { value: T; expires: number };
const cache = new Map<string, CacheEntry<unknown>>();

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const value = await loader();
  cache.set(key, { value, expires: Date.now() + ttlMs });
  return value;
}

function ghHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "vskanna-portfolio",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = getGithubToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

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

const RATE_LIMIT_HINT =
  "GitHub API rate limit hit. Add GITHUB_TOKEN to your .env and restart the dev server.";

function githubErrorMessage(status: number, hasToken: boolean): string {
  if (status === 401) return "GitHub token is invalid or expired. Update GITHUB_TOKEN in .env.";
  if (status === 403) {
    return hasToken
      ? "GitHub denied this request (403). Check that your token is valid and not rate-limited."
      : RATE_LIMIT_HINT;
  }
  return `GitHub error ${status || "unknown"}`;
}

export type GHProfile = {
  login: string; name: string | null; avatar_url: string; bio: string | null;
  followers: number; following: number; public_repos: number; html_url: string;
  location: string | null; blog: string | null; company: string | null;
  _error?: string | null;
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
  weeks: ContribDay[][];
  longestStreak: number;
  currentStreak: number;
  bestDay: { date: string; count: number };
};

type RepoListResult = { repos: GHRepo[]; error: string | null };

function mapRepo(r: {
  id: number; name: string; full_name: string; html_url: string;
  description: string | null; stargazers_count: number; forks_count: number;
  language: string | null; topics?: string[]; updated_at: string; fork: boolean; archived: boolean;
  homepage: string | null;
}): GHRepo {
  return {
    id: r.id, name: r.name, full_name: r.full_name, html_url: r.html_url,
    description: r.description, stargazers_count: r.stargazers_count,
    forks_count: r.forks_count, language: r.language, topics: r.topics ?? [],
    updated_at: r.updated_at, fork: r.fork, archived: r.archived,
    homepage: r.homepage,
  };
}

async function fetchUserRepos(user: string): Promise<RepoListResult> {
  try {
    const raw = await gh<Awaited<ReturnType<typeof mapRepo>>[]>(
      `https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`,
    );
    const repos = raw
      .filter((r) => !r.fork && !r.archived)
      .map(mapRepo)
      .sort((a, b) => b.stargazers_count - a.stargazers_count || +new Date(b.updated_at) - +new Date(a.updated_at));
    return { repos, error: null };
  } catch (e) {
    const status = e instanceof GitHubError ? e.status : 0;
    const error = githubErrorMessage(status, Boolean(getGithubToken()));
    return { repos: [], error };
  }
}

function languagesFromRepos(repos: GHRepo[]) {
  const totals: Record<string, number> = {};
  for (const r of repos) {
    if (!r.language) continue;
    totals[r.language] = (totals[r.language] ?? 0) + 1;
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(totals)
    .map(([name, count]) => ({ name, bytes: count, pct: (count / sum) * 100 }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 10);
}

export const getGithubProfile = createServerFn({ method: "GET" })
  .validator(z.object({ user: z.string().min(1) }))
  .handler(async ({ data }) => {
    const key = `profile:${data.user}`;
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as GHProfile & { _error: string | null };

    try {
      const p = await gh<GHProfile>(`https://api.github.com/users/${encodeURIComponent(data.user)}`);
      const value = {
        login: p.login, name: p.name, avatar_url: p.avatar_url, bio: p.bio,
        followers: p.followers, following: p.following, public_repos: p.public_repos,
        html_url: p.html_url, location: p.location, blog: p.blog, company: p.company,
        _error: null as string | null,
      };
      cache.set(key, { value, expires: Date.now() + 10 * 60_000 });
      return value;
    } catch (e) {
      const status = e instanceof GitHubError ? e.status : 0;
      return {
        login: data.user, name: data.user, avatar_url: `https://github.com/${data.user}.png`,
        bio: null, followers: 0, following: 0, public_repos: 0,
        html_url: `https://github.com/${data.user}`,
        location: null, blog: null, company: null,
        _error: githubErrorMessage(status, Boolean(getGithubToken())),
      };
    }
  });

export const getGithubRepos = createServerFn({ method: "GET" })
  .validator(z.object({ user: z.string().min(1) }))
  .handler(async ({ data }) => {
    const key = `repos:${data.user}`;
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) {
      const v = hit.value as RepoListResult;
      return v.repos;
    }
    const result = await fetchUserRepos(data.user);
    if (!result.error) {
      cache.set(key, { value: result, expires: Date.now() + 10 * 60_000 });
    }
    if (result.error) console.warn("getGithubRepos:", result.error);
    return result.repos;
  });

export const getGithubLanguages = createServerFn({ method: "GET" })
  .validator(z.object({ user: z.string().min(1) }))
  .handler(async ({ data }) => {
    const key = `langs:${data.user}`;
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value as { name: string; bytes: number; pct: number }[];

    const repoKey = `repos:${data.user}`;
    let repos: GHRepo[] = [];
    const repoHit = cache.get(repoKey);
    if (repoHit && repoHit.expires > Date.now()) {
      repos = (repoHit.value as RepoListResult).repos;
    } else {
      const result = await fetchUserRepos(data.user);
      if (!result.error) {
        cache.set(repoKey, { value: result, expires: Date.now() + 10 * 60_000 });
      }
      repos = result.repos;
      if (result.error) console.warn("getGithubLanguages:", result.error);
    }

    const langs = languagesFromRepos(repos);
    if (langs.length) {
      cache.set(key, { value: langs, expires: Date.now() + 15 * 60_000 });
    }
    return langs;
  });

export const getGithubContributions = createServerFn({ method: "GET" })
  .validator(z.object({ user: z.string().min(1) }))
  .handler(async ({ data }) => {
    return cached(`contrib:${data.user}`, 30 * 60_000, async () => {
      const empty: ContribData = { total: 0, weeks: [], longestStreak: 0, currentStreak: 0, bestDay: { date: "", count: 0 } };
      try {
        const r = await fetch(
          `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(data.user)}?y=last`,
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
        console.warn("getGithubContributions failed:", e);
        return empty;
      }
    });
  });

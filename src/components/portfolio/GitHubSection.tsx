import { motion, useInView, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Github, Star, GitFork, Flame, Activity, Users, BookOpen, ExternalLink } from "lucide-react";
import {
  getGithubProfile,
  getGithubRepos,
  getGithubLanguages,
  getGithubContributions,
} from "@/lib/github.functions";

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#F7DF1E", TypeScript: "#3178C6", Python: "#3776AB", Java: "#E76F00",
  HTML: "#E34F26", CSS: "#1572B6", C: "#A8B9CC", "C++": "#00599C", PHP: "#777BB4",
  Go: "#00ADD8", Rust: "#DEA584", Shell: "#89E051", Vue: "#41B883", Jupyter: "#DA5B0B",
  R: "#198CE7", Dockerfile: "#384d54", Ruby: "#CC342D", Kotlin: "#A97BFF",
};
const colorFor = (l: string) => LANG_COLORS[l] ?? "#4F46E5";

// Silicon & Cream contribution scale: cream → indigo → terracotta
const LEVEL_COLORS = [
  "rgba(30,27,27,0.05)",
  "rgba(139, 123, 216, 0.35)",
  "rgba(79, 70, 229, 0.55)",
  "rgba(79, 70, 229, 0.85)",
  "#F97316",
];

export function GitHubSection({ user }: { user: string }) {
  const profileFn = useServerFn(getGithubProfile);
  const reposFn = useServerFn(getGithubRepos);
  const langsFn = useServerFn(getGithubLanguages);
  const contribFn = useServerFn(getGithubContributions);

  const profile = useQuery({
    queryKey: ["gh-profile", user],
    queryFn: () => profileFn({ data: { user } }),
    staleTime: 10 * 60_000,
  });
  const repos = useQuery({
    queryKey: ["gh-repos", user],
    queryFn: () => reposFn({ data: { user } }),
    staleTime: 10 * 60_000,
  });
  const langs = useQuery({
    queryKey: ["gh-langs", user],
    queryFn: () => langsFn({ data: { user } }),
    staleTime: 15 * 60_000,
  });
  const contrib = useQuery({
    queryKey: ["gh-contrib", user],
    queryFn: () => contribFn({ data: { user } }),
    staleTime: 30 * 60_000,
  });

  const totalStars = repos.data?.reduce((a, r) => a + r.stargazers_count, 0) ?? 0;
  const apiError = profile.data?._error ?? null;

  return (
    <section id="github" className="relative mx-auto max-w-7xl px-6 py-32">
      <div className="mb-14 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--coral)]/30 bg-[var(--coral)]/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--coral)]"
        >
          <Github className="h-3 w-3" /> From GitHub
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
        >
          My <span className="text-gradient">GitHub</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.25 }}
          className="mt-4 text-muted-foreground"
        >
          Live stats from{" "}
          <a href={`https://github.com/${user}`} target="_blank" rel="noreferrer" className="text-[var(--coral)] underline-offset-4 hover:underline">
            @{user}
          </a>
          — repos, contributions, and languages.
        </motion.p>
        {apiError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 rounded-xl border border-[var(--amber)]/30 bg-[var(--amber)]/8 px-4 py-3 text-sm text-muted-foreground"
          >
            {apiError}
          </motion.p>
        )}
      </div>

      {/* Profile + magnetic stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="glass-strong relative mb-8 overflow-hidden rounded-3xl p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 animate-aurora rounded-full bg-[var(--coral)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 animate-aurora rounded-full bg-[var(--amber)]/20 blur-3xl" style={{ animationDelay: "3s" }} />
        <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 160, damping: 14 }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-1 rounded-full"
              style={{ background: "conic-gradient(from 0deg, #4F46E5, #F97316, #8B7BD8, #4F46E5)" }}
            />
            {profile.data ? (
              <img src={profile.data.avatar_url} alt={profile.data.login} className="relative h-24 w-24 rounded-full border-[3px] border-[var(--background)] object-cover" />
            ) : (
              <div className="relative h-24 w-24 rounded-full border-[3px] border-[var(--background)] bg-muted" />
            )}
          </motion.div>

          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <h3 className="font-display text-2xl font-bold">{profile.data?.name ?? user}</h3>
              <a href={`https://github.com/${user}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-[var(--coral)]" data-cursor="hover">
                <ExternalLink className="h-4 w-4" />
              </a>
            </motion.div>
            <p className="text-sm text-[var(--coral)]">@{profile.data?.login ?? user}</p>
            {profile.data?.bio && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{profile.data.bio}</p>}
          </div>

          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-4">
            <MagneticStat icon={BookOpen} label="Repos" value={profile.data?.public_repos} color="#4F46E5" delay={0} />
            <MagneticStat icon={Users} label="Followers" value={profile.data?.followers} color="#F97316" delay={0.08} />
            <MagneticStat icon={Star} label="Stars" value={totalStars} color="#8B7BD8" delay={0.16} />
            <MagneticStat icon={Flame} label="Streak" value={contrib.data?.currentStreak} color="#F97316" suffix="d" delay={0.24} />
          </div>
        </div>
      </motion.div>

      {/* Contribution graph */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="glass mb-8 overflow-hidden rounded-3xl p-6"
        whileHover={{ y: -4 }}
      >
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">Contribution graph · last year</h3>
          <div className="font-mono text-xs text-muted-foreground">
            {contrib.data ? (
              <>
                <CountUp value={contrib.data.total} className="text-[var(--coral)]" /> contributions ·{" "}
                <span className="text-[var(--amber)]">{contrib.data.longestStreak}</span>d longest streak
              </>
            ) : "loading…"}
          </div>
        </div>
        <ContribGraph contrib={contrib.data} loading={contrib.isLoading} />
        <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
          <span>Less</span>
          {LEVEL_COLORS.map((c, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 300 }}
              className="h-3 w-3 rounded-[3px]"
              style={{ background: c }}
            />
          ))}
          <span>More</span>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Repos */}
        <div className="lg:col-span-3">
          <h3 className="mb-4 font-display text-lg font-semibold">Top repositories</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {repos.isLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass h-40 animate-pulse rounded-2xl" />
            ))}
            {repos.data?.slice(0, 6).map((r, i) => (
              <MagneticRepoCard key={r.id} r={r} i={i} />
            ))}
          </div>
        </div>

        {/* Languages + commit activity */}
        <div className="space-y-6 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="glass rounded-3xl p-6"
          >
            <h3 className="mb-4 font-display text-lg font-semibold">Top languages</h3>
            <div className="space-y-3">
              {langs.isLoading && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-white/5" />
              ))}
              {langs.data?.slice(0, 6).map((l, i) => (
                <motion.div
                  key={l.name}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: colorFor(l.name) }} />
                      {l.name}
                    </span>
                    <span className="font-mono text-muted-foreground">{l.pct.toFixed(1)}%</span>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-[rgba(30,27,27,0.06)]">
                    <motion.div
                      initial={{ width: 0 }} whileInView={{ width: `${l.pct}%` }} viewport={{ once: true }}
                      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.06 }}
                      className="relative h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${colorFor(l.name)}, var(--amber))` }}
                    >
                      <span
                        className="absolute inset-0 animate-scan-line"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                          animation: "scan-line 2.5s linear infinite",
                          transform: "rotate(90deg)",
                        }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="glass rounded-3xl p-6"
          >
            <h3 className="mb-4 font-display text-lg font-semibold">Commit activity · last 12 weeks</h3>
            <CommitActivity contrib={contrib.data} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Magnetic 3D stat card ---------- */
function MagneticStat({
  icon: Icon,
  label,
  value,
  color,
  suffix = "",
  delay = 0,
}: {
  icon: any;
  label: string;
  value?: number;
  color: string;
  suffix?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 200, damping: 18 });
  const glowX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glowY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 30, rotateX: -15 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: "spring", stiffness: 140, damping: 16 }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", perspective: 800 }}
      data-cursor="hover"
      className="glass relative overflow-hidden rounded-xl p-3"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          background: useTransform(
            [glowX, glowY] as any,
            ([gx, gy]: any) => `radial-gradient(160px circle at ${gx} ${gy}, ${color}33, transparent 70%)`,
          ),
        }}
        whileHover={{ opacity: 1 }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{ boxShadow: `0 0 0 1.5px ${color}, 0 0 30px ${color}55` }}
      />
      <div
        className="relative flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground"
        style={{ transform: "translateZ(20px)" }}
      >
        <Icon className="h-3 w-3" style={{ color }} /> {label}
      </div>
      <div
        className="relative font-display text-lg font-bold"
        style={{ color, transform: "translateZ(30px)" }}
      >
        <CountUp value={value ?? 0} suffix={suffix} />
      </div>
    </motion.div>
  );
}

/* ---------- Magnetic repo card ---------- */
function MagneticRepoCard({ r, i }: { r: any; i: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 180, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };
  const color = r.language ? colorFor(r.language) : "var(--coral)";

  return (
    <motion.a
      ref={ref}
      href={r.html_url}
      target="_blank"
      rel="noreferrer"
      data-cursor="hover"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.07, type: "spring", stiffness: 140, damping: 18 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ y: -8 }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", perspective: 1000 }}
      className="glass group relative block overflow-hidden rounded-2xl p-5"
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: color }}
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ boxShadow: `inset 0 0 0 1px ${color}55, 0 20px 40px -20px ${color}66` }}
      />
      <div className="relative flex items-start justify-between gap-2" style={{ transform: "translateZ(30px)" }}>
        <div className="font-display text-base font-semibold text-foreground group-hover:text-[var(--coral)]">{r.name}</div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <p className="relative mt-2 line-clamp-2 text-xs text-muted-foreground" style={{ transform: "translateZ(20px)" }}>
        {r.description ?? "No description provided."}
      </p>
      <div className="relative mt-4 flex items-center gap-4 text-xs text-muted-foreground" style={{ transform: "translateZ(25px)" }}>
        {r.language && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {r.language}
          </span>
        )}
        <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {r.stargazers_count}</span>
        <span className="inline-flex items-center gap-1"><GitFork className="h-3 w-3" /> {r.forks_count}</span>
      </div>
    </motion.a>
  );
}

/* ---------- Count-up ---------- */
function CountUp({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setN(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, value]);
  return <span ref={ref} className={className}>{n.toLocaleString()}{suffix}</span>;
}

/* ---------- Contribution graph ---------- */
function ContribGraph({ contrib, loading }: { contrib?: import("@/lib/github.functions").ContribData; loading: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [hovered, setHovered] = useState<{ x: number; y: number; date: string; count: number } | null>(null);

  if (loading || !contrib) {
    return <div ref={ref} className="h-32 w-full animate-pulse rounded-xl bg-[rgba(30,27,27,0.05)]" />;
  }
  const weeks = contrib.weeks;
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div ref={ref} className="relative overflow-x-auto">
      <div className="flex gap-[3px]" style={{ minWidth: weeks.length * 14 }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {Array.from({ length: 7 }).map((_, di) => {
              const day = week[di];
              const lvl = day?.level ?? 0;
              const isToday = day?.date === todayStr;
              return (
                <motion.div
                  key={di}
                  initial={{ opacity: 0, scale: 0, rotate: -45 }}
                  animate={inView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                  transition={{
                    duration: 0.45,
                    delay: (wi * 7 + di) * 0.0035,
                    type: "spring",
                    stiffness: 180,
                    damping: 14,
                  }}
                  whileHover={{ scale: 1.8, zIndex: 10 }}
                  onMouseEnter={(e) => {
                    if (!day) return;
                    const t = e.currentTarget.getBoundingClientRect();
                    const c = (e.currentTarget.parentElement?.parentElement?.parentElement as HTMLElement)?.getBoundingClientRect();
                    setHovered({
                      x: t.left - (c?.left ?? 0) + 6,
                      y: t.top - (c?.top ?? 0) - 8,
                      date: day.date,
                      count: day.count,
                    });
                  }}
                  onMouseLeave={() => setHovered(null)}
                  className="h-3 w-3 cursor-none rounded-[3px]"
                  style={{
                    background: LEVEL_COLORS[lvl],
                    boxShadow: lvl >= 3 ? "0 0 8px rgba(79,70,229,0.5)" : "none",
                    outline: isToday ? "1.5px solid #F97316" : "none",
                    outlineOffset: 1,
                    animation: isToday ? "pulse-glow 2.4s ease-in-out infinite" : undefined,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-frost pointer-events-none absolute z-20 -translate-y-full rounded-md px-2 py-1 font-mono text-[10px] text-foreground"
          style={{ left: hovered.x, top: hovered.y }}
        >
          <div className="text-[var(--coral)]">{hovered.count} contributions</div>
          <div className="text-muted-foreground">{hovered.date}</div>
        </motion.div>
      )}
    </div>
  );
}

/* ---------- Commit activity with SVG draw-in ---------- */
function CommitActivity({ contrib }: { contrib?: import("@/lib/github.functions").ContribData }) {
  if (!contrib) return <div className="h-32 animate-pulse rounded-xl bg-[rgba(30,27,27,0.05)]" />;
  const last12 = contrib.weeks.slice(-12).map((w) => w.reduce((a, d) => a + d.count, 0));
  const max = Math.max(...last12, 1);
  const W = 280;
  const H = 100;
  const stepX = W / Math.max(last12.length - 1, 1);
  const pts = last12.map((v, i) => ({ x: i * stepX, y: H - (v / max) * H * 0.92 - 4 }));
  const path = pts.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x},${p.y}` : ` L ${p.x},${p.y}`), "");
  const area = path + ` L ${W},${H} L 0,${H} Z`;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 20}`} className="h-32 w-full">
        <defs>
          <linearGradient id="commit-stroke" x1="0" x2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="commit-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#commit-fill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />
        <motion.path
          d={path}
          fill="none"
          stroke="url(#commit-stroke)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {pts.map((p, i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.05, type: "spring", stiffness: 220 }}
          >
            <circle cx={p.x} cy={p.y} r="3.5" fill="#FBFBF9" stroke="#4F46E5" strokeWidth="1.5" />
            <title>{last12[i]} commits</title>
          </motion.g>
        ))}
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
        <span>−12w</span>
        <span>now</span>
      </div>
    </div>
  );
}

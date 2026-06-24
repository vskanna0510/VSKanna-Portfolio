import { motion, useScroll, useSpring, useTransform, AnimatePresence, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight, Brain, Cpu, Database, Download, Github, Linkedin, Mail, MapPin,
  Sparkles, Code2, Layers, Rocket, Terminal as TerminalIcon, Trophy, Zap, Wand2,
  Globe, ServerCog, FlaskConical, GraduationCap, Briefcase, Star, ExternalLink, Send,
  Gamepad2,
} from "lucide-react";

import { GitHubSection } from "./GitHubSection";
import { AnimatedPortrait } from "./AnimatedPortrait";
import { AmbientBackdrop } from "./AmbientBackdrop";
import { HeroAurora, PortraitAurora } from "./HeroAurora";
import { VoiceWelcome } from "./VoiceWelcome";
import { SectionDivider } from "./SectionDivider";
import { PageTransition } from "./PageTransition";
import { LatentConstellation, CLUSTERS } from "./LatentConstellation";
import { AILabControls } from "./AILabControls";
import { AILabTelemetry } from "./AILabTelemetry";
import { useWelcomeVoice } from "@/hooks/useWelcomeVoice";
import { useAuroraMode } from "@/hooks/useAuroraMode";
import { downloadResume, scrollToSection } from "@/lib/resume";

export const GITHUB_USER = "vskanna0510";
export const EMAIL = "vskanna2003@gmail.com";
export const PHONE = "+91 96770 44486";
export const LINKEDIN = "https://linkedin.com/in/vskanna";
export const SITE = "https://vskanna.dev";
export const LOCATION = "Chennai, India · Hybrid / Remote";


/* ---------- Hero ---------- */
const ROLES = [
  "Full-Stack Developer",
  "AI / ML Engineer",
  "Backend Developer",
  "M.E. CSE @ SSN",
  "Open to new roles in 2026",
];

function Typewriter() {
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  const [glitch, setGlitch] = useState("");
  useEffect(() => {
    const cur = ROLES[i];
    if (!del && text === cur) { const t = setTimeout(() => setDel(true), 1600); return () => clearTimeout(t); }
    if (del && text === "") { setDel(false); setI((i + 1) % ROLES.length); return; }
    const t = setTimeout(() => {
      const next = del ? cur.slice(0, text.length - 1) : cur.slice(0, text.length + 1);
      setText(next);
      // futuristic scramble tail
      const chars = "▮▯░▒▓█◢◣◤◥/\\|<>";
      setGlitch(del ? "" : Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
    }, del ? 28 : 65);
    return () => clearTimeout(t);
  }, [text, del, i]);
  return (
    <span className="relative inline-block">
      <span
        className="text-gradient-ca"
        style={{ textShadow: "0 0 18px rgba(79,70,229,0.45), 0 0 32px rgba(249,115,22,0.25)" }}
      >
        {text}
      </span>
      <span className="ml-0.5 font-mono text-[var(--coral)]/70">{glitch}</span>
      <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[3px] bg-gradient-to-b from-[var(--coral)] to-[var(--amber)] animate-blink" />
    </span>
  );
}


export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { mode: auroraMode } = useAuroraMode();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);


  return (
    <section ref={ref} className="relative min-h-screen overflow-x-hidden overflow-y-visible">
      <HeroAurora mode={auroraMode} />
      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-8 px-6 pt-28 md:grid-cols-[1.1fr_1fr] md:gap-12 md:pt-24">
        {/* LEFT: text */}
        <div className="text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="glass mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-muted-foreground"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--coral)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--coral)]" />
            </span>
            Open to full-stack and backend roles · 2026
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.1 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl xl:text-8xl"
          >
            V S <span className="shimmer-text">Kanna</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-5 font-mono text-lg text-muted-foreground sm:text-xl md:text-2xl"
          >
            <span className="text-foreground/80">{"> "}</span><Typewriter />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6 }}
            className="mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg md:mx-0 mx-auto"
          >
            M.E. Computer Science at <span className="text-foreground">SSN College of Engineering</span> · CGPA <span className="text-foreground">9.09/10</span>.
            I build <span className="text-foreground">web apps</span>, <span className="text-foreground">REST APIs</span>, and <span className="text-foreground">AI features</span> that people actually use.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start"
          >
            <a href="#projects" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] animate-gradient" style={{ backgroundImage: "var(--gradient-brand)" }}>
              <span className="relative z-10">View Projects</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <button
              type="button"
              onClick={() => downloadResume("hero")}
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold hover:border-[var(--pink)]/60"
            >
              <Download className="h-4 w-4 text-[var(--pink)]" /> Download resume
            </button>
            <a href="#github" className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold hover:border-[var(--coral)]/60">
              <Github className="h-4 w-4 text-[var(--coral)]" /> GitHub
            </a>
            <a href="#ai-lab" className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold hover:border-[var(--amber)]/60">
              <FlaskConical className="h-4 w-4 text-[var(--amber)]" /> AI Lab
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm font-semibold hover:border-white/30">
              Contact <Mail className="h-4 w-4" />
            </a>
          </motion.div>
        </div>

        {/* RIGHT: portrait */}
        <div className="relative order-first overflow-visible md:order-last">
          <PortraitAurora mode={auroraMode} />
          <AnimatedPortrait />
        </div>
      </motion.div>

    </section>
  );
}


/* ---------- Section helpers ---------- */
function SectionHeader({ kicker, title, sub }: { kicker: string; title: React.ReactNode; sub?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} className="mb-14 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}
        className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <Sparkles className="h-3 w-3 text-[var(--amber)]" /> {kicker}
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.1 }}
        className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</motion.h2>
      {sub && <motion.p initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ duration: 0.7, delay: 0.25 }}
        className="mt-4 text-muted-foreground">{sub}</motion.p>}
    </div>
  );
}

function Stat({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return (
    <div ref={ref} className="glass rounded-2xl p-6">
      <div className="font-display text-4xl font-bold text-gradient">{n.toLocaleString()}{suffix}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

/* ---------- About ---------- */
const JOURNEY = [
  { icon: GraduationCap, title: "B.Tech IT, Chennai Institute of Technology", year: "2021 – 2025", text: "Information Technology · CGPA 8.69/10. Learned web dev, DSA, and how to build real software." },
  { icon: Briefcase, title: "Backend Engineer Intern · NKINFYX (FYXIN)", year: "2024", text: "Built 10+ ERP modules with REST APIs, cut query time by 35%, and fixed 50+ bugs over 6 sprints." },
  { icon: Trophy, title: "President · TROJANS, CIT", year: "Sep 2024 – Apr 2025", text: "Ran 12 committees and a national symposium with 2,500 participants." },
  { icon: Brain, title: "Multimodal AI research", year: "Aug – Sep 2025", text: "Combined BERT, ResNet, and audio features into one mental-health risk model — 87% accuracy." },
  { icon: GraduationCap, title: "M.E. Computer Science, SSN College of Engineering", year: "Jul 2025 → Present", text: "CGPA 9.09/10 · focusing on deep learning, NLP, and multimodal systems." },
  { icon: Rocket, title: "Looking for full-stack / backend roles", year: "2026 →", text: "Open to teams building useful products in Chennai, hybrid, or remote." },
];

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-32">
      <SectionHeader kicker="About" title={<>How I got from <span className="text-gradient">CIT</span> to <span className="text-gradient">SSN</span></>}
        sub="Five years of studying, interning, competing in hackathons, and building things that work." />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Stat value={1000} label="SkillRack problems" suffix="+" />
        <Stat value={300} label="LeetCode problems" suffix="+" />
        <Stat value={94} label="Deepfake detection acc." suffix="%" />
        <Stat value={35} label="ERP query speed-up" suffix="%" />
        <Stat value={2500} label="Symposium participants" suffix="+" />
        <Stat value={909} label="M.E. CGPA × 100" />
      </div>

      <div className="relative mt-20">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--coral)] via-[var(--amber)] to-[var(--pink)] md:left-1/2" />
        {JOURNEY.map((j, i) => {
          const Icon = j.icon;
          const left = i % 2 === 0;
          return (
            <motion.div
              key={j.title}
              initial={{ opacity: 0, x: left ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className={`relative mb-10 flex md:w-1/2 ${left ? "md:pr-12" : "md:ml-auto md:pl-12"}`}
            >
              <div className="absolute -left-1 top-4 grid h-9 w-9 place-items-center rounded-full glow-coral md:left-auto md:-translate-x-1/2"
                style={{ background: "var(--gradient-brand)", [left ? "right" : "left"]: "-48px" } as React.CSSProperties}>
                <Icon className="h-4 w-4 text-background" />
              </div>
              <div className="glass ml-12 w-full rounded-2xl p-5 md:ml-0">
                <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                  <span>{j.title}</span><span>{j.year}</span>
                </div>
                <p className="mt-2 text-sm text-foreground/90">{j.text}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Skills ---------- */
const SKILLS = [
  { cat: "Languages", color: "var(--coral)", icon: Code2, items: ["Python", "JavaScript (ES6+)", "Java", "C", "C++", "R", "PHP", "HTML5", "CSS3"] },
  { cat: "Frontend", color: "var(--amber)", icon: Layers, items: ["React.js", "Next.js", "Vue.js", "Tailwind CSS", "Responsive Design", "Web Animations"] },
  { cat: "Backend", color: "var(--pink)", icon: ServerCog, items: ["Node.js", "Express.js", "Spring Boot", "REST APIs", "GraphQL", "Microservices"] },
  { cat: "Databases & Big Data", color: "var(--coral)", icon: Database, items: ["MongoDB", "PostgreSQL", "MySQL", "Cassandra", "Neo4j", "Kafka", "Hadoop", "Spark"] },
  { cat: "AI / ML", color: "var(--amber)", icon: Brain, items: ["TensorFlow", "PyTorch", "BERT", "CNNs", "GANs", "NLP", "Fine-Tuning", "OpenCV"] },
  { cat: "DevOps & Tools", color: "var(--pink)", icon: Cpu, items: ["Git", "Docker", "CI/CD", "Linux", "Postman", "VS Code", "Agile/Scrum", "SDN"] },
];

export function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-7xl px-6 py-32">
      <SectionHeader kicker="Skills" title={<>What I work with</>} sub="Languages and tools I've used in internships, research, and hackathons." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.cat}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -6 }}
              className="glass group relative overflow-hidden rounded-2xl p-6"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-20 blur-3xl transition-opacity group-hover:opacity-60" style={{ background: s.color }} />
              <div className="relative flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: `${s.color}22`, color: s.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{s.cat}</h3>
              </div>
              <div className="relative mt-5 flex flex-wrap gap-2">
                {s.items.map((it) => (
                  <span key={it} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-foreground/85 transition-colors hover:border-white/30 hover:text-foreground">
                    {it}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Projects ---------- */
const PROJECTS = [
  {
    title: "AI Deepfake Detection",
    tag: "AI",
    desc: "CNN/GAN model that spots fake insurance-claim images — 94% accuracy, under 300ms per check.",
    stack: ["Python", "TensorFlow", "OpenCV", "CNN/GAN", "Flask"],
    color: "var(--coral)", metric: "94% acc",
  },
  {
    title: "Multimodal Mental Health Risk",
    tag: "Research",
    desc: "Combined text (BERT), images (ResNet), and audio into one risk score. Gradio demo, 87% accuracy.",
    stack: ["PyTorch", "BERT", "ResNet", "Gradio"],
    color: "var(--amber)", metric: "87% acc",
  },
  {
    title: "Enterprise ERP — FYXIN",
    tag: "Full Stack",
    desc: "Built 10+ ERP modules with REST APIs, sped up queries by 35%, and improved reliability.",
    stack: ["Node.js", "Express", "PostgreSQL", "REST"],
    color: "var(--pink)", metric: "10+ modules",
  },
  {
    title: "Developer Portfolio Website",
    tag: "Web",
    desc: "This site — responsive, fast Lighthouse scores, deployed with CI/CD on Vercel.",
    stack: ["React.js", "Vercel", "GitHub Actions"],
    color: "var(--coral)", metric: "Lighthouse 95",
  },
  {
    title: "Smart India Hackathon Solution",
    tag: "Hackathon",
    desc: "2nd runner-up among hundreds of college teams at Smart India Hackathon.",
    stack: ["Full Stack", "APIs", "Cloud"],
    color: "var(--amber)", metric: "2nd Runner-Up",
  },
  {
    title: "IIT Madras Hackathon",
    tag: "Hackathon",
    desc: "Top 8 nationally — built a working solution under tight deadlines.",
    stack: ["AI", "Backend", "UX"],
    color: "var(--pink)", metric: "Top 8",
  },
];
const FILTERS = ["All", "AI", "Web", "Full Stack", "Research", "Hackathon"];

export function Projects() {
  const [filter, setFilter] = useState("All");
  const list = useMemo(() => filter === "All" ? PROJECTS : PROJECTS.filter(p => p.tag === filter), [filter]);
  return (
    <section id="projects" className="relative mx-auto max-w-7xl px-6 py-32">
      <SectionHeader kicker="Projects" title={<>Things I've built</>} sub="Real problems, with numbers where I have them." />
      <div className="mb-10 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-all ${
              filter === f ? "border-transparent text-background" : "border-white/10 text-muted-foreground hover:text-foreground"}`}
            style={filter === f ? { backgroundImage: "var(--gradient-brand)" } : undefined}>
            {f}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((p, i) => (
            <motion.article
              layout
              key={p.title}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              whileHover={{ y: -8, rotateX: 4, rotateY: -4 }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              className="glass group relative overflow-hidden rounded-3xl p-6"
            >
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle at 30% 0%, ${p.color}33, transparent 60%)` }} />
              <div className="relative">
                <div className="mb-6 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-xl border border-white/10"
                  style={{ background: `linear-gradient(135deg, ${p.color}22, transparent 70%), radial-gradient(circle at 70% 70%, ${p.color}33, transparent 50%)` }}>
                  <div className="font-mono text-3xl font-bold opacity-80" style={{ color: p.color }}>{p.title.slice(0, 2).toUpperCase()}</div>
                </div>
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider">
                  <span style={{ color: p.color }}>{p.tag}</span>
                  <span className="text-muted-foreground">{p.metric}</span>
                </div>
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => <span key={s} className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{s}</span>)}
                </div>
                <div className="mt-5 flex gap-3 text-xs">
                  <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground/90 hover:text-[var(--coral)]"><Github className="h-3.5 w-3.5" /> Code</a>
                  <a href={SITE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-foreground/90 hover:text-[var(--amber)]"><ExternalLink className="h-3.5 w-3.5" /> Live</a>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ---------- AI Lab ---------- */
function NeuralDiagram() {
  const layers = [4, 6, 6, 3];
  const W = 480, H = 220, padX = 40;
  const stepX = (W - padX * 2) / (layers.length - 1);
  const nodes: { x: number; y: number; l: number }[] = [];
  layers.forEach((n, li) => {
    for (let i = 0; i < n; i++) {
      const stepY = H / (n + 1);
      nodes.push({ x: padX + li * stepX, y: stepY * (i + 1), l: li });
    }
  });
  const links: { a: typeof nodes[0]; b: typeof nodes[0] }[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    const left = nodes.filter(n => n.l === l);
    const right = nodes.filter(n => n.l === l + 1);
    left.forEach(a => right.forEach(b => links.push({ a, b })));
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        <linearGradient id="lg" x1="0" x2="1">
          <stop offset="0" stopColor="#FF6B6B" /><stop offset="1" stopColor="#FFB454" />
        </linearGradient>
      </defs>
      {links.map((ln, i) => (
        <line key={i} x1={ln.a.x} y1={ln.a.y} x2={ln.b.x} y2={ln.b.y} stroke="url(#lg)" strokeOpacity="0.25" strokeWidth="0.6">
          <animate attributeName="stroke-opacity" values="0.1;0.7;0.1" dur={`${2 + (i % 5) * 0.4}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="4" fill="url(#lg)">
          <animate attributeName="r" values="3;6;3" dur={`${2 + (i % 4) * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

const AI_PROJECTS = [
  { title: "Deepfake Detection (CNN/GAN)", desc: "94% accuracy on insurance images, under 300ms per run.", tags: ["TensorFlow", "OpenCV", "Flask"] },
  { title: "Multimodal Risk Detection", desc: "BERT + ResNet + audio combined — 87% accuracy.", tags: ["PyTorch", "BERT", "Gradio"] },
  { title: "Transfer Learning Pipelines", desc: "Reusable scripts for training, testing, and deployment.", tags: ["TensorFlow", "PyTorch"] },
  { title: "NLP Experiments", desc: "Fine-tuned transformers on domain-specific datasets.", tags: ["Transformers", "HuggingFace"] },
];

export function AILab() {
  const [temperature, setTemperature] = useState(0.4);
  const [attention, setAttention] = useState(0.55);
  const [density, setDensity] = useState(320);
  const [active, setActive] = useState<number | null>(null);
  const [fuseAllTrigger, setFuseAllTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [hoverLabel, setHoverLabel] = useState<string | null>(null);

  return (
    <section id="ai-lab" className="relative overflow-hidden py-32">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeader kicker="AI work" title={<>ML projects and a small demo</>}
          sub="Click the clusters, move the sliders, and watch the fake training logs on the right." />

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_280px]">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <AILabControls
              temperature={temperature} setTemperature={setTemperature}
              attention={attention}     setAttention={setAttention}
              density={density}         setDensity={setDensity}
              active={active}           setActive={setActive}
              onFuseAll={() => setFuseAllTrigger((n) => n + 1)}
              onReset={() => { setActive(null); setResetTrigger((n) => n + 1); }}
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="glass-strong relative overflow-hidden rounded-3xl p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--coral)]" /> Model view · live
              </div>
              <span className="font-mono text-xs text-[var(--amber)]">running…</span>
            </div>
            <LatentConstellation
              temperature={temperature}
              density={density}
              attention={attention}
              active={active}
              fuseAllTrigger={fuseAllTrigger}
              resetTrigger={resetTrigger}
              onHoverCluster={(i) => setHoverLabel(i === null ? null : CLUSTERS[i].label)}
            />
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-lg border border-white/10 p-2"><div className="font-mono text-[var(--coral)]">4</div><div className="text-muted-foreground">Input types</div></div>
              <div className="rounded-lg border border-white/10 p-2"><div className="font-mono text-[var(--amber)]">87%</div><div className="text-muted-foreground">Model accuracy</div></div>
              <div className="rounded-lg border border-white/10 p-2"><div className="font-mono text-[var(--pink)]">{Math.round(density)}</div><div className="text-muted-foreground">Data points</div></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <AILabTelemetry activeLabel={hoverLabel} />
          </motion.div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AI_PROJECTS.map((p, i) => (
            <motion.div key={p.title}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="glass group relative overflow-hidden rounded-2xl p-5">
              <Brain className="absolute -right-4 -top-4 h-24 w-24 text-[var(--coral)]/10 transition-transform duration-500 group-hover:rotate-12" />
              <h4 className="relative font-display text-lg font-semibold">{p.title}</h4>
              <p className="relative mt-2 text-sm text-muted-foreground">{p.desc}</p>
              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {p.tags.map(t => <span key={t} className="rounded border border-[var(--amber)]/30 bg-[var(--amber)]/5 px-2 py-0.5 font-mono text-[10px] text-[var(--amber)]">{t}</span>)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}


/* ---------- Experience ---------- */
const XP = [
  { role: "Backend Engineer Intern", org: "NKINFYX GROUPS Pvt. Ltd. (FYXIN Division), Pondicherry", date: "2024", text: "Built 10+ ERP modules, cut query time by 35%, fixed 50+ bugs, and hit every sprint deadline across 6 sprints." },
  { role: "President — TROJANS", org: "Chennai Institute of Technology", date: "Sep 2024 – Apr 2025", text: "Organized 12 committees and a national symposium with 2,500 participants." },
  { role: "M.E. Computer Science & Engineering", org: "SSN College of Engineering, Chennai", date: "Jul 2025 → Present", text: "CGPA 9.09/10 · deep learning, NLP, and multimodal systems." },
  { role: "B.Tech Information Technology", org: "Chennai Institute of Technology", date: "Jun 2021 – May 2025", text: "CGPA 8.69/10 · DSA, web development, distributed systems, and AI basics." },
];

export function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-7xl px-6 py-32">
      <SectionHeader kicker="Experience" title={<>Work and study</>} />
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--coral)] via-[var(--amber)] to-[var(--pink)]" />
        {XP.map((x, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }} className="relative mb-8 pl-12">
            <div className="absolute left-0 top-2 grid h-7 w-7 place-items-center rounded-full glow-coral" style={{ background: "var(--gradient-brand)" }}>
              <Briefcase className="h-3.5 w-3.5 text-background" />
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-display text-lg font-semibold">{x.role}</h4>
                <span className="font-mono text-xs text-muted-foreground">{x.date}</span>
              </div>
              <div className="text-sm text-[var(--amber)]">{x.org}</div>
              <p className="mt-2 text-sm text-muted-foreground">{x.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Achievements ---------- */
const TROPHIES = [
  { icon: Trophy, title: "Top 8 — IIT Madras Hackathon", text: "Made it to the final round nationally.", color: "var(--coral)" },
  { icon: Star, title: "Top 9 — IEEE Madras 24h Hackathon", text: "Built a working solution in 24 hours.", color: "var(--amber)" },
  { icon: Zap, title: "2nd Runner-Up — SIH 2022", text: "Smart India Hackathon — placed among the top teams.", color: "var(--pink)" },
  { icon: Brain, title: "Top 20 — Build-A-Thon 2023", text: "Recognized for a solid, practical build.", color: "var(--coral)" },
  { icon: Rocket, title: "TCS & Hero Campus Challenges", text: "Completed industry coding challenges in 2022.", color: "var(--amber)" },
  { icon: Globe, title: "1000+ SkillRack · 300+ LeetCode", text: "Lots of practice on data structures and algorithms.", color: "var(--pink)" },
];

export function Achievements() {
  return (
    <section id="achievements" className="relative mx-auto max-w-7xl px-6 py-32">
      <SectionHeader kicker="Achievements" title={<>Competitions and certs</>} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TROPHIES.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div key={t.title}
              initial={{ opacity: 0, y: 40, rotateX: -10 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, delay: i * 0.07 }}
              whileHover={{ y: -8, rotateY: 6 }}
              style={{ transformStyle: "preserve-3d" }}
              className="glass relative overflow-hidden rounded-2xl p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl" style={{ background: `${t.color}55` }} />
              <Icon className="h-8 w-8 animate-glow-pulse" style={{ color: t.color }} />
              <h4 className="mt-4 font-display text-lg font-semibold">{t.title}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{t.text}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          "IBM AI Engineering Professional — Coursera",
          "Cybersecurity Essentials — Cisco",
          "Foundations of Cybersecurity — Google",
          "Ultimate Web Development Bootcamp — Udemy",
        ].map((c, i) => (
          <motion.div key={c}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 text-xs text-foreground/85">
            <div className="text-[10px] uppercase tracking-wider text-[var(--amber)]">Certification</div>
            <div className="mt-1">{c}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Terminal ---------- */
type TerminalReply = { output: string; action?: () => void };

const STATIC_COMMANDS: Record<string, string> = {
  help: "Commands: about, skills, projects, github, open github, play, contact, resume, achievements, theme, clear",
  about: "I'm V S Kanna — M.E. CSE at SSN. Full-stack and AI engineer. Open to backend and full-stack roles.",
  skills: "Languages, frontend, backend, databases, AI/ML, DevOps — see the Skills section.",
  contact: `${EMAIL} · ${PHONE} · ${LINKEDIN}`,
  achievements: "IIT Madras Top 8 · IEEE Madras Top 9 · SIH 2nd Runner-Up · 1000+ SkillRack · 300+ LeetCode",
  theme: "Colors: coral, amber, and pink.",
  "sudo hire-me": `Nice try. Email me at ${EMAIL} instead.`,
  future: "The future is unevenly distributed — Gibson, more or less.",
};

function resolveTerminalCommand(
  raw: string,
  navigate: ReturnType<typeof useNavigate>,
  isHome: boolean,
): TerminalReply {
  const cmd = raw.trim().toLowerCase().replace(/\s+/g, " ");

  if (cmd === "projects") {
    return {
      output: isHome ? "Scrolling to projects…" : "Opening projects page…",
      action: () => {
        if (isHome && scrollToSection("projects")) return;
        navigate({ to: "/projects" });
      },
    };
  }

  if (cmd === "github" || cmd === "open github") {
    return {
      output: isHome ? "Scrolling to GitHub…" : "Opening GitHub page…",
      action: () => {
        if (isHome && scrollToSection("github")) return;
        navigate({ to: "/github" });
      },
    };
  }

  if (cmd === "play") {
    return {
      output: "Opening arcade…",
      action: () => navigate({ to: "/arcade" }),
    };
  }

  if (cmd === "resume") {
    return {
      output: "Downloading VSKanna_Resume.pdf…",
      action: () => downloadResume("terminal"),
    };
  }

  const staticReply = STATIC_COMMANDS[cmd];
  if (staticReply) return { output: staticReply };

  return { output: `command not found: ${cmd}. try \`help\`` };
}

export function Terminal() {
  const navigate = useNavigate();
  const isHome = useRouterState({ select: (s) => s.location.pathname === "/" });
  const [lines, setLines] = useState<{ t: "in" | "out"; v: string }[]>([
    { t: "out", v: "Welcome — type help to see commands." },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    if (!atBottom) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [lines, atBottom]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    if (cmd === "clear") { setLines([]); return; }
    const { output, action } = resolveTerminalCommand(raw, navigate, isHome);
    setLines((l) => [...l, { t: "in", v: raw }, { t: "out", v: output }]);
    action?.();
  };

  return (
    <section id="terminal" className="relative mx-auto max-w-5xl px-6 py-32">
      <SectionHeader kicker="Terminal" title={<>A small command line</>}
        sub="Try: help · projects · open github · play · resume · sudo hire-me" />
      <div className="glass-frost overflow-hidden rounded-2xl border border-white/10 font-mono text-sm">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-muted-foreground">kanna@portfolio: ~</span>
        </div>
        <div
          ref={scrollRef}
          className="h-72 overflow-y-auto p-4"
          onScroll={(e) => {
            const el = e.currentTarget;
            const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 16;
            setAtBottom(nearBottom);
          }}
        >
          {lines.map((l, i) => (
            <div key={i} className={l.t === "in" ? "text-foreground" : "text-muted-foreground"}>
              {l.t === "in" ? <><span className="text-[var(--coral)]">kanna@os</span>:<span className="text-[var(--amber)]">~</span>$ {l.v}</> : l.v}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
          <span className="text-[var(--coral)]">kanna@os</span><span>:</span><span className="text-[var(--amber)]">~</span>$
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              run(input);
              setInput("");
            }}
            className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground" placeholder="type a command..." />
        </div>
      </div>
    </section>
  );
}

/* ---------- Contact ---------- */
export function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="relative mx-auto max-w-7xl px-6 py-32">
      <SectionHeader kicker="Contact" title={<>Want to get in touch?</>}
        sub="Open to full-stack, backend, and AI roles · Chennai · hybrid or remote." />

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="glass-strong rounded-3xl p-8">
          {(["name", "email"] as const).map((f) => (
            <div key={f} className="group relative mb-6">
              <input required name={f} type={f === "email" ? "email" : "text"}
                className="peer w-full border-b border-white/15 bg-transparent px-1 pb-2 pt-5 text-sm outline-none transition-colors placeholder-transparent focus:border-[var(--coral)]"
                placeholder={f} />
              <label className="pointer-events-none absolute left-1 top-5 text-sm text-muted-foreground transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[var(--coral)] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs">
                {f === "name" ? "Your name" : "Email"}
              </label>
            </div>
          ))}
          <div className="group relative mb-6">
            <textarea required name="msg" rows={4}
              className="peer w-full resize-none border-b border-white/15 bg-transparent px-1 pb-2 pt-5 text-sm outline-none transition-colors placeholder-transparent focus:border-[var(--coral)]"
              placeholder="message" />
            <label className="pointer-events-none absolute left-1 top-5 text-sm text-muted-foreground transition-all peer-focus:top-0 peer-focus:text-xs peer-focus:text-[var(--coral)] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs">
              Tell me about it
            </label>
          </div>
          <button type="submit"
            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground animate-gradient"
            style={{ backgroundImage: "var(--gradient-brand)" }}>
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.span key="ok" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Message sent — I'll get back to you.
                </motion.span>
              ) : (
                <motion.span key="send" initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2">
                  Send message <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </form>

        <div className="space-y-4">
          {[
            { icon: Mail, label: EMAIL, href: `mailto:${EMAIL}`, color: "var(--coral)" },
            { icon: Github, label: `github.com/${GITHUB_USER}`, href: `https://github.com/${GITHUB_USER}`, color: "var(--amber)" },
            { icon: Linkedin, label: "linkedin.com/in/vskanna", href: LINKEDIN, color: "var(--pink)" },
            { icon: MapPin, label: LOCATION, href: "#", color: "var(--coral)" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <a key={c.label} href={c.href} target="_blank" rel="noreferrer" className="glass group flex items-center gap-4 rounded-2xl p-5 transition-transform hover:-translate-y-1">
                <div className="grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${c.color}22`, color: c.color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-sm text-muted-foreground">Reach out</div>
                  <div className="text-foreground">{c.label}</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- Nav + Footer + Progress ---------- */
const NAV_LINKS = [
  { label: "About",       to: "/about" as const },
  { label: "Skills",      to: "/skills" as const },
  { label: "Projects",    to: "/projects" as const },
  { label: "GitHub",      to: "/github" as const },
  { label: "AI Lab",      to: "/ai-lab" as const },
  { label: "Experience",  to: "/experience" as const },
  { label: "Achievements", to: "/achievements" as const },
  { label: "Arcade",      to: "/arcade" as const },
  { label: "Contact",     to: "/contact" as const },
];

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex flex-col items-center px-4">
      <nav className="glass-frost flex w-full max-w-[95vw] items-center gap-1 rounded-full px-2 py-1.5 md:w-auto">
        <Link to="/" className="mr-2 flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold">
          <span className="grid h-6 w-6 place-items-center rounded-full" style={{ background: "var(--gradient-brand)" }}>
            <span className="text-xs font-bold text-background">K</span>
          </span>
          <span className="hidden sm:inline">VS Kanna</span>
        </Link>
        {NAV_LINKS.map((l) => {
          const active = pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`hidden shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors md:inline ${
                active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-white/10 md:hidden"
        >
          <span className="relative block h-3 w-4">
            <span className={`absolute left-0 top-0 h-[2px] w-full bg-current transition-transform ${open ? "translate-y-[5px] rotate-45" : ""}`} />
            <span className={`absolute left-0 top-[5px] h-[2px] w-full bg-current transition-opacity ${open ? "opacity-0" : "opacity-100"}`} />
            <span className={`absolute left-0 top-[10px] h-[2px] w-full bg-current transition-transform ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
          </span>
        </button>
        <Link to="/contact" className="ml-2 hidden shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-background animate-gradient md:inline-flex" style={{ backgroundImage: "var(--gradient-brand)" }}>
          Contact <ArrowRight className="h-3 w-3" />
        </Link>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass-frost mt-2 grid w-[min(95vw,360px)] grid-cols-2 gap-1 rounded-2xl p-2 md:hidden"
          >
            {NAV_LINKS.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`rounded-xl px-3 py-2 text-center text-xs font-medium transition-colors ${
                    active ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              to="/contact"
              className="col-span-2 mt-1 inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-background animate-gradient"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              Contact <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>

  );
}


export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const sx = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 });
  return <motion.div style={{ scaleX: sx, transformOrigin: "0% 50%", backgroundImage: "var(--gradient-brand)" }} className="fixed inset-x-0 top-0 z-[60] h-[2px]" />;
}

export function FloatingMenu() {
  const links = [
    { icon: Github, href: `https://github.com/${GITHUB_USER}`, color: "var(--coral)" },
    { icon: Linkedin, href: LINKEDIN, color: "var(--amber)" },
    { icon: Mail, href: `mailto:${EMAIL}`, color: "var(--pink)" },
    { icon: Download, href: "#", color: "var(--coral)" },
  ];
  return (
    <div className="fixed bottom-6 right-6 z-50 hidden flex-col gap-2 md:flex">
      {links.map((l, i) => {
        const Icon = l.icon;
        return (
          <motion.a key={i} href={l.href} target="_blank" rel="noreferrer"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 + i * 0.1 }}
            whileHover={{ scale: 1.15, rotate: 8 }}
            className="glass grid h-11 w-11 place-items-center rounded-full"
            style={{ color: l.color }}>
            <Icon className="h-4 w-4" />
          </motion.a>
        );
      })}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="font-mono text-xs text-muted-foreground">© {new Date().getFullYear()} V S Kanna</div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="hover:text-foreground"><Github className="h-4 w-4" /></a>
          <a href={LINKEDIN} target="_blank" rel="noreferrer" className="hover:text-foreground"><Linkedin className="h-4 w-4" /></a>
          <a href={`mailto:${EMAIL}`} className="hover:text-foreground"><Mail className="h-4 w-4" /></a>
          <a href="#terminal" className="inline-flex items-center gap-1 text-xs hover:text-foreground"><TerminalIcon className="h-3.5 w-3.5" /> console</a>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
export function Portfolio() {
  // Konami easter egg
  useEffect(() => {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === seq[idx].toLowerCase()) {
        idx++;
        if (idx === seq.length) {
          document.documentElement.style.setProperty("filter", "hue-rotate(60deg) saturate(1.3)");
          setTimeout(() => document.documentElement.style.removeProperty("filter"), 4000);
          idx = 0;
        }
      } else idx = 0;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const voice = useWelcomeVoice();

  return (
    <PageTransition>
      <AmbientBackdrop suppressHeroZone />
      <main className="relative">
        <ScrollProgress />
        <Nav />
        <VoiceWelcome {...voice} />
        <Hero />
        <SectionDivider />
        <div className="cv-auto"><About /></div>
        <SectionDivider />
        <div className="cv-auto"><Skills /></div>
        <SectionDivider />
        <div className="cv-auto"><Projects /></div>
        <SectionDivider />
        <div className="cv-auto"><GitHubSection user={GITHUB_USER} /></div>
        <SectionDivider />
        <div className="cv-auto"><AILab /></div>
        <SectionDivider />
        <div className="cv-auto"><Experience /></div>
        <div className="cv-auto"><Achievements /></div>
        <div className="cv-auto"><Terminal /></div>
        <div className="cv-auto"><Contact /></div>
        <Footer />
        <FloatingMenu />
      </main>
    </PageTransition>

  );
}

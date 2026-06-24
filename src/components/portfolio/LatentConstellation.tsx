import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

type Cluster = {
  id: string;
  label: string;
  project: string;
  color: string;
  cx: number;
  cy: number;
};

const CLUSTERS: Cluster[] = [
  { id: "vision",  label: "Vision",     project: "Deepfake detection — 94% accuracy",       color: "#4F46E5", cx: 0.22, cy: 0.28 },
  { id: "nlp",     label: "Text",       project: "BERT fine-tuning on custom data", color: "#F97316", cx: 0.78, cy: 0.26 },
  { id: "audio",   label: "Audio",      project: "Audio spectrogram model",     color: "#8B7BD8", cx: 0.22, cy: 0.78 },
  { id: "multi",   label: "Combined", project: "Text + image + audio — 87% accuracy",    color: "#10B981", cx: 0.78, cy: 0.76 },
];

const TOKENS = ["[CLS]", "embed", "attn", "softmax", "dropout", "layer_norm", "ReLU", "conv2d", "pool", "logits", "[SEP]"];

type Node = { cluster: number; bx: number; by: number; x: number; y: number; vx: number; vy: number; r: number; z: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
type RainToken = { x: number; y: number; v: number; t: string; a: number };

export type ConstellationProps = {
  temperature: number; // 0..1
  density: number;     // 100..600
  attention: number;   // 0..1
  active: number | null;
  fuseAllTrigger: number; // increments to trigger
  resetTrigger: number;
  onHoverCluster?: (i: number | null) => void;
  onLog?: (line: string) => void;
};

export function LatentConstellation({
  temperature, density, attention, active, fuseAllTrigger, resetTrigger,
  onHoverCluster, onLog,
}: ConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const fusingRef = useRef<{ cluster: number | null; t0: number; phase: "spiral" | "burst" | "ring" } | null>(null);
  const fuseAllRef = useRef<{ t0: number; idx: number } | null>(null);

  // Refs for live props (avoid resetting RAF loop on every prop tick)
  const propsRef = useRef({ temperature, density, attention, active, hover });
  propsRef.current = { temperature, density, attention, active, hover };

  // Trigger handlers
  useEffect(() => {
    if (fuseAllTrigger === 0) return;
    fuseAllRef.current = { t0: performance.now(), idx: 0 };
    onLog?.("Combining all areas…");
  }, [fuseAllTrigger, onLog]);

  useEffect(() => {
    if (resetTrigger === 0) return;
    fusingRef.current = null;
    fuseAllRef.current = null;
    onLog?.("Reset complete");
  }, [resetTrigger, onLog]);

  // Click-to-fuse via active
  useEffect(() => {
    if (active === null) { fusingRef.current = null; return; }
    fusingRef.current = { cluster: active, t0: performance.now(), phase: "spiral" };
    onLog?.(`Focused on ${CLUSTERS[active].label}`);
  }, [active, onLog]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let nodes: Node[] = [];
    let sparks: Spark[] = [];
    let rain: RainToken[] = [];
    let W = 0, H = 0;
    let lastDensity = density;

    const seed = (count = propsRef.current.density) => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nodes = [];
      for (let i = 0; i < count; i++) {
        const ci = i % CLUSTERS.length;
        const c = CLUSTERS[ci];
        const a = Math.random() * Math.PI * 2;
        const rad = Math.pow(Math.random(), 0.7) * Math.min(W, H) * 0.13;
        const bx = c.cx * W + Math.cos(a) * rad;
        const by = c.cy * H + Math.sin(a) * rad;
        const z = Math.random();
        nodes.push({ cluster: ci, bx, by, x: bx, y: by, vx: 0, vy: 0, r: 1 + Math.random() * 1.8, z });
      }
      rain = Array.from({ length: 24 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        v: 0.3 + Math.random() * 0.8,
        t: TOKENS[Math.floor(Math.random() * TOKENS.length)],
        a: 0.04 + Math.random() * 0.06,
      }));
      lastDensity = count;
    };

    const draw = (t: number) => {
      const { temperature: tmp, attention: att, active: act, hover: hov, density: den } = propsRef.current;
      if (Math.abs(den - lastDensity) > 5) seed(den);

      ctx.clearRect(0, 0, W, H);

      // background dot grid
      ctx.fillStyle = "rgba(79,70,229,0.06)";
      for (let x = 0; x < W; x += 26) for (let y = 0; y < H; y += 26) {
        ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI * 2); ctx.fill();
      }

      // token rain
      ctx.font = "11px ui-monospace, JetBrains Mono, monospace";
      for (const r of rain) {
        r.y += r.v;
        if (r.y > H + 12) { r.y = -10; r.x = Math.random() * W; r.t = TOKENS[Math.floor(Math.random() * TOKENS.length)]; }
        ctx.fillStyle = `rgba(30,27,27,${r.a})`;
        ctx.fillText(r.t, r.x, r.y);
      }

      const coreX = W / 2, coreY = H / 2;

      // fusion core
      const pulse = 0.5 + 0.5 * Math.sin(t / 500);
      const coreR = 22 + pulse * 8;
      let coreFlash = 0;
      if (fusingRef.current?.phase === "burst") {
        const dt = (t - fusingRef.current.t0 - 800) / 400;
        coreFlash = Math.max(0, 1 - dt);
      }
      const grad = ctx.createRadialGradient(coreX, coreY, 0, coreX, coreY, 100);
      grad.addColorStop(0, `rgba(79,70,229,${0.55 + coreFlash * 0.4})`);
      grad.addColorStop(0.5, `rgba(249,115,22,${0.3 + coreFlash * 0.4})`);
      grad.addColorStop(1, "rgba(249,115,22,0)");
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(coreX, coreY, 100 + coreFlash * 60, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = `rgba(255,255,255,${0.92 + coreFlash * 0.08})`;
      ctx.beginPath(); ctx.arc(coreX, coreY, coreR + coreFlash * 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(79,70,229,0.75)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(coreX, coreY, coreR + 5, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(249,115,22,0.45)";
      ctx.beginPath(); ctx.arc(coreX, coreY, coreR + 12 + pulse * 6, 0, Math.PI * 2); ctx.stroke();

      // intra-cluster web
      if (att > 0.05) {
        const sample = Math.min(nodes.length, 80);
        for (let i = 0; i < sample; i++) {
          for (let j = i + 1; j < sample; j++) {
            const a = nodes[i], b = nodes[j];
            if (a.cluster !== b.cluster) continue;
            const dx = a.x - b.x, dy = a.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > 5000) continue;
            const alpha = att * (1 - Math.sqrt(d2) / 71) * 0.35;
            ctx.strokeStyle = CLUSTERS[a.cluster].color + Math.round(alpha * 255).toString(16).padStart(2, "0");
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // fuse-all sequencer (one cluster per 700ms)
      if (fuseAllRef.current) {
        const elapsed = t - fuseAllRef.current.t0;
        const idx = Math.floor(elapsed / 700);
        if (idx !== fuseAllRef.current.idx && idx < CLUSTERS.length) {
          fuseAllRef.current.idx = idx;
          fusingRef.current = { cluster: idx, t0: t, phase: "spiral" };
        } else if (idx >= CLUSTERS.length) {
          fuseAllRef.current = null;
        }
      }

      // fuse phase progression
      if (fusingRef.current) {
        const dt = t - fusingRef.current.t0;
        if (dt > 800 && fusingRef.current.phase === "spiral") {
          fusingRef.current.phase = "burst";
          // emit sparks
          const c = CLUSTERS[fusingRef.current.cluster!];
          for (let k = 0; k < 60; k++) {
            const a = Math.random() * Math.PI * 2;
            const v = 2 + Math.random() * 4;
            sparks.push({ x: coreX, y: coreY, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color: k % 2 === 0 ? c.color : "#F97316" });
          }
        } else if (dt > 1200 && fusingRef.current.phase === "burst") {
          fusingRef.current.phase = "ring";
        }
      }

      // nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const c = CLUSTERS[n.cluster];
        const isHover = hov === n.cluster;
        const isFusing = fusingRef.current?.cluster === n.cluster;

        const wob = Math.sin(t / 700 + i) * (0.3 + tmp * 1.4);
        let tx = n.bx + wob * 4;
        let ty = n.by + Math.cos(t / 800 + i) * (2 + tmp * 6);

        if (isFusing) {
          const dt = t - fusingRef.current!.t0;
          if (fusingRef.current!.phase === "spiral") {
            const p = Math.min(1, dt / 800);
            const a = (i / nodes.length) * Math.PI * 12 + p * 8;
            const rad = (1 - p) * 80;
            tx = coreX + Math.cos(a) * rad;
            ty = coreY + Math.sin(a) * rad;
          } else if (fusingRef.current!.phase === "ring") {
            const ringRad = 70 + (i % CLUSTERS.length) * 18;
            const a = (i / nodes.length) * Math.PI * 8 + t / 1500;
            tx = coreX + Math.cos(a) * ringRad;
            ty = coreY + Math.sin(a) * ringRad;
          }
        } else if (isHover && act === null) {
          // magnify slightly
          tx = n.bx + (coreX - n.bx) * 0.08;
          ty = n.by + (coreY - n.by) * 0.08;
        }

        n.vx += (tx - n.x) * 0.07;
        n.vy += (ty - n.y) * 0.07;
        n.vx *= 0.78; n.vy *= 0.78;
        n.x += n.vx; n.y += n.vy;

        if ((isHover || isFusing) && fusingRef.current?.phase !== "spiral") {
          // travelling pulse dots to core
          const dx = coreX - n.x, dy = coreY - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const p = ((t / 600) + i * 0.05) % 1;
          const px = n.x + dx * p, py = n.y + dy * p;
          ctx.strokeStyle = c.color + "30";
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(coreX, coreY); ctx.stroke();
          if (dist > 30) {
            ctx.fillStyle = c.color;
            ctx.beginPath(); ctx.arc(px, py, 1.4, 0, Math.PI * 2); ctx.fill();
          }
        }

        const scale = 0.7 + n.z * 0.6 + (isHover || isFusing ? 0.8 : 0);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = 0.55 + n.z * 0.4;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * scale, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // sparks
      sparks = sparks.filter((s) => {
        s.x += s.vx; s.y += s.vy;
        s.vx *= 0.96; s.vy *= 0.96;
        s.life -= 0.018;
        if (s.life <= 0) return false;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      });

      raf = requestAnimationFrame(draw);
    };

    seed();
    raf = requestAnimationFrame(draw);
    const onResize = () => seed();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  const onLeave = useCallback(() => { setHover(null); onHoverCluster?.(null); }, [onHoverCluster]);

  return (
    <div className="relative">
      <div ref={wrapRef} onMouseLeave={onLeave} className="relative h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 sm:h-[440px]">
        <canvas ref={canvasRef} className="block h-full w-full" />

        {CLUSTERS.map((c, i) => (
          <button
            key={c.id}
            onMouseEnter={() => { setHover(i); onHoverCluster?.(i); }}
            className="glass absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider transition-transform hover:scale-110"
            style={{
              left: `${c.cx * 100}%`,
              top: `${c.cy * 100}%`,
              color: c.color,
              borderColor: `${c.color}50`,
              boxShadow: `0 4px 20px ${c.color}33`,
            }}
          >
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: c.color }} />
            {c.label}
          </button>
        ))}

        <AnimatePresence>
          {active !== null && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="glass-strong absolute bottom-3 left-1/2 max-w-[85%] -translate-x-1/2 rounded-full px-4 py-1.5 text-center font-mono text-xs"
              style={{ color: CLUSTERS[active].color }}
            >
              {CLUSTERS[active].project}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          ML demo · 4 areas · {Math.round(propsRef.current.density)} points
        </div>
      </div>
    </div>
  );
}

export { CLUSTERS };

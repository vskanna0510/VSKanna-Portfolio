import { useEffect, useRef, useState } from "react";

type Metrics = { latency: number; tps: number; gpu: number; loss: number };

const SAMPLE_LOGS = [
  "Loaded image embeddings",
  "Tokenized text input",
  "Ran attention layer",
  "Built audio spectrogram",
  "Merged feature vectors",
  "Prediction complete",
  "Saved checkpoint",
  "Updated learning rate",
  "Gradient step done",
  "Cross-modal check passed",
];

function ConfidenceSparkline({ history }: { history: number[] }) {
  if (history.length < 2) return null;
  const W = 200,
    H = 36;
  const max = 1,
    min = 0;
  const step = W / (history.length - 1);
  const d = history
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${H - ((v - min) / (max - min)) * H}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-full">
      <defs>
        <linearGradient id="conf-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#F97316" />
        </linearGradient>
      </defs>
      <path d={d} fill="none" stroke="url(#conf-grad)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Bar({
  label,
  value,
  max,
  color,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  unit?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
        <span className="text-muted-foreground">{label}</span>
        <span style={{ color }}>
          {value.toFixed(unit === "ms" ? 0 : 2)}
          {unit ?? ""}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
    </div>
  );
}

export type AILabTelemetryHandle = {
  pushLog: (line: string) => void;
};

export function AILabTelemetry({ activeLabel }: { activeLabel: string | null }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ latency: 142, tps: 18.4, gpu: 64, loss: 0.42 });
  const [confidence, setConfidence] = useState<number[]>([0.6, 0.62, 0.64, 0.66, 0.7]);
  const startRef = useRef(performance.now());

  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      const t = ((performance.now() - startRef.current) / 1000).toFixed(2);
      const line = SAMPLE_LOGS[Math.floor(Math.random() * SAMPLE_LOGS.length)];
      setLogs((prev) => [...prev.slice(-7), `[t+${t}s] ${line}`]);
      setMetrics((m) => ({
        latency: clamp(m.latency + (Math.random() - 0.5) * 30, 80, 320),
        tps: clamp(m.tps + (Math.random() - 0.5) * 4, 4, 48),
        gpu: clamp(m.gpu + (Math.random() - 0.5) * 10, 20, 96),
        loss: clamp(m.loss + (Math.random() - 0.5) * 0.05, 0.05, 0.9),
      }));
      setConfidence((c) => {
        const next = clamp((c[c.length - 1] ?? 0.7) + (Math.random() - 0.45) * 0.08, 0.2, 0.98);
        const arr = [...c, next];
        return arr.length > 30 ? arr.slice(-30) : arr;
      });
      timer = window.setTimeout(tick, 600 + Math.random() * 800);
    };
    let timer = window.setTimeout(tick, 400);
    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, []);

  // Push activeLabel as log when changes
  useEffect(() => {
    if (!activeLabel) return;
    const t = ((performance.now() - startRef.current) / 1000).toFixed(2);
    setLogs((prev) => [...prev.slice(-7), `[t+${t}s] Focus: ${activeLabel}`]);
  }, [activeLabel]);

  const lastConf = confidence[confidence.length - 1] ?? 0;

  return (
    <div className="glass-strong flex h-full flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Training log
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-600">
            live
          </span>
        </div>
      </div>

      <div className="h-32 overflow-hidden rounded-lg border border-white/10 bg-black/[0.02] p-3 font-mono text-[10px] leading-relaxed text-foreground/80">
        {logs.map((l, i) => (
          <div key={i} className="truncate" style={{ opacity: 0.4 + (i / logs.length) * 0.6 }}>
            <span className="text-[var(--coral)]">›</span> {l}
          </div>
        ))}
      </div>

      <div className="space-y-2.5">
        <Bar label="Latency" value={metrics.latency} max={320} color="#4F46E5" unit="ms" />
        <Bar label="Tokens/s" value={metrics.tps} max={48} color="#F97316" />
        <Bar label="GPU" value={metrics.gpu} max={100} color="#8B7BD8" unit="%" />
        <Bar label="Loss" value={metrics.loss} max={1} color="#10B981" />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
          <span className="text-muted-foreground">Confidence</span>
          <span className="text-[var(--coral)]">{(lastConf * 100).toFixed(1)}%</span>
        </div>
        <ConfidenceSparkline history={confidence} />
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

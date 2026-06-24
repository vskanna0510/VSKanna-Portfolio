import { useCallback, useEffect, useState } from "react";
import { GameShell } from "./GameShell";

type Grid = number[][];
const SIZE = 4;

const empty = (): Grid => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

function addTile(g: Grid): Grid {
  const empties: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!g[r][c]) empties.push([r, c]);
  if (!empties.length) return g;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
}

function rotate(g: Grid): Grid {
  const n = empty();
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) n[c][SIZE - 1 - r] = g[r][c];
  return n;
}

function slideLeft(g: Grid): { grid: Grid; gained: number; moved: boolean } {
  let gained = 0, moved = false;
  const n: Grid = g.map(row => {
    const filtered = row.filter(v => v);
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) { filtered[i] *= 2; gained += filtered[i]; filtered.splice(i + 1, 1); }
    }
    while (filtered.length < SIZE) filtered.push(0);
    if (row.some((v, i) => v !== filtered[i])) moved = true;
    return filtered;
  });
  return { grid: n, gained, moved };
}

const TILE_COLOR: Record<number, string> = {
  0: "rgba(255,255,255,0.04)", 2: "#4F46E5", 4: "#5b51e8", 8: "#8B7BD8",
  16: "#F97316", 32: "#fb8a3c", 64: "#ff9d52", 128: "#FFB454", 256: "#ffc873",
  512: "#FF6B6B", 1024: "#ff8585", 2048: "#fff",
};

export function Twenty48({ onClose }: { onClose: () => void }) {
  const [grid, setGrid] = useState<Grid>(() => addTile(addTile(empty())));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => Number(typeof window !== "undefined" ? localStorage.getItem("arc-2048-best") : 0) || 0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);

  const reset = useCallback(() => {
    setGrid(addTile(addTile(empty())));
    setScore(0);
  }, []);

  const move = useCallback((dir: 0 | 1 | 2 | 3) => {
    if (paused) return;
    let g = grid.map(r => [...r]);
    for (let i = 0; i < dir; i++) g = rotate(g);
    const { grid: slid, gained, moved } = slideLeft(g);
    g = slid;
    for (let i = 0; i < (4 - dir) % 4; i++) g = rotate(g);
    if (moved) {
      addTile(g);
      const ns = score + gained;
      setGrid(g.map(r => [...r]));
      setScore(ns);
      if (ns > best) { setBest(ns); localStorage.setItem("arc-2048-best", String(ns)); }
      if (!muted && gained > 0) {
        try {
          const a = new (window.AudioContext || (window as any).webkitAudioContext)();
          const o = a.createOscillator(); const gN = a.createGain();
          o.frequency.value = 400 + Math.log2(gained) * 80; o.type = "sine"; gN.gain.value = 0.06;
          o.connect(gN); gN.connect(a.destination); o.start();
          setTimeout(() => { o.stop(); a.close(); }, 90);
        } catch {}
      }
    }
  }, [grid, score, best, paused, muted]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(0);
      else if (e.key === "ArrowUp") move(1);
      else if (e.key === "ArrowRight") move(2);
      else if (e.key === "ArrowDown") move(3);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [move]);

  return (
    <GameShell
      title="2048" controls="Arrow keys to merge"
      score={score} best={best}
      onClose={onClose}
      onRestart={reset}
      paused={paused} setPaused={setPaused}
      muted={muted} setMuted={setMuted}
    >
      <div className="relative mx-auto aspect-square w-full max-w-md rounded-xl border border-white/10 bg-[#0a0a12] p-3">
        <div className="grid h-full grid-cols-4 gap-2">
          {grid.flat().map((v, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-lg font-mono text-2xl font-bold transition-all"
              style={{
                background: TILE_COLOR[v] ?? "#fff",
                color: v >= 8 ? "#0a0a12" : v >= 2 ? "#fff" : "transparent",
                boxShadow: v ? `0 4px 14px ${TILE_COLOR[v]}55` : "none",
              }}
            >
              {v || ""}
            </div>
          ))}
        </div>
        <div className="crt-overlay pointer-events-none absolute inset-0 rounded-xl" />
      </div>
    </GameShell>
  );
}

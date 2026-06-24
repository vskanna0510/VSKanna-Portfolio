import { useEffect, useRef, useState } from "react";
import { GameShell, useBlip, useBestScore } from "./GameShell";

const SYMBOLS = ["{}", "</>", "();", "[]", "=>", "&&", "||", "++", "::", "fn"];
const COLORS = ["#4F46E5", "#F97316", "#8B7BD8", "#10B981"];

type Drop = { x: number; y: number; v: number; t: string; c: string };

export function CodeCatch({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [over, setOver] = useState(false);
  const [best, updateBest] = useBestScore("arcade.catch.best");
  const blip = useBlip(muted);
  const stateRef = useRef({ paused });
  stateRef.current = { paused };
  const restartKey = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = 720,
      H = 420;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let bx = W / 2;
    const bw = 90,
      bh = 14;
    let drops: Drop[] = [];
    let s = 0,
      l = 3;
    let spawn = 0;
    let speed = 2.2;
    let raf = 0;
    const keys: Record<string, boolean> = {};
    let mouseX: number | null = null;

    const spawnDrop = () => {
      drops.push({
        x: 30 + Math.random() * (W - 60),
        y: -20,
        v: speed + Math.random() * 1.5,
        t: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const loop = () => {
      if (!stateRef.current.paused && !over) {
        if (keys["ArrowLeft"] || keys["a"]) bx -= 7;
        if (keys["ArrowRight"] || keys["d"]) bx += 7;
        if (mouseX !== null) bx = mouseX;
        bx = Math.max(bw / 2, Math.min(W - bw / 2, bx));

        spawn++;
        if (spawn > Math.max(28, 60 - Math.floor(s / 5) * 4)) {
          spawn = 0;
          spawnDrop();
        }
        speed = 2.2 + s * 0.04;

        drops.forEach((d) => {
          d.y += d.v;
        });
        drops = drops.filter((d) => {
          // caught?
          if (d.y > H - 30 && d.y < H - 10 && Math.abs(d.x - bx) < bw / 2) {
            s++;
            setScore(s);
            blip(560 + Math.random() * 120);
            return false;
          }
          if (d.y > H) {
            l--;
            setLives(l);
            blip(160, 0.15, "sawtooth");
            if (l <= 0) {
              setOver(true);
              updateBest(s);
            }
            return false;
          }
          return true;
        });
      }

      // render
      ctx.fillStyle = "#FBFBF9";
      ctx.fillRect(0, 0, W, H);
      // bucket
      ctx.fillStyle = "#1E1B1B";
      ctx.fillRect(bx - bw / 2, H - 30, bw, bh);
      ctx.fillStyle = "#4F46E5";
      ctx.fillRect(bx - bw / 2, H - 30, bw, 3);

      ctx.font = "bold 20px ui-monospace, JetBrains Mono, monospace";
      ctx.textAlign = "center";
      drops.forEach((d) => {
        ctx.fillStyle = d.c;
        ctx.fillText(d.t, d.x, d.y);
      });

      // lives
      ctx.textAlign = "left";
      ctx.font = "12px ui-monospace, monospace";
      ctx.fillStyle = "#F97316";
      ctx.fillText("♥".repeat(Math.max(0, l)), 12, 22);

      raf = requestAnimationFrame(loop);
    };

    const kd = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) e.preventDefault();
    };
    const ku = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };
    const mm = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - r.left) / r.width) * W;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    canvas.addEventListener("mousemove", mm);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      canvas.removeEventListener("mousemove", mm);
    };
  }, [restartKey.current]);

  const restart = () => {
    restartKey.current++;
    setOver(false);
    setScore(0);
    setLives(3);
  };

  return (
    <GameShell
      title="Code Catch"
      controls="← / → or mouse · don't drop the syntax"
      score={score}
      best={best}
      onClose={onClose}
      onRestart={restart}
      paused={paused}
      setPaused={setPaused}
      muted={muted}
      setMuted={setMuted}
    >
      <div className="relative">
        <canvas ref={canvasRef} className="block w-full" style={{ aspectRatio: "720 / 420" }} />
        {over && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="glass-strong rounded-2xl px-6 py-4 text-center">
              <div className="font-display text-2xl font-bold">Game over</div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                caught {score} · best {best}
              </div>
              <button
                onClick={restart}
                className="mt-3 rounded-full px-4 py-1.5 text-xs font-semibold text-primary-foreground"
                style={{ backgroundImage: "var(--gradient-brand)" }}
              >
                Play again
              </button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}

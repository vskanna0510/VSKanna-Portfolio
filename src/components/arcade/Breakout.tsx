import { useEffect, useRef, useState } from "react";
import { GameShell } from "./GameShell";

const W = 560;
const H = 360;
const ROWS = 5;
const COLS = 10;
const BRICK_W = W / COLS;
const BRICK_H = 18;

export function Breakout({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(
    () =>
      Number(typeof window !== "undefined" ? localStorage.getItem("arc-breakout-best") : 0) || 0,
  );
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let bx = W / 2,
      by = H - 40,
      vx = 3.2,
      vy = -3.2;
    let px = W / 2 - 50;
    const pw = 100;
    const bricks: { x: number; y: number; alive: boolean; color: string }[] = [];
    const colors = ["#4F46E5", "#F97316", "#8B7BD8", "#FF6B6B", "#FFB454"];
    for (let r = 0; r < ROWS; r++)
      for (let i = 0; i < COLS; i++)
        bricks.push({ x: i * BRICK_W, y: 30 + r * BRICK_H, alive: true, color: colors[r] });

    let s = 0;
    const keys: Record<string, boolean> = {};
    const kd = (e: KeyboardEvent) => {
      keys[e.key] = true;
    };
    const ku = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };
    const mm = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width) * W - pw / 2;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    c.addEventListener("mousemove", mm);

    const beep = (f: number) => {
      if (muted) return;
      try {
        const w = window as Window & { webkitAudioContext?: typeof AudioContext };
        const AudioCtx = window.AudioContext ?? w.webkitAudioContext;
        if (!AudioCtx) return;
        const a = new AudioCtx();
        const o = a.createOscillator();
        const g = a.createGain();
        o.frequency.value = f;
        o.type = "square";
        g.gain.value = 0.05;
        o.connect(g);
        g.connect(a.destination);
        o.start();
        setTimeout(() => {
          o.stop();
          a.close();
        }, 60);
      } catch {
        /* audio unavailable */
      }
    };

    const tick = () => {
      if (!paused) {
        if (keys["ArrowLeft"]) px -= 6;
        if (keys["ArrowRight"]) px += 6;
        px = Math.max(0, Math.min(W - pw, px));

        bx += vx;
        by += vy;
        if (bx < 6 || bx > W - 6) {
          vx *= -1;
          beep(440);
        }
        if (by < 6) {
          vy *= -1;
          beep(520);
        }
        if (by > H - 18 && bx > px && bx < px + pw) {
          vy = -Math.abs(vy);
          vx += ((bx - (px + pw / 2)) / pw) * 2;
          beep(620);
        }
        if (by > H) {
          if (s > best) {
            setBest(s);
            localStorage.setItem("arc-breakout-best", String(s));
          }
          bx = W / 2;
          by = H - 40;
          vx = 3.2;
          vy = -3.2;
          s = 0;
          setScore(0);
          bricks.forEach((b) => (b.alive = true));
        }
        for (const b of bricks) {
          if (!b.alive) continue;
          if (bx > b.x && bx < b.x + BRICK_W && by > b.y && by < b.y + BRICK_H) {
            b.alive = false;
            vy *= -1;
            s += 10;
            setScore(s);
            beep(880);
            break;
          }
        }
      }

      ctx.fillStyle = "#0a0a12";
      ctx.fillRect(0, 0, W, H);
      // bricks
      for (const b of bricks) {
        if (!b.alive) continue;
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.fillRect(b.x + 2, b.y + 2, BRICK_W - 4, BRICK_H - 4);
      }
      ctx.shadowBlur = 0;
      // paddle
      ctx.fillStyle = "#F97316";
      ctx.fillRect(px, H - 12, pw, 8);
      // ball
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(bx, by, 5, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      c.removeEventListener("mousemove", mm);
    };
  }, [paused, muted, restartKey]);

  return (
    <GameShell
      title="Breakout"
      controls="← → or mouse"
      score={score}
      best={best}
      onClose={onClose}
      onRestart={() => {
        setScore(0);
        setRestartKey((k) => k + 1);
      }}
      paused={paused}
      setPaused={setPaused}
      muted={muted}
      setMuted={setMuted}
    >
      <div className="relative">
        <canvas
          ref={ref}
          width={W}
          height={H}
          className="w-full rounded-xl border border-white/10"
        />
        <div className="crt-overlay pointer-events-none absolute inset-0 rounded-xl" />
      </div>
    </GameShell>
  );
}

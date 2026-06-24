import { useEffect, useRef, useState } from "react";
import { GameShell, useBlip, useBestScore } from "./GameShell";

export function PixelPong({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState({ p: 0, a: 0 });
  const [over, setOver] = useState<string | null>(null);
  const [best, updateBest] = useBestScore("arcade.pong.best");
  const blip = useBlip(muted);
  const stateRef = useRef({ paused, muted });
  stateRef.current = { paused, muted };

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

    let py = H / 2 - 40,
      ay = H / 2 - 40;
    let bx = W / 2,
      by = H / 2,
      vx = 4 * (Math.random() < 0.5 ? -1 : 1),
      vy = 3 * (Math.random() < 0.5 ? -1 : 1);
    let sp = 0,
      sa = 0;
    const keys: Record<string, boolean> = {};
    let mouseY: number | null = null;
    let raf = 0;

    const reset = (winner: "p" | "a") => {
      if (winner === "p") sp++;
      else sa++;
      setScore({ p: sp, a: sa });
      bx = W / 2;
      by = H / 2;
      vx = winner === "p" ? 4 : -4;
      vy = 3 * (Math.random() < 0.5 ? -1 : 1);
      if (sp >= 5 || sa >= 5) {
        setOver(sp > sa ? "You win!" : "AI wins");
        if (sp > sa) updateBest(sp);
      }
    };

    const draw = () => {
      if (!stateRef.current.paused && !over) {
        // input
        if (keys["ArrowUp"] || keys["w"]) py -= 6;
        if (keys["ArrowDown"] || keys["s"]) py += 6;
        if (mouseY !== null) py = mouseY - 40;
        py = Math.max(0, Math.min(H - 80, py));

        // AI follows ball with delay
        const aTarget = by - 40;
        ay += Math.sign(aTarget - ay) * Math.min(4.2, Math.abs(aTarget - ay));
        ay = Math.max(0, Math.min(H - 80, ay));

        bx += vx;
        by += vy;
        if (by < 6 || by > H - 6) {
          vy *= -1;
          blip(220, 0.04);
        }
        // Player paddle collision
        if (bx < 28 && by > py && by < py + 80) {
          vx = Math.abs(vx) * 1.05;
          vy += (by - (py + 40)) * 0.08;
          blip(440);
        }
        if (bx > W - 28 && by > ay && by < ay + 80) {
          vx = -Math.abs(vx) * 1.05;
          vy += (by - (ay + 40)) * 0.08;
          blip(330);
        }
        if (bx < 0) {
          blip(150, 0.2, "sawtooth");
          reset("a");
        }
        if (bx > W) {
          blip(660, 0.2, "sawtooth");
          reset("p");
        }
      }

      // render
      ctx.fillStyle = "#FBFBF9";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(30,27,27,0.08)";
      for (let y = 0; y < H; y += 14) ctx.fillRect(W / 2 - 1, y, 2, 8);
      ctx.fillStyle = "#4F46E5";
      ctx.fillRect(16, py, 8, 80);
      ctx.fillStyle = "#F97316";
      ctx.fillRect(W - 24, ay, 8, 80);
      ctx.fillStyle = "#1E1B1B";
      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };

    const onKey = (e: KeyboardEvent, down: boolean) => {
      keys[e.key] = down;
      if (["ArrowUp", "ArrowDown"].includes(e.key)) e.preventDefault();
    };
    const kd = (e: KeyboardEvent) => onKey(e, true);
    const ku = (e: KeyboardEvent) => onKey(e, false);
    const mm = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseY = ((e.clientY - r.top) / r.height) * H;
    };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    canvas.addEventListener("mousemove", mm);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", kd);
      window.removeEventListener("keyup", ku);
      canvas.removeEventListener("mousemove", mm);
    };
  }, []);

  const restart = () => {
    setScore({ p: 0, a: 0 });
    setOver(null); /* re-mount via key */
  };

  return (
    <GameShell
      key={over === null ? "live" : "done"}
      title="Pixel Pong"
      controls="↑ / ↓ or mouse · first to 5 wins"
      score={`${score.p} – ${score.a}`}
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
              <div className="font-display text-2xl font-bold">{over}</div>
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

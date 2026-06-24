import { useEffect, useRef, useState } from "react";
import { GameShell, useBlip, useBestScore } from "./GameShell";

const CELL = 20;
const COLS = 30;
const ROWS = 18;

export function NeuralSnake({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [best, updateBest] = useBestScore("arcade.snake.best");
  const blip = useBlip(muted);
  const stateRef = useRef({ paused });
  stateRef.current = { paused };
  const restartKey = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const W = COLS * CELL, H = ROWS * CELL;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let snake = [{ x: 10, y: 9 }, { x: 9, y: 9 }, { x: 8, y: 9 }];
    let dir = { x: 1, y: 0 }, nextDir = { x: 1, y: 0 };
    let food = randFood(snake);
    let s = 0;
    let tickMs = 130;
    let lastTick = 0;
    let raf = 0;

    const step = () => {
      dir = nextDir;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snake.some((s) => s.x === head.x && s.y === head.y)) {
        setOver(true); updateBest(s); blip(120, 0.25, "sawtooth");
        return false;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        s++; setScore(s); blip(660); food = randFood(snake);
        tickMs = Math.max(60, tickMs - 3);
      } else snake.pop();
      return true;
    };

    const render = () => {
      ctx.fillStyle = "#FBFBF9"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(79,70,229,0.06)"; ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke(); }

      // food (token)
      ctx.fillStyle = "#F97316";
      ctx.fillRect(food.x * CELL + 3, food.y * CELL + 6, CELL - 6, CELL - 12);
      ctx.fillStyle = "#FBFBF9"; ctx.font = "bold 9px ui-monospace, monospace";
      ctx.fillText("0x", food.x * CELL + 5, food.y * CELL + 13);

      snake.forEach((seg, i) => {
        const t = i / snake.length;
        ctx.fillStyle = i === 0 ? "#4F46E5" : `rgba(79,70,229,${0.85 - t * 0.55})`;
        ctx.fillRect(seg.x * CELL + 2, seg.y * CELL + 2, CELL - 4, CELL - 4);
      });
    };

    const loop = (t: number) => {
      if (!stateRef.current.paused && !over) {
        if (t - lastTick > tickMs) { lastTick = t; if (!step()) { render(); return; } }
      }
      render();
      raf = requestAnimationFrame(loop);
    };

    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if ((k === "ArrowUp" || k === "w") && dir.y !== 1) nextDir = { x: 0, y: -1 };
      else if ((k === "ArrowDown" || k === "s") && dir.y !== -1) nextDir = { x: 0, y: 1 };
      else if ((k === "ArrowLeft" || k === "a") && dir.x !== 1) nextDir = { x: -1, y: 0 };
      else if ((k === "ArrowRight" || k === "d") && dir.x !== -1) nextDir = { x: 1, y: 0 };
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(k)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("keydown", onKey); };
  }, [restartKey.current]);

  const restart = () => { restartKey.current++; setOver(false); setScore(0); };

  return (
    <GameShell
      title="Neural Snake"
      controls="arrows / WASD · eat tokens, grow longer"
      score={score} best={best}
      onClose={onClose} onRestart={restart}
      paused={paused} setPaused={setPaused}
      muted={muted} setMuted={setMuted}
    >
      <div className="relative">
        <canvas ref={canvasRef} className="block w-full" style={{ aspectRatio: `${COLS} / ${ROWS}` }} />
        {over && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="glass-strong rounded-2xl px-6 py-4 text-center">
              <div className="font-display text-2xl font-bold">Game over</div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">score {score} · best {best}</div>
              <button onClick={restart} className="mt-3 rounded-full px-4 py-1.5 text-xs font-semibold text-primary-foreground" style={{ backgroundImage: "var(--gradient-brand)" }}>Play again</button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}

function randFood(snake: { x: number; y: number }[]) {
  while (true) {
    const f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

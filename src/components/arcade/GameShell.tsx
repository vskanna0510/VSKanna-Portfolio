import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Pause, Play, RotateCcw, X, Zap } from "lucide-react";

type Props = {
  title: string;
  controls: string;
  score?: number | string;
  best?: number;
  combo?: number;
  powerUp?: string | null;
  onClose: () => void;
  onRestart: () => void;
  paused: boolean;
  setPaused: (b: boolean) => void;
  muted: boolean;
  setMuted: (b: boolean) => void;
  children: React.ReactNode;
};

/** Magnetic, glowing icon button */
function HudButton({ onClick, children, label }: { onClick: () => void; children: React.ReactNode; label: string }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      whileHover={{ scale: 1.12, y: -2 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 18 }}
      className="glass relative grid h-9 w-9 place-items-center rounded-lg transition-shadow hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
    >
      {children}
    </motion.button>
  );
}

export function GameShell({
  title, controls, score, best, combo = 0, powerUp = null,
  onClose, onRestart, paused, setPaused, muted, setMuted, children,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong relative w-full max-w-3xl overflow-hidden rounded-3xl p-5"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--coral)]">arcade · game</div>
            <h3 className="font-display text-xl font-bold">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {typeof score !== "undefined" && (
              <div className="relative flex items-center gap-3 rounded-lg border border-white/10 px-3 py-1.5 text-xs">
                <div>
                  <span className="text-muted-foreground">score</span>{" "}
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={String(score)}
                      initial={{ y: -8, opacity: 0, scale: 1.4 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="ml-1 inline-block font-mono font-bold text-[var(--coral)]"
                      style={{ textShadow: "0 0 12px rgba(255,107,107,0.6)" }}
                    >
                      {score}
                    </motion.span>
                  </AnimatePresence>
                </div>
                {typeof best !== "undefined" && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <div>
                      <span className="text-muted-foreground">best</span>{" "}
                      <span className="ml-1 font-mono font-bold text-[var(--amber)]">{best}</span>
                    </div>
                  </>
                )}
                {combo > 1 && (
                  <motion.div
                    key={combo}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1 rounded-full bg-[var(--coral)]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--coral)]"
                    style={{ boxShadow: "0 0 14px rgba(255,107,107,0.45)" }}
                  >
                    <Zap className="h-2.5 w-2.5" /> x{combo}
                  </motion.div>
                )}
              </div>
            )}
            <HudButton onClick={() => setPaused(!paused)} label={paused ? "Resume" : "Pause"}>
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </HudButton>
            <HudButton onClick={() => setMuted(!muted)} label={muted ? "Unmute" : "Mute"}>
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </HudButton>
            <HudButton onClick={onRestart} label="Restart"><RotateCcw className="h-4 w-4" /></HudButton>
            <HudButton onClick={onClose} label="Close"><X className="h-4 w-4" /></HudButton>
          </div>
        </div>

        <AnimatePresence>
          {powerUp && (
            <motion.div
              key={powerUp}
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className="absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full border border-[var(--amber)]/40 bg-[var(--amber)]/15 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--amber)]"
              style={{ boxShadow: "0 0 24px rgba(255,180,84,0.45)" }}
            >
              Power-up: {powerUp}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#FBFBF9]">
          {children}
          <div className="crt-overlay pointer-events-none absolute inset-0" />
          <AnimatePresence>
            {paused && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center bg-[var(--background)]/70 font-display text-3xl font-bold text-foreground"
              >
                Paused
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {controls}
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Tiny Web Audio blip */
export function useBlip(muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  useEffect(() => () => { ctxRef.current?.close(); }, []);
  return (freq = 440, dur = 0.08, type: OscillatorType = "square") => {
    if (muted) return;
    try {
      if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = ctxRef.current!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = 0.05;
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + dur);
    } catch {}
  };
}

/** localStorage best-score */
export function useBestScore(key: string) {
  const [best, setBest] = useState(0);
  useEffect(() => {
    try { const v = parseInt(localStorage.getItem(key) ?? "0", 10); if (!isNaN(v)) setBest(v); } catch {}
  }, [key]);
  const update = (n: number) => {
    if (n > best) {
      setBest(n);
      try { localStorage.setItem(key, String(n)); } catch {}
    }
  };
  return [best, update] as const;
}

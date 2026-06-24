import { useEffect, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * Canvas-based "neural pathways" route transition.
 *
 * Performance:
 *  - All geometry (nodes, edges, streaks) allocated ONCE per mount and reused.
 *  - No object literals, arrays, or gradients created inside the RAF loop.
 *  - DPR capped at 1 on touch / narrow screens.
 *  - FPS throttled (30 mobile / 60 desktop).
 *  - Pauses on `visibilitychange` (tab backgrounded).
 *  - Low-motion fallback: when `prefers-reduced-motion` is set, the heavy
 *    pulse/streak path is skipped in favor of a single soft radial glow that
 *    fades in/out — no per-frame trig, no edges, no particles.
 */
export function NeuralTransitionFX() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia?.("(pointer: coarse)").matches || window.innerWidth < 640;
    const isMid = !isMobile && window.innerWidth < 1100;

    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 1.75);
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    elapsedRef.current = 0;
    lastTickRef.current = performance.now();

    const onVisibility = () => {
      pausedRef.current = document.hidden;
      if (!pausedRef.current) {
        lastTickRef.current = performance.now();
        if (rafRef.current == null) rafRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ============================================================
    // LOW-MOTION FALLBACK — lightweight glow only
    // ============================================================
    if (reduced) {
      const DURATION = 600;
      const cx = W / 2;
      const cy = H / 2;
      const radius = Math.max(W, H) * 0.6;

      const loopReduced = (now: number) => {
        rafRef.current = null;
        if (pausedRef.current) return;
        const dt = now - lastTickRef.current;
        lastTickRef.current = now;
        elapsedRef.current += dt;

        const t = Math.min(1, elapsedRef.current / DURATION);
        const alpha = (t < 0.5 ? t * 2 : (1 - t) * 2) * 0.4;

        ctx.clearRect(0, 0, W, H);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        g.addColorStop(0, `rgba(139,123,216,${alpha})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        if (elapsedRef.current < DURATION) {
          rafRef.current = requestAnimationFrame(loopReduced);
        } else {
          ctx.clearRect(0, 0, W, H);
        }
      };
      const loop = loopReduced;
      rafRef.current = requestAnimationFrame(loop);

      return () => {
        document.removeEventListener("visibilitychange", onVisibility);
        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    }

    // ============================================================
    // FULL EXPERIENCE — pre-allocated typed arrays, zero per-frame alloc
    // ============================================================
    const NODE_COUNT = isMobile ? 12 : isMid ? 20 : 28;
    const STREAK_COUNT = isMobile ? 20 : isMid ? 40 : 60;
    const EDGE_MAX_DIST = isMobile ? 200 : 260;
    const DURATION = isMobile ? 800 : 1100;
    const TARGET_FPS = isMobile ? 30 : 60;
    const FRAME_MS = 1000 / TARGET_FPS;

    // Nodes: x, y, z, r
    const nodeX = new Float32Array(NODE_COUNT);
    const nodeY = new Float32Array(NODE_COUNT);
    const nodeZ = new Float32Array(NODE_COUNT);
    const nodeR = new Float32Array(NODE_COUNT);
    for (let i = 0; i < NODE_COUNT; i++) {
      nodeX[i] = Math.random() * W;
      nodeY[i] = Math.random() * H;
      nodeZ[i] = Math.random() * 0.8 + 0.2;
      nodeR[i] = Math.random() * 2 + 1.5;
    }

    // Edges: index pairs + distance, pre-computed once
    const edgeBuf: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodeX[i] - nodeX[j];
        const dy = nodeY[i] - nodeY[j];
        const d = Math.hypot(dx, dy);
        if (d < EDGE_MAX_DIST) {
          edgeBuf.push(i, j, d);
        }
      }
    }
    const edgeCount = edgeBuf.length / 3;
    const edgeA = new Uint16Array(edgeCount);
    const edgeB = new Uint16Array(edgeCount);
    const edgeD = new Float32Array(edgeCount);
    for (let k = 0; k < edgeCount; k++) {
      edgeA[k] = edgeBuf[k * 3];
      edgeB[k] = edgeBuf[k * 3 + 1];
      edgeD[k] = edgeBuf[k * 3 + 2];
    }

    // Streaks
    const sX = new Float32Array(STREAK_COUNT);
    const sY = new Float32Array(STREAK_COUNT);
    const sVX = new Float32Array(STREAK_COUNT);
    const sVY = new Float32Array(STREAK_COUNT);
    const sLife = new Float32Array(STREAK_COUNT);
    for (let i = 0; i < STREAK_COUNT; i++) {
      sX[i] = W / 2 + (Math.random() - 0.5) * 200;
      sY[i] = H / 2 + (Math.random() - 0.5) * 200;
      sVX[i] = (Math.random() - 0.5) * 18;
      sVY[i] = (Math.random() - 0.5) * 18;
      sLife[i] = Math.random();
    }

    const cx = W / 2;
    const cy = H / 2;
    const fogRadius = Math.max(W, H) * 0.7;

    const loop = (now: number) => {
      rafRef.current = null;
      if (pausedRef.current) return;

      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      elapsedRef.current += dt;

      if (dt < FRAME_MS * 0.85 && elapsedRef.current < DURATION) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      const t = Math.min(1, elapsedRef.current / DURATION);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const alpha = t < 0.5 ? e * 2 : (1 - e) * 2;

      ctx.clearRect(0, 0, W, H);

      // Fog (one gradient per frame — necessary but cheap)
      const fog = ctx.createRadialGradient(cx, cy, 0, cx, cy, fogRadius);
      fog.addColorStop(0, `rgba(79,70,229,${0.22 * alpha})`);
      fog.addColorStop(0.6, `rgba(249,115,22,${0.1 * alpha})`);
      fog.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = "lighter";

      // Streaks
      ctx.lineWidth = 1.2;
      for (let i = 0; i < STREAK_COUNT; i++) {
        const life = sLife[i] + 0.02;
        sLife[i] = life > 1 ? 0 : life;
        const k = 0.4 + sLife[i];
        sX[i] += sVX[i] * k;
        sY[i] += sVY[i] * k;
        const a = (1 - Math.abs(0.5 - sLife[i]) * 2) * alpha * 0.7;
        ctx.strokeStyle = `rgba(255,107,107,${a})`;
        ctx.beginPath();
        ctx.moveTo(sX[i], sY[i]);
        ctx.lineTo(sX[i] - sVX[i] * 4, sY[i] - sVY[i] * 4);
        ctx.stroke();
      }

      // Edges + travelling pulse
      ctx.lineWidth = 0.9;
      const tau = t * Math.PI * 2;
      const t2 = t * 2;
      for (let k = 0; k < edgeCount; k++) {
        const ax = nodeX[edgeA[k]];
        const ay = nodeY[edgeA[k]];
        const bx = nodeX[edgeB[k]];
        const by = nodeY[edgeB[k]];
        const d = edgeD[k];
        const pulse = (Math.sin(tau + d * 0.02) + 1) * 0.5;
        const op = (1 - d / EDGE_MAX_DIST) * alpha * (0.35 + pulse * 0.45);
        ctx.strokeStyle = `rgba(139,123,216,${op})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        const tp = (t2 + d * 0.003) % 1;
        ctx.fillStyle = `rgba(255,200,120,${alpha})`;
        ctx.beginPath();
        ctx.arc(ax + (bx - ax) * tp, ay + (by - ay) * tp, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Nodes
      for (let i = 0; i < NODE_COUNT; i++) {
        const x = nodeX[i];
        const y = nodeY[i];
        const r = nodeR[i] * (1 + Math.sin(tau + x) * 0.3) * 6;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,255,255,${alpha * nodeZ[i]})`);
        g.addColorStop(0.4, `rgba(249,115,22,${alpha * 0.6 * nodeZ[i]})`);
        g.addColorStop(1, "rgba(79,70,229,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      if (elapsedRef.current < DURATION) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, W, H);
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[120] mix-blend-screen"
      aria-hidden
    />
  );
}
